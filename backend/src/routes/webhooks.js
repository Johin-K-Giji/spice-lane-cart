import express, { Router } from "express";
import { db } from "../db.js";
import { HttpError } from "../middleware.js";
import { verifyWebhookSignature } from "../razorpay.js";

/**
 * Razorpay webhook. Marks orders paid even if the buyer closes the tab before
 * the frontend calls /verify. Configure it in Razorpay → Webhooks with the
 * `payment.captured`, `order.paid` and `payment.failed` events.
 */
export const webhooksRouter = Router();

// The signature covers the exact bytes sent, so this route needs the raw body.
webhooksRouter.post("/razorpay", express.raw({ type: "*/*" }), (req, res) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  if (!verifyWebhookSignature(rawBody, req.get("x-razorpay-signature"))) {
    throw new HttpError(400, "Invalid webhook signature.");
  }

  const event = JSON.parse(rawBody.toString("utf8"));
  const payment = event.payload?.payment?.entity;

  if ((event.event === "payment.captured" || event.event === "order.paid") && payment?.order_id) {
    db.prepare(
      `UPDATE orders SET status = 'paid', razorpay_payment_id = ?, updated_at = datetime('now')
       WHERE razorpay_order_id = ? AND status IN ('created', 'failed')`,
    ).run(payment.id, payment.order_id);
  } else if (event.event === "payment.failed" && payment?.order_id) {
    db.prepare(
      `UPDATE orders SET status = 'failed', updated_at = datetime('now')
       WHERE razorpay_order_id = ? AND status = 'created'`,
    ).run(payment.order_id);
  }

  res.json({ received: true });
});
