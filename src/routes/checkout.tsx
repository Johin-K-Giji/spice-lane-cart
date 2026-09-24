import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { findProduct, products } from "@/data/products";
import { buildRazorpayUrl } from "@/lib/payment";

type CheckoutSearch = { product?: string };

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => ({
    product: typeof search.product === "string" ? search.product : undefined,
  }),
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
  const product = findProduct(slug) ?? products[0];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const payUrl = buildRazorpayUrl({
    productName: product.name,
    amount: product.price,
    name,
    email,
    phone,
  });

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
                  <p className="text-sm text-ink/55">
                    {product.weight} &middot; 1 unit
                  </p>
                </div>
                <p className="font-display font-semibold text-2xl">
                  &#8377;{product.price}
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-ink/10 flex items-center justify-between">
                <span className="text-sm text-ink/60">Total</span>
                <span className="font-display font-semibold text-2xl">
                  &#8377;{product.price}
                </span>
              </div>
            </div>

            <div className="mt-6 bg-cream rounded-3xl ring-1 ring-ink/10 p-6 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1.5"
                >
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
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5"
                >
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
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-1.5"
                >
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
                <label
                  htmlFor="address"
                  className="block text-sm font-medium mb-1.5"
                >
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
                  <p className="font-display font-semibold text-xl leading-tight">
                    Razorpay
                  </p>
                  <p className="text-sm text-cream/60">
                    UPI, cards, netbanking
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-cream/10 p-4">
                <p className="text-xs text-cream/50">Paying for</p>
                <p className="font-display font-semibold text-lg">
                  {product.name}
                </p>
              </div>
              <a
                href={payUrl}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-saffron text-ink text-base font-semibold py-3.5 ring-1 ring-saffron hover:bg-cream transition-colors"
              >
                Pay &#8377;{product.price}
                <span aria-hidden="true" className="text-lg leading-none">
                  &rarr;
                </span>
              </a>
              <p className="mt-4 text-xs text-cream/45 text-center">
                You'll be redirected to Razorpay to complete payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
