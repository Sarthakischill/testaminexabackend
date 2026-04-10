import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("promo_codes")
    .select("*, sales_reps(id, name)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ codes: data });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { code, discountPercent, discountFixed, salesRepId, maxUses, expiresAt, applicableProductIds, productDiscounts } = body;

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const normalizedCode = code.trim().toUpperCase();

  if (discountPercent && (discountPercent < 0 || discountPercent > 100)) {
    return NextResponse.json({ error: "Discount percent must be 0-100" }, { status: 400 });
  }

  if (discountFixed && discountFixed < 0) {
    return NextResponse.json({ error: "Discount amount must be positive" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("promo_codes")
    .select("id")
    .eq("code", normalizedCode)
    .single();

  if (existing) {
    return NextResponse.json({ error: "A promo code with this name already exists" }, { status: 409 });
  }

  const hasProductDiscounts = productDiscounts && typeof productDiscounts === "object" && Object.keys(productDiscounts).length > 0;
  const derivedProductIds = hasProductDiscounts ? Object.keys(productDiscounts) : null;

  const insertData: Record<string, unknown> = {
    code: normalizedCode,
    discount_percent: discountPercent || 0,
    discount_fixed: discountFixed || 0,
    sales_rep_id: salesRepId || null,
    max_uses: maxUses || null,
    expires_at: expiresAt || null,
    applicable_product_ids: derivedProductIds
      ?? (Array.isArray(applicableProductIds) && applicableProductIds.length > 0 ? applicableProductIds : null),
    product_discounts: hasProductDiscounts ? productDiscounts : null,
  };

  const { data, error } = await admin
    .from("promo_codes")
    .insert(insertData)
    .select("*, sales_reps(id, name)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ code: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const allowedFields = ["active", "max_uses", "discount_percent", "discount_fixed", "expires_at", "sales_rep_id"];
  const updateData: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (body.maxUses !== undefined) {
    updateData.max_uses = body.maxUses === null || body.maxUses === "" ? null : Number(body.maxUses);
  }
  if (body.discountPercent !== undefined) {
    updateData.discount_percent = Number(body.discountPercent) || 0;
  }
  if (body.discountFixed !== undefined) {
    updateData.discount_fixed = Number(body.discountFixed) || 0;
  }
  if (body.expiresAt !== undefined) {
    updateData.expires_at = body.expiresAt || null;
  }
  if (body.salesRepId !== undefined) {
    updateData.sales_rep_id = body.salesRepId || null;
  }
  if (body.productDiscounts !== undefined) {
    const pd = body.productDiscounts;
    const hasPd = pd && typeof pd === "object" && Object.keys(pd).length > 0;
    updateData.product_discounts = hasPd ? pd : null;
    updateData.applicable_product_ids = hasPd ? Object.keys(pd) : null;
  } else if (body.applicableProductIds !== undefined) {
    updateData.applicable_product_ids =
      Array.isArray(body.applicableProductIds) && body.applicableProductIds.length > 0
        ? body.applicableProductIds
        : null;
  }

  const admin = createAdminClient();

  if (body.code !== undefined) {
    const newCode = (body.code || "").trim().toUpperCase();
    if (!newCode) {
      return NextResponse.json({ error: "Code cannot be empty" }, { status: 400 });
    }
    const { data: existing } = await admin
      .from("promo_codes")
      .select("id")
      .eq("code", newCode)
      .neq("id", id)
      .single();
    if (existing) {
      return NextResponse.json({ error: "A promo code with this name already exists" }, { status: 409 });
    }
    updateData.code = newCode;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("promo_codes")
    .update(updateData)
    .eq("id", id)
    .select("*, sales_reps(id, name)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ code: data });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("promo_codes").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
