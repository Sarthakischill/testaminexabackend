import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminClient = createAdminClient();
  const { data: product, error } = await adminClient
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const allowedFields = [
    "name",
    "full_name",
    "price",
    "display_price",
    "purity",
    "volume",
    "hex",
    "image",
    "scale_class",
    "color_from",
    "color_to",
    "accent_glow",
    "description",
    "benefits",
    "faqs",
    "category",
    "brand",
    "coming_soon",
    "sort_order",
    "active",
    "inventory_quantity",
    "inventory_status",
    "low_stock_threshold",
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  if (updateData.category && !["vial", "pen"].includes(updateData.category as string)) {
    return NextResponse.json({ error: "Category must be 'vial' or 'pen'" }, { status: 400 });
  }

  if (updateData.price !== undefined) {
    const numPrice = Number(updateData.price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
    }
    updateData.price = numPrice;
    updateData.display_price = `$${numPrice.toFixed(2)}`;
  }

  const adminClient = createAdminClient();
  const { data: product, error } = await adminClient
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminClient = createAdminClient();

  const { data: orders } = await adminClient
    .from("orders")
    .select("id")
    .contains("items", [{ product_id: id }])
    .limit(1);

  if (orders && orders.length > 0) {
    const { error } = await adminClient
      .from("products")
      .update({ active: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Product has existing orders and was deactivated instead of deleted",
      deactivated: true,
    });
  }

  const { error } = await adminClient.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Product deleted" });
}
