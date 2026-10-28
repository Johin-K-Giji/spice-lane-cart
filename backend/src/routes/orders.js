import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { db, transaction } from "../db.js";
import { HttpError, requireAdmin } from "../middleware.js";
import { razorpay, verifyPaymentSignature } from "../razorpay.js";

export const ordersRouter = Router();

const ORDER_STATUSES = ["created", "paid", "failed", "shipped", "delivered", "cancelled"];

/** Razorpay truncates note values past 256 characters. */
const NOTE_MAX = 256;
const clip = (value) => String(value).trim().slice(0, NOTE_MAX);

// Same rules as validateBuyer() in the frontend's src/lib/payment.ts.
const customerSchema = z.object({
  name: z.string().trim().min(1, "Please enter your full name.").max(200),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""))
    .refine((digits) => digits.length === 10, "Please enter a valid 10-digit phone number."),
  address: z.string().trim().min(1, "Please enter a delivery address.").max(1000),
});

const createOrderSchema = z.object({
  customer: customerSchema,
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(50).default(1),
      }),
    )
    .min(1, "Add at least one item.")
    .max(50),
});

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

const statusSchema = z.object({ status: z.enum(ORDER_STATUSES) });

const toItem = (row) => ({
  productId: row.product_id,
  slug: row.product_slug,
  name: row.product_name,
  weight: row.weight,
  unitPrice: row.unit_price,
  quantity: row.quantity,
  lineTotal: (Math.round(row.unit_price * 100) * row.quantity) / 100,
});

const toOrder = (row, items) => ({
  id: row.id,
  status: row.status,
  customer: {
    name: row.customer_name,
    email: row.customer_email,
    phone: row.customer_phone,
    address: row.delivery_address,
  },
  items: items.map(toItem),
  amount: row.amount / 100,
  amountPaise: row.amount,
  currency: row.currency,
  razorpayOrderId: row.razorpay_order_id,
  razorpayPaymentId: row.razorpay_payment_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

function loadOrder(id) {
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  if (!row) return null;
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id").all(id);
  return toOrder(row, items);
}

/**
 * Create an order. Prices always come from the database, never the request,
 * and a matching Razorpay order is created so Checkout can be opened with
 * `order_id` and the payment signature verified afterwards.
 */
ordersRouter.post("/", async (req, res) => {
  const { customer, items } = createOrderSchema.parse(req.body);

  // Merge repeated slugs into one line.
  const quantities = new Map();
  for (const { slug, quantity } of items) {
    quantities.set(slug, (quantities.get(slug) ?? 0) + quantity);
  }

  const findActive = db.prepare("SELECT * FROM products WHERE slug = ? AND active = 1");
  const lines = [];
  const missing = [];
  for (const [slug, quantity] of quantities) {
    const product = findActive.get(slug);
    if (product) lines.push({ product, quantity });
    else missing.push(slug);
  }
  if (missing.length) {
    throw new HttpError(400, `Unknown or unavailable product(s): ${missing.join(", ")}`);
  }

  // Razorpay bills in paise, and rejects non-integer amounts.
  const amount = lines.reduce(
    (sum, { product, quantity }) => sum + Math.round(product.price * 100) * quantity,
    0,
  );
  const id = randomUUID();

  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: id,
      notes: {
        order_id: id,
        items: clip(
          lines.map(({ product, quantity }) => `${product.name} x${quantity}`).join(", "),
        ),
        customer_name: clip(customer.name),
        customer_email: clip(customer.email),
        customer_phone: clip(customer.phone),
        delivery_address: clip(customer.address),
      },
    });
  } catch (error) {
    // Details (bad keys, Razorpay outage) are for the server log, not the buyer.
    console.error("Razorpay order creation failed:", error);
    throw new HttpError(502, "Payments are unavailable right now. Please try again shortly.");
  }

  transaction(() => {
    db.prepare(
      `INSERT INTO orders (id, customer_name, customer_email, customer_phone, delivery_address,
                           amount, currency, razorpay_order_id)
       VALUES (?, ?, ?, ?, ?, ?, 'INR', ?)`,
    ).run(
      id,
      customer.name,
      customer.email,
      customer.phone,
      customer.address,
      amount,
      razorpayOrder.id,
    );
    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_slug, product_name, weight,
                                unit_price, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const { product, quantity } of lines) {
      insertItem.run(
        id,
        product.id,
        product.slug,
        product.name,
        product.weight,
        product.price,
        quantity,
      );
    }
  });

  res.status(201).json({
    order: loadOrder(id),
    // Spread these into `new Razorpay({...})` on the frontend.
    checkout: {
      key: config.razorpay.keyId,
      order_id: razorpayOrder.id,
      amount,
      currency: "INR",
      prefill: { name: customer.name, email: customer.email, contact: customer.phone },
    },
  });
});

/** Called by the frontend from the Razorpay Checkout `handler` callback. */
ordersRouter.post("/:id/verify", (req, res) => {
  const body = verifySchema.parse(req.body);
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!order) throw new HttpError(404, "Order not found.");

  const valid =
    order.razorpay_order_id === body.razorpay_order_id &&
    verifyPaymentSignature({
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature,
    });
  if (!valid) throw new HttpError(400, "Payment signature is invalid.");

  db.prepare(
    `UPDATE orders SET status = 'paid', razorpay_payment_id = ?, updated_at = datetime('now')
     WHERE id = ? AND status IN ('created', 'failed')`,
  ).run(body.razorpay_payment_id, order.id);

  res.json(loadOrder(order.id));
});

// Order ids are random UUIDs, so knowing the id is enough to view it
// (e.g. an order-confirmation page). Listing all orders needs the admin key.
ordersRouter.get("/:id", (req, res) => {
  const order = loadOrder(req.params.id);
  if (!order) throw new HttpError(404, "Order not found.");
  res.json(order);
});

ordersRouter.get("/", requireAdmin, (req, res) => {
  const where = [];
  const params = [];
  if (typeof req.query.status === "string") {
    where.push("status = ?");
    params.push(req.query.status);
  }
  if (typeof req.query.email === "string") {
    where.push("customer_email = ? COLLATE NOCASE");
    params.push(req.query.email);
  }
  const filter = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  const rows = db
    .prepare(
      `SELECT id FROM orders ${filter} ORDER BY created_at DESC, rowid DESC LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset);
  res.json(rows.map((row) => loadOrder(row.id)));
});

ordersRouter.patch("/:id/status", requireAdmin, (req, res) => {
  const { status } = statusSchema.parse(req.body);
  const { changes } = db
    .prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .run(status, req.params.id);
  if (!changes) throw new HttpError(404, "Order not found.");
  res.json(loadOrder(req.params.id));
});
