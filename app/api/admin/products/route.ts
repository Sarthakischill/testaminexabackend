import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminClient = createAdminClient();
  const { data: products, error } = await adminClient
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: products || [] });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    id,
    name,
    full_name,
    price,
    display_price,
    purity,
    volume,
    hex,
    image,
    scale_class,
    color_from,
    color_to,
    accent_glow,
    description,
    benefits,
    faqs,
    category,
    brand,
    coming_soon,
    sort_order,
    active,
    inventory_quantity,
    inventory_status,
    low_stock_threshold,
  } = body;

  if (!id || !name || !full_name || price == null || !volume || !image || !category) {
    return NextResponse.json(
      { error: "Missing required fields: id, name, full_name, price, volume, image, category" },
      { status: 400 }
    );
  }

  if (!["vial", "pen"].includes(category)) {
    return NextResponse.json({ error: "Category must be 'vial' or 'pen'" }, { status: 400 });
  }

  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice < 0) {
    return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
  }

  const slug = id
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    return NextResponse.json({ error: "Product ID must contain at least one alphanumeric character" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: existing } = await adminClient
    .from("products")
    .select("id")
    .eq("id", slug)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "A product with this ID already exists" }, { status: 409 });
  }

  const { data: product, error } = await adminClient
    .from("products")
    .insert({
      id: slug,
      name,
      full_name,
      price: Number(price),
      display_price: display_price || `$${Number(price).toFixed(2)}`,
      purity: purity || "99.0%",
      volume,
      hex: hex || "#ffffff",
      image,
      scale_class: scale_class || "scale-100",
      color_from: color_from || "",
      color_to: color_to || "",
      accent_glow: accent_glow || "",
      description: description || "",
      benefits: benefits || [],
      faqs: faqs || [],
      category,
      brand: brand || null,
      coming_soon: coming_soon ?? false,
      sort_order: sort_order ?? 0,
      active: active ?? true,
      inventory_quantity: inventory_quantity ?? 0,
      inventory_status: inventory_status ?? "not_ready",
      low_stock_threshold: low_stock_threshold ?? 5,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product }, { status: 201 });
}
