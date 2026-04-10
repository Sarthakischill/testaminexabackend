export type Product = {
  id: string;
  name: string;
  fullName: string;
  price: number;
  displayPrice: string;
  purity: string;
  volume: string;
  hex: string;
  image: string;
  scaleClass: string;
  description: string;
  benefits: string[];
  faqs: { question: string; answer: string }[];
  colorFrom: string;
  colorTo: string;
  accentGlow: string;
  weight: number; // weight in ounces for shipping calculation
  category: "vial" | "pen";
  brand?: string;
  comingSoon?: boolean;
  inventoryQuantity?: number;
  inventoryStatus?: "ready" | "not_ready";
  soldOut?: boolean;
};

// Products are managed via the admin panel and stored in Supabase.
// This static array serves as a fallback when the DB is empty or unavailable.
// For new projects, leave this empty and use the admin panel to add products.
export const products: Product[] = [];

export const vials = products.filter((p) => p.category === "vial");
export const pens = products.filter((p) => p.category === "pen");

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getAdjacentProducts(id: string) {
  const product = products.find((p) => p.id === id);
  if (!product) {
    return { prev: products[0], next: products[1] };
  }
  const sameCategoryProducts = products.filter((p) => p.category === product.category);
  const idx = sameCategoryProducts.findIndex((p) => p.id === id);
  const prev = sameCategoryProducts[(idx - 1 + sameCategoryProducts.length) % sameCategoryProducts.length];
  const next = sameCategoryProducts[(idx + 1) % sameCategoryProducts.length];
  return { prev, next };
}
