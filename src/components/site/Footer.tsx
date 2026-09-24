export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center size-9 rounded-full bg-terracotta text-cream font-display font-semibold text-lg">
            C
          </span>
          <span className="font-display font-semibold text-xl">Chefs Delights</span>
        </div>
        <p className="text-sm text-cream/50">
          21/106, Vengola, Perumbavoor 683556, Kerala &middot; When health is
          organic, wealth is organic.
        </p>
      </div>
    </footer>
  );
}
