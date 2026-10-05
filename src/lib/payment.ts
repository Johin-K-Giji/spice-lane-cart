/**
 * Razorpay Checkout, opened directly in the browser.
 *
 * The site is served from GitHub Pages, so there is no server to create an
 * order or verify a payment signature. Checkout is therefore opened without an
 * `order_id`, and the buyer's details travel with the payment as `prefill`
 * (to save them typing) and `notes` (so they're recorded against the payment).
 *
 * Consequence worth knowing: payments are real and arrive in the Razorpay
 * account, but `onSuccess` is only Razorpay's word that it worked — nothing
 * here can verify the signature. Fulfil orders against the Razorpay dashboard,
 * where the notes below appear, rather than trusting the browser.
 */

/** Publishable key. Safe to ship — it is visible in the browser by design. */
export const RAZORPAY_KEY_ID = "rzp_live_LIrBEQw6TTri1V";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Razorpay truncates note values past 256 characters. */
const NOTE_MAX = 256;

export type BuyerDetails = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type OrderDetails = {
  productName: string;
  productWeight: string;
  /** Rupees, as displayed in the UI. Converted to paise below. */
  amount: number;
};

export type PaymentSuccess = { razorpay_payment_id: string };

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Checkout is only available in the browser."));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Allow a later attempt to retry rather than caching the failure.
      scriptPromise = null;
      reject(new Error("Couldn't reach Razorpay. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

const clip = (value: string) => value.trim().slice(0, NOTE_MAX);

/** Mirrors the required fields on the checkout form. */
export function validateBuyer(buyer: BuyerDetails): string | null {
  if (!buyer.name.trim()) return "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email.trim())) {
    return "Please enter a valid email address.";
  }
  // Indian mobile numbers are 10 digits; tolerate spaces and a +91 prefix.
  const digits = buyer.phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  if (digits.length !== 10) return "Please enter a valid 10-digit phone number.";
  if (!buyer.address.trim()) return "Please enter a delivery address.";
  return null;
}

type OpenCheckoutArgs = {
  buyer: BuyerDetails;
  order: OrderDetails;
  onSuccess: (payment: PaymentSuccess) => void;
  onDismiss?: () => void;
  onError?: (message: string) => void;
};

export async function openRazorpayCheckout({
  buyer,
  order,
  onSuccess,
  onDismiss,
  onError,
}: OpenCheckoutArgs): Promise<void> {
  try {
    await loadCheckoutScript();
  } catch (error) {
    onError?.(error instanceof Error ? error.message : "Couldn't load Razorpay.");
    return;
  }

  if (!window.Razorpay) {
    onError?.("Couldn't load Razorpay.");
    return;
  }

  const checkout = new window.Razorpay({
    key: RAZORPAY_KEY_ID,
    // Razorpay bills in paise, and rejects non-integer amounts.
    amount: Math.round(order.amount * 100),
    currency: "INR",
    name: "Chefs Delights",
    description: `${order.productName} (${order.productWeight})`,
    prefill: {
      name: buyer.name.trim(),
      email: buyer.email.trim(),
      contact: buyer.phone.trim(),
    },
    notes: {
      product_name: clip(order.productName),
      product_weight: clip(order.productWeight),
      customer_name: clip(buyer.name),
      customer_email: clip(buyer.email),
      customer_phone: clip(buyer.phone),
      delivery_address: clip(buyer.address),
    },
    theme: { color: "#E8A33D" },
    modal: { ondismiss: () => onDismiss?.() },
    handler: (payment: PaymentSuccess) => onSuccess(payment),
  });

  checkout.on("payment.failed", (payload: unknown) => {
    const described = payload as { error?: { description?: string } };
    onError?.(described?.error?.description ?? "The payment didn't go through. Please try again.");
  });

  checkout.open();
}
