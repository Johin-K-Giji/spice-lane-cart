import puttuImg from "@/assets/cat-puttu.jpg";
import noodlesImg from "@/assets/cat-noodles.jpg";
import heroImg from "@/assets/hero-jar.jpg";
import storyImg from "@/assets/story-jar.jpg";

export type Category =
  | "Puttu Powders"
  | "Millet Noodles"
  | "Millet Pasta"
  | "Flakes"
  | "Idli / Dosa Mix"
  | "Muesli"
  | "Millets"
  | "Essential Powders";

export type Product = {
  slug: string;
  name: string;
  category: Category;
  weight: string;
  note: string;
  /** Placeholder price in INR — edit these to your real prices. */
  price: number;
  image: string;
};

export const categories: Category[] = [
  "Puttu Powders",
  "Millet Noodles",
  "Millet Pasta",
  "Flakes",
  "Idli / Dosa Mix",
  "Muesli",
  "Millets",
  "Essential Powders",
];

const imageFor = (category: Category): string => {
  switch (category) {
    case "Puttu Powders":
    case "Essential Powders":
      return puttuImg;
    case "Millet Noodles":
    case "Millet Pasta":
      return noodlesImg;
    case "Millets":
    case "Flakes":
      return heroImg;
    default:
      return storyImg;
  }
};

const make = (
  name: string,
  category: Category,
  weight: string,
  note: string,
  price: number,
): Product => ({
  slug: name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  name,
  category,
  weight,
  note,
  price,
  image: imageFor(category),
});

export const products: Product[] = [
  // Puttu Powders — 500g
  make("Moringa Puttu Powder", "Puttu Powders", "500g", "Real moringa, high in fibre", 120),
  make("Beetroot Puttu Powder", "Puttu Powders", "500g", "Real beetroot, natural antioxidants", 120),
  make("Carrot Puttu Powder", "Puttu Powders", "500g", "Real carrot, preservative free", 115),
  make("Chocolate Puttu Powder", "Puttu Powders", "500g", "A cocoa twist for little ones", 135),
  make("Corn Puttu Powder", "Puttu Powders", "500g", "Soft, golden and fluffy", 110),
  make("Tapioca Puttu Powder", "Puttu Powders", "500g", "Kerala kappa, milled fine", 105),
  make("Wheat Puttu Powder", "Puttu Powders", "500g", "Whole wheat, everyday staple", 95),
  make("Jackfruit Puttu Powder", "Puttu Powders", "500g", "Ripe jackfruit, naturally sweet", 140),
  make("Banana Puttu Powder", "Puttu Powders", "500g", "Nendran banana, iron rich", 130),
  make("Ragi Puttu Powder", "Puttu Powders", "500g", "Finger millet, calcium rich", 125),

  // Noodles — 195g
  make("Foxtail Millet Noodles", "Millet Noodles", "195g", "No maida, low glycaemic index", 95),
  make("Kodo Millet Noodles", "Millet Noodles", "195g", "Fibre rich, naturally gluten-free", 95),
  make("Ragi Millet Noodles", "Millet Noodles", "195g", "Earthy ragi, rich in nutrients", 95),
  make("Little Millet Noodles", "Millet Noodles", "195g", "Light, quick-cooking millet noodles", 90),

  // Pasta — 180g
  make("Little Millet Pasta", "Millet Pasta", "180g", "Gluten-free, rich in minerals", 100),
  make("Kodo Millet Pasta", "Millet Pasta", "180g", "High dietary fibre", 100),
  make("Foxtail Millet Pasta", "Millet Pasta", "180g", "Low glycaemic index", 100),

  // Flakes — 300g
  make("Finger Millet Flakes", "Flakes", "300g", "Good source of iron", 110),
  make("Kodo Millet Flakes", "Flakes", "300g", "Rich in antioxidants", 110),
  make("Red Sorghum Millet Flakes", "Flakes", "300g", "High in fibre, gluten-free", 115),

  // Idli / Dosa Mix — 195g
  make("Idli / Dosa Mix", "Idli / Dosa Mix", "195g", "Just add water, no soaking", 85),
  make("Kodo Millet Idli/Dosa Mix", "Idli / Dosa Mix", "195g", "Soft idli, crisp dosa", 95),
  make("Moringa Idli/Dosa Mix", "Idli / Dosa Mix", "195g", "Greens folded into breakfast", 95),
  make("Corn Idli/Dosa Mix", "Idli / Dosa Mix", "195g", "Mild, sweet and wholesome", 90),

  // Muesli — 195g
  make("Chocolate Millet Muesli", "Muesli", "195g", "Toasted millets with cocoa", 145),
  make("Mixed Fruit & Nuts Millet Muesli", "Muesli", "195g", "Real fruit and roasted nuts", 150),
  make("Stevia Millet Muesli", "Muesli", "195g", "Naturally sweetened, no sugar", 150),

  // Millets
  make("Little Millet", "Millets", "1 kg", "Whole grain, unpolished", 140),
  make("Kodo Millet", "Millets", "1 kg", "Whole grain, unpolished", 140),
  make("Foxtail Millet", "Millets", "500g", "Whole grain, unpolished", 85),

  // Essential Powders
  make("Turmeric Powder", "Essential Powders", "200g", "High curcumin, farm-fresh aroma", 80),
  make("Chilli Powder", "Essential Powders", "200g", "Sun-dried, potent heat", 85),
  make("Green Chilly Powder", "Essential Powders", "200g", "Crisp, bright and pungent", 90),
  make("Dry Ginger Powder", "Essential Powders", "200g", "Chukku, warming and pure", 95),
  make("Corn Flour", "Essential Powders", "500g", "Finely milled, preservative free", 75),
  make("Roasted Ragi Flour", "Essential Powders", "500g", "Ready to cook, calcium rich", 80),
];

export const featured = [
  "moringa-puttu-powder",
  "foxtail-millet-noodles",
  "turmeric-powder",
  "beetroot-puttu-powder",
  "mixed-fruit-nuts-millet-muesli",
  "kodo-millet-pasta",
].map((slug) => products.find((p) => p.slug === slug)!);

export const findProduct = (slug?: string) =>
  products.find((p) => p.slug === slug);
