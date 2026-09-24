import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, featured } from "@/data/products";
import heroJar from "@/assets/hero-jar.jpg";
import storyJar from "@/assets/story-jar.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chefs Delights — Organic Millet Foods from Kerala" },
      {
        name: "description",
        content:
          "Millet noodles, pasta, vegetable puttu powders, flakes, muesli and pure spice powders, milled fresh in Perumbavoor, Kerala.",
      },
      {
        property: "og:title",
        content: "Chefs Delights — Organic Millet Foods from Kerala",
      },
      {
        property: "og:description",
        content:
          "Millet noodles, pasta, vegetable puttu powders, flakes, muesli and pure spice powders, milled fresh in Perumbavoor, Kerala.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-cream text-ink font-body antialiased selection:bg-saffron selection:text-ink">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 lg:py-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-saffron/25 text-terracotta-deep text-xs font-semibold uppercase tracking-[0.18em] px-3 py-1.5 anim-rise">
              <span className="size-1.5 rounded-full bg-terracotta" /> Dawn-milled
              in Kerala
            </span>
            <h1 className="mt-6 font-display font-semibold text-ink text-balance leading-[0.95] text-5xl sm:text-6xl lg:text-7xl anim-rise-1">
              Grain, milled at
              <br />
              <span className="italic text-terracotta">first light.</span>
            </h1>
            <p className="mt-6 max-w-[46ch] text-base sm:text-lg text-ink/70 text-pretty anim-rise-2">
              Millet noodles, puttu powders and spice blends from a small kitchen
              in Perumbavoor — packed in cloth-tied jars the way they've always
              been.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 anim-rise-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2.5 rounded-full bg-terracotta text-cream text-base font-semibold py-3.5 px-6 ring-1 ring-terracotta-deep hover:bg-terracotta-deep transition-colors"
              >
                Shop the pantry
                <span aria-hidden="true" className="text-lg leading-none">
                  &rarr;
                </span>
              </Link>
              <Link
                to="/"
                hash="story"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink/20 text-ink text-base font-semibold py-3.5 px-6 hover:border-ink transition-colors"
              >
                Our story
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink/60 anim-rise-3">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-leaf" /> 100% natural
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-saffron" /> No
                preservatives
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-clay" /> Small-batch
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative">
              <div className="anim-drift">
                <img
                  src={heroJar}
                  alt="Cloth-tied jar of freshly milled millet in a Kerala kitchen"
                  width={1024}
                  height={1280}
                  className="w-full aspect-[4/5] object-cover rounded-[20px] outline-1 -outline-offset-1 outline-black/5"
                />
              </div>
              <div className="absolute -left-4 -bottom-6 anim-float">
                <div className="bg-paper rounded-2xl ring-1 ring-ink/10 px-4 py-3 shadow-lg">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-ink/50">
                    This week
                  </p>
                  <p className="font-display font-semibold text-lg leading-tight">
                    Ragi Puttu
                  </p>
                </div>
              </div>
              <div className="absolute -right-3 top-8 anim-spin-slow">
                <div className="size-20 rounded-full bg-leaf text-cream grid place-items-center text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] leading-tight">
                    Organic
                    <br />
                    Kerala
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category strip */}
      <section className="bg-ink text-cream">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/50 mr-2">
              Browse
            </span>
            {categories.map((c) => (
              <Link
                key={c}
                to="/shop"
                search={{ category: c }}
                className="rounded-full bg-cream/10 hover:bg-cream/20 transition-colors px-4 py-2 text-sm font-medium"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section id="shop" className="bg-cream">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display font-semibold text-4xl sm:text-5xl text-balance leading-none">
                From the pantry
              </h2>
              <p className="mt-3 text-ink/60 text-pretty max-w-[40ch]">
                Six favourites, milled fresh and ready for your next meal.
              </p>
            </div>
            <Link
              to="/shop"
              className="rounded-full bg-terracotta text-cream text-sm font-semibold px-4 py-2 hover:bg-terracotta-deep transition-colors"
            >
              View all products
            </Link>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section id="story" className="bg-leaf text-cream scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron">
              Our story
            </span>
            <h2 className="mt-4 font-display font-semibold text-4xl sm:text-5xl text-balance leading-[1.02]">
              A jar tied with cloth, opened at dawn.
            </h2>
            <p className="mt-5 text-cream/80 text-pretty max-w-[46ch]">
              In Kerala, mornings begin with warm meals and family time. We take
              the heart of that kitchen — puttu, dosa, rice — and power it with
              millets and real vegetables. Simple, honest ingredients, no
              chemicals and no shortcuts.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cream text-ink text-base font-semibold py-3 px-6 hover:bg-saffron transition-colors"
            >
              Shop the range
              <span aria-hidden="true" className="text-lg leading-none">
                &rarr;
              </span>
            </Link>
          </div>
          <div className="relative">
            <img
              src={storyJar}
              alt="Hands tying a cloth lid on a jar of millet"
              loading="lazy"
              width={1024}
              height={1024}
              className="w-full aspect-square object-cover rounded-[20px] outline-1 -outline-offset-1 outline-black/5"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
