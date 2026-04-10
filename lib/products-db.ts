import { createAdminClient } from "@/lib/supabase/admin";
import { products as staticProducts, type Product } from "@/lib/products";

type DbProduct = {
  id: string;
  name: string;
  full_name: string;
  price: number;
  display_price: string;
  purity: string;
  volume: string;
  hex: string;
  image: string;
  scale_class: string;
  color_from: string;
  color_to: string;
  accent_glow: string;
  description: string;
  benefits: string[];
  faqs: { question: string; answer: string }[];
  weight: number | null;
  category: "vial" | "pen";
  brand: string | null;
  coming_soon: boolean;
  sort_order: number;
  active: boolean;
  inventory_quantity: number;
  inventory_status: "ready" | "not_ready";
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
};

function mapDbToProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    fullName: row.full_name,
    price: Number(row.price),
    displayPrice: row.display_price,
    purity: row.purity,
    volume: row.volume,
    hex: row.hex,
    image: row.image,
    scaleClass: row.scale_class,
    colorFrom: row.color_from,
    colorTo: row.color_to,
    accentGlow: row.accent_glow,
    description: row.description,
    benefits: row.benefits,
    faqs: row.faqs,
    weight: row.weight ?? (row.category === "pen" ? 6 : 4),
    category: row.category,
    brand: row.brand ?? undefined,
    comingSoon: row.coming_soon ?? undefined,
    inventoryQuantity: row.inventory_quantity ?? 0,
    inventoryStatus: row.inventory_status ?? "not_ready",
    soldOut: row.inventory_status !== "ready" || row.inventory_quantity <= 0,
  };
}

export function mapProductToDb(p: Product & { sortOrder?: number; active?: boolean; inventoryQuantity?: number; inventoryStatus?: "ready" | "not_ready"; lowStockThreshold?: number }) {
  return {
    id: p.id,
    name: p.name,
    full_name: p.fullName,
    price: p.price,
    display_price: p.displayPrice,
    purity: p.purity,
    volume: p.volume,
    hex: p.hex,
    image: p.image,
    scale_class: p.scaleClass,
    color_from: p.colorFrom,
    color_to: p.colorTo,
    accent_glow: p.accentGlow,
    description: p.description,
    benefits: p.benefits,
    faqs: p.faqs,
    category: p.category,
    brand: p.brand ?? null,
    coming_soon: p.comingSoon ?? false,
    sort_order: p.sortOrder ?? 0,
    active: p.active ?? true,
    inventory_quantity: p.inventoryQuantity ?? 0,
    inventory_status: p.inventoryStatus ?? "not_ready",
    low_stock_threshold: p.lowStockThreshold ?? 5,
  };
}

async function queryProducts(): Promise<Product[] | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return null;
    return (data as DbProduct[]).map(mapDbToProduct);
  } catch {
    return null;
  }
}

async function queryAllProducts(): Promise<(Product & { sortOrder: number; active: boolean; inventoryQuantity: number; inventoryStatus: "ready" | "not_ready"; lowStockThreshold: number })[] | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data) return null;
    return (data as DbProduct[]).map((row) => ({
      ...mapDbToProduct(row),
      sortOrder: row.sort_order,
      active: row.active,
      inventoryQuantity: row.inventory_quantity ?? 0,
      inventoryStatus: row.inventory_status ?? "not_ready",
      lowStockThreshold: row.low_stock_threshold ?? 5,
    }));
  } catch {
    return null;
  }
}

export async function getProducts(): Promise<Product[]> {
  const dbProducts = await queryProducts();
  return dbProducts ?? staticProducts;
}

export async function getAllProductsAdmin(): Promise<(Product & { sortOrder: number; active: boolean; inventoryQuantity: number; inventoryStatus: "ready" | "not_ready"; lowStockThreshold: number })[]> {
  const dbProducts = await queryAllProducts();
  if (dbProducts) return dbProducts;
  return staticProducts.map((p, i) => ({ ...p, sortOrder: i + 1, active: true, inventoryQuantity: 0, inventoryStatus: "not_ready" as const, lowStockThreshold: 5 }));
}

export async function getVials(): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.category === "vial");
}

export async function getPens(): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.category === "pen");
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const all = await getProducts();
  return all.find((p) => p.id === id);
}

export async function getAdjacentProducts(id: string) {
  const all = await getProducts();
  const product = all.find((p) => p.id === id);
  if (!product) {
    return { prev: all[0], next: all[1] };
  }
  const sameCat = all.filter((p) => p.category === product.category);
  const idx = sameCat.findIndex((p) => p.id === id);
  const prev = sameCat[(idx - 1 + sameCat.length) % sameCat.length];
  const next = sameCat[(idx + 1) % sameCat.length];
  return { prev, next };
}
