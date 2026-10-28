/**
 * Razorpay Checkout, backed by the API in /backend.
 *
 * 1. The backend creates the order, pricing it from its own product table, and
 *    a matching Razorpay order. It returns the key and `order_id` for Checkout.
 * 2. Checkout opens with that `order_id`.
 * 3. Razorpay's success callback is sent back to the backend, which checks the
 *    payment signature with the key secret. Only then is the order "paid".
 *
 * The key secret lives only in backend/.env. Nothing secret is shipped here.
 */

/**
 * Base URL of the backend. Set VITE_API_URL at build time (e.g. in the deploy
 * workflow); local dev falls back to the backend's default port.
 */
const API_URL = (
  import.meta.env["VITE_API_URL"] ?? (import.meta.env.DEV ? "http://localhost:4000" : "")
).replace(/\/$/, "");

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export type BuyerDetails = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type OrderDetails = {
  productSlug: string;
  productName: string;
  productWeight: string;
  quantity?: number;
};

export type PaymentSuccess = { orderId: string; paymentId: string };

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

/** What POST /api/orders returns. */
type CreatedOrder = {
  order: { id: string; amount: number };
  checkout: {
    key: string;
    order_id: string;
    amount: number;
    currency: string;
    prefill: { name: string; email: string; contact: string };
  };
};

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

/** POSTs JSON to the backend, turning its `{ error, details }` bodies into readable errors. */
async function post<T>(path: string, body: unknown): Promise<T> {
  if (!API_URL) throw new Error("Checkout isn't configured yet. Please try again later.");

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Couldn't reach our server. Check your connection and try again.");
  }

  const data = (await response.json().catch(() => null)) as
    (T & { error?: string; details?: { message: string }[] }) | null;
  if (!response.ok) {
    throw new Error(data?.details?.[0]?.message ?? data?.error ?? "Something went wrong.");
  }
  return data as T;
}

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
  /** Razorpay has taken the payment and the backend is checking its signature. */
  onVerifying?: () => void;
  /**
   * Razorpay reported success but the backend couldn't confirm it (network
   * error, signature mismatch). Money may have moved, so don't offer a retry.
   * The Razorpay webhook will still mark the order paid if it went through.
   */
  onUnconfirmed?: (payment: PaymentSuccess) => void;
  onDismiss?: () => void;
  onError?: (message: string) => void;
};

export async function openRazorpayCheckout({
  buyer,
  order,
  onSuccess,
  onVerifying,
  onUnconfirmed,
  onDismiss,
  onError,
}: OpenCheckoutArgs): Promise<void> {
  let created: CreatedOrder;
  try {
    [created] = await Promise.all([
      post<CreatedOrder>("/api/orders", {
        customer: {
          name: buyer.name.trim(),
          email: buyer.email.trim(),
          phone: buyer.phone.trim(),
          address: buyer.address.trim(),
        },
        items: [{ slug: order.productSlug, quantity: order.quantity ?? 1 }],
      }),
      loadCheckoutScript(),
    ]);
  } catch (error) {
    onError?.(error instanceof Error ? error.message : "Couldn't start checkout.");
    return;
  }

  if (!window.Razorpay) {
    onError?.("Couldn't load Razorpay.");
    return;
  }

  const orderId = created.order.id;

  const checkout = new window.Razorpay({
    ...created.checkout,
    name: "Chefs Delights",
    description: `${order.productName} (${order.productWeight})`,
    theme: { color: "#E8A33D" },
    modal: { ondismiss: () => onDismiss?.() },
    handler: async (response: RazorpayResponse) => {
      onVerifying?.();
      try {
        await post(`/api/orders/${orderId}/verify`, response);
        onSuccess({ orderId, paymentId: response.razorpay_payment_id });
      } catch {
        onUnconfirmed?.({ orderId, paymentId: response.razorpay_payment_id });
      }
    },
  });

  checkout.on("payment.failed", (payload: unknown) => {
    const described = payload as { error?: { description?: string } };
    onError?.(described?.error?.description ?? "The payment didn't go through. Please try again.");
  });

  checkout.open();
}
