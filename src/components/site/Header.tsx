import { Link } from "@tanstack/react-router";

const marqueeItems = [
  "When health is organic, wealth is organic",
  "Freshly milled in Perumbavoor, Kerala",
  "Cloth-tied jars, dawn-milled grain",
];

export function Header() {
  return (
    <>
      <div className="bg-leaf text-cream overflow-hidden">
        <div className="flex whitespace-nowrap anim-marquee">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="py-2 pr-8 text-xs font-semibold uppercase tracking-[0.2em]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-sm border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid place-items-center size-9 rounded-full bg-terracotta text-cream font-display font-semibold text-lg">
              C
            </span>
            <span className="font-display font-semibold text-xl tracking-tight">
              Chefs Delights
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/shop" className="hover:text-terracotta transition-colors">
              Shop
            </Link>
            <Link
              to="/"
              hash="story"
              className="hover:text-terracotta transition-colors"
            >
              Our story
            </Link>
          </nav>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-ink text-cream text-sm font-semibold py-2 px-4 ring-1 ring-ink hover:bg-terracotta-deep transition-colors"
          >
            Shop all
          </Link>
        </div>
      </header>
    </>
  );
}
