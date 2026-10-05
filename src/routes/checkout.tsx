import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { findProduct, products } from "@/data/products";
import { openRazorpayCheckout, validateBuyer } from "@/lib/payment";

type CheckoutSearch = { product?: string };

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch =>
    typeof search["product"] === "string" ? { product: search["product"] } : {},
  head: () => ({
    meta: [
      { title: "Checkout — Chefs Delights" },
      {
        name: "description",
        content:
          "Confirm your Chefs Delights order and pay securely with Razorpay — UPI, cards and netbanking.",
      },
      { property: "og:title", content: "Checkout — Chefs Delights" },
      {
        property: "og:description",
        content:
          "Confirm your Chefs Delights order and pay securely with Razorpay — UPI, cards and netbanking.",
      },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { product: slug } = Route.useSearch();
  const product = findProduct(slug) ?? products[0]!;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [status, setStatus] = useState<"idle" | "opening" | "paid">("idle");
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const handlePay = async () => {
    const buyer = { name, email, phone, address };

    const invalid = validateBuyer(buyer);
    if (invalid) {
      setError(invalid);
      return;
    }

    setError(null);
    setStatus("opening");

    await openRazorpayCheckout({
      buyer,
      order: {
        productName: product.name,
        productWeight: product.weight,
        amount: product.price,
      },
      onSuccess: (payment) => {
        setPaymentId(payment.razorpay_payment_id);
        setStatus("paid");
      },
      // Closing the modal is not a failure — just let them try again.
      onDismiss: () => setStatus("idle"),
      onError: (message) => {
        setError(message);
        setStatus("idle");
      },
    });
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-body antialiased selection:bg-saffron selection:text-ink">
      <Header />

      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 anim-rise">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink transition-colors"
            >
              <span aria-hidden="true">&larr;</span> Back to shop
            </Link>
            <h1 className="mt-5 font-display font-semibold text-4xl sm:text-5xl text-balance leading-none">
              Checkout
            </h1>
            <p className="mt-3 text-ink/60 text-pretty">
              Secure payment via Razorpay. Your order is prefilled below.
            </p>

            <div className="mt-8 bg-cream rounded-3xl ring-1 ring-ink/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
                Order summary
              </p>
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="size-20 shrink-0 object-cover rounded-[12px] outline-1 -outline-offset-1 outline-black/5"
                />
                <div className="flex-1">
                  <p className="font-display font-semibold text-2xl leading-tight">
                    {product.name}
                  </p>
                  <p className="text-sm text-ink/55">{product.weight} &middot; 1 unit</p>
                </div>
                <p className="font-display font-semibold text-2xl">&#8377;{product.price}</p>
              </div>
              <div className="mt-6 pt-5 border-t border-ink/10 flex items-center justify-between">
                <span className="text-sm text-ink/60">Total</span>
                <span className="font-display font-semibold text-2xl">&#8377;{product.price}</span>
              </div>
            </div>

            <div className="mt-6 bg-cream rounded-3xl ring-1 ring-ink/10 p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Asha Menon"
                  className="w-full rounded-xl bg-paper ring-1 ring-ink/15 px-4 py-3 text-sm placeholder:text-ink/35 focus:ring-2 focus:ring-terracotta outline-none"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="asha@example.com"
                  className="w-full rounded-xl bg-paper ring-1 ring-ink/15 px-4 py-3 text-sm placeholder:text-ink/35 focus:ring-2 focus:ring-terracotta outline-none"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98470 00000"
                  className="w-full rounded-xl bg-paper ring-1 ring-ink/15 px-4 py-3 text-sm placeholder:text-ink/35 focus:ring-2 focus:ring-terracotta outline-none"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1.5">
                  Delivery address
                </label>
                <textarea
                  id="address"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, street, city, PIN"
                  className="w-full rounded-xl bg-paper ring-1 ring-ink/15 px-4 py-3 text-sm placeholder:text-ink/35 focus:ring-2 focus:ring-terracotta outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 anim-rise-2">
            <div className="lg:sticky lg:top-24 bg-ink text-cream rounded-3xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/50">
                Payment
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="size-10 grid place-items-center rounded-xl bg-saffron text-ink font-display font-semibold text-lg">
                  R
                </span>
                <div>
                  <p className="font-display font-semibold text-xl leading-tight">Razorpay</p>
                  <p className="text-sm text-cream/60">UPI, cards, netbanking</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-cream/10 p-4">
                <p className="text-xs text-cream/50">Paying for</p>
                <p className="font-display font-semibold text-lg">{product.name}</p>
              </div>
              {status === "paid" ? (
                <div
                  role="status"
                  className="mt-6 rounded-2xl bg-saffron/15 ring-1 ring-saffron/40 p-4 text-center"
                >
                  <p className="font-display font-semibold text-lg text-cream">Payment received</p>
                  <p className="mt-1 text-xs text-cream/60">Reference {paymentId}</p>
                  <p className="mt-3 text-xs text-cream/60">
                    We&rsquo;ll be in touch on {email} to confirm delivery.
                  </p>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={status === "opening"}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-saffron text-ink text-base font-semibold py-3.5 ring-1 ring-saffron hover:bg-cream transition-colors disabled:opacity-60 disabled:hover:bg-saffron"
                  >
                    {status === "opening" ? (
                      "Opening Razorpay…"
                    ) : (
                      <>
                        Pay &#8377;{product.price}
                        <span aria-hidden="true" className="text-lg leading-none">
                          &rarr;
                        </span>
                      </>
                    )}
                  </button>

                  {error ? (
                    <p role="alert" className="mt-3 text-xs text-center text-saffron">
                      {error}
                    </p>
                  ) : null}

                  <p className="mt-4 text-xs text-cream/45 text-center">
                    Razorpay opens securely on this page to complete payment.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
