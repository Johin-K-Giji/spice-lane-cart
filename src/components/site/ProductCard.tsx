import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card-lift bg-paper rounded-3xl ring-1 ring-ink/10 p-4">
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        width={1024}
        height={1024}
        className="w-full aspect-square object-cover rounded-[14px] outline-1 -outline-offset-1 outline-black/5"
      />
      <div className="mt-4 px-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">
            {product.category}
          </span>
          <span className="text-xs font-medium text-ink/40">{product.weight}</span>
        </div>
        <h3 className="mt-1.5 font-display font-semibold text-2xl leading-tight">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-ink/55">{product.note}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display font-semibold text-xl">
            &#8377;{product.price}
          </span>
          <Link
            to="/checkout"
            search={{ product: product.slug }}
            className="inline-flex items-center gap-1.5 rounded-full bg-terracotta text-cream text-sm font-semibold py-2 px-4 ring-1 ring-terracotta-deep hover:bg-terracotta-deep transition-colors"
          >
            Buy now
          </Link>
        </div>
      </div>
    </article>
  );
}
