import { timingSafeEqual } from "node:crypto";
import { ZodError } from "zod";
import { config } from "./config.js";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function isAdmin(req) {
  const given = Buffer.from(req.get("x-admin-key") ?? "", "utf8");
  const expected = Buffer.from(config.adminApiKey, "utf8");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function requireAdmin(req, _res, next) {
  if (!isAdmin(req)) throw new HttpError(401, "Missing or invalid x-admin-key header.");
  next();
}

export function notFound(_req, _res, next) {
  next(new HttpError(404, "Not found."));
}

// Express needs all four arguments to treat this as an error handler.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed.",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body is not valid JSON." });
  }
  console.error(error);
  res.status(500).json({ error: "Something went wrong." });
}
