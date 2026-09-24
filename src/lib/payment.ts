/**
 * Razorpay payment page link.
 * Replace this with your own Razorpay Payment Page / Payment Link URL.
 */
export const RAZORPAY_PAYMENT_URL = "https://rzp.io/l/chefs-delights";

export type PrefillDetails = {
  productName: string;
  amount: number;
  name?: string;
  email?: string;
  phone?: string;
};

/**
 * Builds the Razorpay redirect URL, passing the product name (and buyer
 * details) as query parameters so the payment page can autofill them.
 */
export function buildRazorpayUrl({
  productName,
  amount,
  name,
  email,
  phone,
}: PrefillDetails): string {
  const url = new URL(RAZORPAY_PAYMENT_URL);
  url.searchParams.set("product", productName);
  url.searchParams.set("amount", String(amount));
  if (name) url.searchParams.set("prefill[name]", name);
  if (email) url.searchParams.set("prefill[email]", email);
  if (phone) url.searchParams.set("prefill[contact]", phone);
  return url.toString();
}
