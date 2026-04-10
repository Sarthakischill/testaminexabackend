import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const code = (body.code || "").trim().toUpperCase();
  if (!code || code.length > 50) {
    return NextResponse.json({ error: "Invalid promo code" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: promo, error } = await admin
    .from("promo_codes")
    .select("*, sales_reps(id, name)")
    .eq("code", code)
    .eq("active", true)
    .single();

  if (error || !promo) {
    return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 404 });
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ error: "This promo code has expired" }, { status: 410 });
  }

  if (promo.max_uses && promo.times_used >= promo.max_uses) {
    return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 410 });
  }

  return NextResponse.json({
    code: promo.code,
    discountPercent: Number(promo.discount_percent),
    discountFixed: Number(promo.discount_fixed),
    salesRepId: promo.sales_rep_id,
    salesRepName: promo.sales_reps?.name || null,
    applicableProductIds: promo.applicable_product_ids || null,
    productDiscounts: promo.product_discounts || null,
  });
}
