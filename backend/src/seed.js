import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { db, transaction } from "./db.js";
import { slugify } from "./routes/products.js";

// Mirrors src/data/products.ts in the frontend. `image` is the file name in
// the frontend's src/assets folder.
const imageFor = (category) => {
  switch (category) {
    case "Puttu Powders":
    case "Essential Powders":
      return "cat-puttu.jpg";
    case "Millet Noodles":
    case "Millet Pasta":
      return "cat-noodles.jpg";
    case "Millets":
    case "Flakes":
      return "hero-jar.jpg";
    default:
      return "story-jar.jpg";
  }
};

const products = [
  // Puttu Powders — 500g
  ["Moringa Puttu Powder", "Puttu Powders", "500g", "Real moringa, high in fibre", 120],
  ["Beetroot Puttu Powder", "Puttu Powders", "500g", "Real beetroot, natural antioxidants", 120],
  ["Carrot Puttu Powder", "Puttu Powders", "500g", "Real carrot, preservative free", 115],
  ["Chocolate Puttu Powder", "Puttu Powders", "500g", "A cocoa twist for little ones", 135],
  ["Corn Puttu Powder", "Puttu Powders", "500g", "Soft, golden and fluffy", 110],
  ["Tapioca Puttu Powder", "Puttu Powders", "500g", "Kerala kappa, milled fine", 105],
  ["Wheat Puttu Powder", "Puttu Powders", "500g", "Whole wheat, everyday staple", 95],
  ["Jackfruit Puttu Powder", "Puttu Powders", "500g", "Ripe jackfruit, naturally sweet", 140],
  ["Banana Puttu Powder", "Puttu Powders", "500g", "Nendran banana, iron rich", 130],
  ["Ragi Puttu Powder", "Puttu Powders", "500g", "Finger millet, calcium rich", 125],

  // Noodles — 195g
  ["Foxtail Millet Noodles", "Millet Noodles", "195g", "No maida, low glycaemic index", 95],
  ["Kodo Millet Noodles", "Millet Noodles", "195g", "Fibre rich, naturally gluten-free", 95],
  ["Ragi Millet Noodles", "Millet Noodles", "195g", "Earthy ragi, rich in nutrients", 95],
  ["Little Millet Noodles", "Millet Noodles", "195g", "Light, quick-cooking millet noodles", 90],

  // Pasta — 180g
  ["Little Millet Pasta", "Millet Pasta", "180g", "Gluten-free, rich in minerals", 100],
  ["Kodo Millet Pasta", "Millet Pasta", "180g", "High dietary fibre", 100],
  ["Foxtail Millet Pasta", "Millet Pasta", "180g", "Low glycaemic index", 100],

  // Flakes — 300g
  ["Finger Millet Flakes", "Flakes", "300g", "Good source of iron", 110],
  ["Kodo Millet Flakes", "Flakes", "300g", "Rich in antioxidants", 110],
  ["Red Sorghum Millet Flakes", "Flakes", "300g", "High in fibre, gluten-free", 115],

  // Idli / Dosa Mix — 195g
  ["Idli / Dosa Mix", "Idli / Dosa Mix", "195g", "Just add water, no soaking", 85],
  ["Kodo Millet Idli/Dosa Mix", "Idli / Dosa Mix", "195g", "Soft idli, crisp dosa", 95],
  ["Moringa Idli/Dosa Mix", "Idli / Dosa Mix", "195g", "Greens folded into breakfast", 95],
  ["Corn Idli/Dosa Mix", "Idli / Dosa Mix", "195g", "Mild, sweet and wholesome", 90],

  // Muesli — 195g
  ["Chocolate Millet Muesli", "Muesli", "195g", "Toasted millets with cocoa", 145],
  ["Mixed Fruit & Nuts Millet Muesli", "Muesli", "195g", "Real fruit and roasted nuts", 150],
  ["Stevia Millet Muesli", "Muesli", "195g", "Naturally sweetened, no sugar", 150],

  // Millets
  ["Little Millet", "Millets", "1 kg", "Whole grain, unpolished", 140],
  ["Kodo Millet", "Millets", "1 kg", "Whole grain, unpolished", 140],
  ["Foxtail Millet", "Millets", "500g", "Whole grain, unpolished", 85],

  // Essential Powders
  ["Turmeric Powder", "Essential Powders", "200g", "High curcumin, farm-fresh aroma", 80],
  ["Chilli Powder", "Essential Powders", "200g", "Sun-dried, potent heat", 85],
  ["Green Chilly Powder", "Essential Powders", "200g", "Crisp, bright and pungent", 90],
  ["Dry Ginger Powder", "Essential Powders", "200g", "Chukku, warming and pure", 95],
  ["Corn Flour", "Essential Powders", "500g", "Finely milled, preservative free", 75],
  ["Roasted Ragi Flour", "Essential Powders", "500g", "Ready to cook, calcium rich", 80],
];

/** Inserts the starter catalogue on first run. Existing products are left alone. */
export function seedProductsIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM products").get();
  if (count > 0) return 0;

  const insert = db.prepare(
    `INSERT INTO products (slug, name, category, weight, note, price, image)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  transaction(() => {
    for (const [name, category, weight, note, price] of products) {
      insert.run(slugify(name), name, category, weight, note, price, imageFor(category));
    }
  });
  return products.length;
}

// `npm run seed`
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const inserted = seedProductsIfEmpty();
  console.log(
    inserted ? `Seeded ${inserted} products.` : "Products already exist; nothing seeded.",
  );
}
