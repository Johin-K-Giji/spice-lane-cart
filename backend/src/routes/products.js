import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { HttpError, isAdmin, requireAdmin } from "../middleware.js";

export const productsRouter = Router();

export const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const toProduct = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  category: row.category,
  weight: row.weight,
  note: row.note,
  price: row.price,
  image: row.image,
  active: Boolean(row.active),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const fields = {
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes."),
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  weight: z.string().trim().min(1).max(50),
  note: z.string().trim().max(500),
  price: z.number().positive().max(1_000_000),
  image: z.string().trim().max(1000).nullable(),
  active: z.boolean(),
};

const createSchema = z.object({
  ...fields,
  slug: fields.slug.optional(),
  note: fields.note.default(""),
  image: fields.image.default(null),
  active: fields.active.default(true),
});

const updateSchema = z
  .object(fields)
  .partial()
  .refine((body) => Object.keys(body).length > 0, "Send at least one field to update.");

const findBySlug = (slug) => db.prepare("SELECT * FROM products WHERE slug = ?").get(slug);

const rethrowDuplicateSlug = (error, slug) => {
  if (String(error?.message).includes("UNIQUE constraint failed: products.slug")) {
    throw new HttpError(409, `A product with slug "${slug}" already exists.`);
  }
  throw error;
};

// List. Inactive products are hidden unless the admin key is sent.
productsRouter.get("/", (req, res) => {
  const where = [];
  const params = [];
  if (!isAdmin(req)) where.push("active = 1");
  if (typeof req.query.category === "string") {
    where.push("category = ?");
    params.push(req.query.category);
  }
  const filter = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = db.prepare(`SELECT * FROM products ${filter} ORDER BY id`).all(...params);
  res.json(rows.map(toProduct));
});

productsRouter.get("/:slug", (req, res) => {
  const row = findBySlug(req.params.slug);
  if (!row || (!row.active && !isAdmin(req))) throw new HttpError(404, "Product not found.");
  res.json(toProduct(row));
});

productsRouter.post("/", requireAdmin, (req, res) => {
  const body = createSchema.parse(req.body);
  const slug = body.slug ?? slugify(body.name);
  try {
    db.prepare(
      `INSERT INTO products (slug, name, category, weight, note, price, image, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      slug,
      body.name,
      body.category,
      body.weight,
      body.note,
      body.price,
      body.image,
      body.active ? 1 : 0,
    );
  } catch (error) {
    rethrowDuplicateSlug(error, slug);
  }
  res.status(201).json(toProduct(findBySlug(slug)));
});

// Partial update: send only the fields you want to change.
productsRouter.patch("/:slug", requireAdmin, (req, res) => {
  const existing = findBySlug(req.params.slug);
  if (!existing) throw new HttpError(404, "Product not found.");

  const body = updateSchema.parse(req.body);
  // Keys are limited to the schema's fields, so they're safe to use as column names.
  const columns = Object.keys(body);
  const values = columns.map((key) => (key === "active" ? (body.active ? 1 : 0) : body[key]));

  try {
    db.prepare(
      `UPDATE products SET ${columns.map((c) => `${c} = ?`).join(", ")}, updated_at = datetime('now')
       WHERE id = ?`,
    ).run(...values, existing.id);
  } catch (error) {
    rethrowDuplicateSlug(error, body.slug);
  }
  res.json(toProduct(db.prepare("SELECT * FROM products WHERE id = ?").get(existing.id)));
});

productsRouter.delete("/:slug", requireAdmin, (req, res) => {
  const { changes } = db.prepare("DELETE FROM products WHERE slug = ?").run(req.params.slug);
  if (!changes) throw new HttpError(404, "Product not found.");
  res.status(204).end();
});
