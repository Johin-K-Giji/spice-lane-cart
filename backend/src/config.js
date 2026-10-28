/** Reads and validates environment variables once, at startup. */

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable ${name}. See backend/.env.example.`);
  }
  return value;
};

const optional = (name, fallback = "") => process.env[name]?.trim() || fallback;

export const config = {
  port: Number(optional("PORT", "4000")),
  corsOrigins: optional("CORS_ORIGINS", "http://localhost:8080")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  razorpay: {
    keyId: required("RAZORPAY_KEY_ID"),
    keySecret: required("RAZORPAY_KEY_SECRET"),
    webhookSecret: optional("RAZORPAY_WEBHOOK_SECRET"),
  },
  adminApiKey: required("ADMIN_API_KEY"),
  databasePath: optional("DATABASE_PATH", "./data/store.db"),
};
