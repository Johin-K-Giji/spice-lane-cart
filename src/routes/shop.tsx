import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, products, type Category } from "@/data/products";

type ShopSearch = { category?: Category };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    const category = search["category"] as Category | undefined;
    return category && categories.includes(category) ? { category } : {};
  },
  head: () => ({
    meta: [
      { title: "Shop all products — Chefs Delights" },
      {
        name: "description",
        content:
          "Browse every Chefs Delights product: puttu powders, millet noodles and pasta, flakes, muesli, idli/dosa mixes, whole millets and essential spice powders.",
      },
      { property: "og:title", content: "Shop all products — Chefs Delights" },
      {
        property: "og:description",
        content:
          "Browse every Chefs Delights product: puttu powders, millet noodles and pasta, flakes, muesli, idli/dosa mixes, whole millets and essential spice powders.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category } = Route.useSearch();
  const list = category
    ? products.filter((p) => p.category === category)
    : products;

  return (
    <div className="min-h-screen bg-cream text-ink font-body antialiased selection:bg-saffron selection:text-ink">
      <Header />

      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 lg:py-16">
        <h1 className="font-display font-semibold text-5xl sm:text-6xl leading-none text-balance anim-rise">
          The pantry
        </h1>
        <p className="mt-3 text-ink/60 max-w-[48ch] text-pretty anim-rise-1">
          {list.length} products, milled and packed in Perumbavoor.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            to="/shop"
            className={
              category
                ? "rounded-full border border-ink/15 text-ink/70 text-sm font-medium px-4 py-2 hover:border-ink transition-colors"
                : "rounded-full bg-terracotta text-cream text-sm font-semibold px-4 py-2"
            }
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              to="/shop"
              search={{ category: c }}
              className={
                category === c
                  ? "rounded-full bg-terracotta text-cream text-sm font-semibold px-4 py-2"
                  : "rounded-full border border-ink/15 text-ink/70 text-sm font-medium px-4 py-2 hover:border-ink transition-colors"
              }
            >
              {c}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
