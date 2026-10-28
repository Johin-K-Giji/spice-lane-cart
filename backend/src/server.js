import { app } from "./app.js";
import { config } from "./config.js";
import { seedProductsIfEmpty } from "./seed.js";

seedProductsIfEmpty();

app.listen(config.port, () => {
  const mode = config.razorpay.keyId.startsWith("rzp_live_") ? "LIVE" : "test";
  console.log(`API listening on http://localhost:${config.port} (Razorpay ${mode} mode)`);
});
