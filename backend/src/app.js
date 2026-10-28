import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { errorHandler, notFound } from "./middleware.js";
import { ordersRouter } from "./routes/orders.js";
import { productsRouter } from "./routes/products.js";
import { webhooksRouter } from "./routes/webhooks.js";

export const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: config.corsOrigins }));

// Mounted before express.json() because it reads the raw body.
app.use("/api/webhooks", webhooksRouter);

app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);

app.use(notFound);
app.use(errorHandler);
