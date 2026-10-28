import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { config } from "./config.js";

mkdirSync(dirname(config.databasePath), { recursive: true });

export const db = new DatabaseSync(config.databasePath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT    NOT NULL UNIQUE,
    name        TEXT    NOT NULL,
    category    TEXT    NOT NULL,
    weight      TEXT    NOT NULL,
    note        TEXT    NOT NULL DEFAULT '',
    price       REAL    NOT NULL,          -- rupees
    image       TEXT,
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id                  TEXT    PRIMARY KEY,
    customer_name       TEXT    NOT NULL,
    customer_email      TEXT    NOT NULL,
    customer_phone      TEXT    NOT NULL,
    delivery_address    TEXT    NOT NULL,
    amount              INTEGER NOT NULL,  -- paise
    currency            TEXT    NOT NULL DEFAULT 'INR',
    status              TEXT    NOT NULL DEFAULT 'created',
    razorpay_order_id   TEXT    UNIQUE,
    razorpay_payment_id TEXT,
    created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Name and price are copied at order time so later product edits or
  -- deletions don't rewrite past orders.
  CREATE TABLE IF NOT EXISTS order_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id     TEXT    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   INTEGER,
    product_slug TEXT    NOT NULL,
    product_name TEXT    NOT NULL,
    weight       TEXT    NOT NULL,
    unit_price   REAL    NOT NULL,         -- rupees
    quantity     INTEGER NOT NULL
  );
`);

/** Runs fn inside a transaction, rolling back if it throws. */
export function transaction(fn) {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
