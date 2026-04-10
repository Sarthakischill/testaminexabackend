import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SHIPPING_TIERS } from "@/lib/shipstation";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/cart-context";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { subtotal } = body;
  const orderSubtotal = typeof subtotal === "number" ? subtotal : 0;
  const freeShippingEligible = orderSubtotal >= FREE_SHIPPING_THRESHOLD;

  const tiers = SHIPPING_TIERS.map((t) => ({
    id: t.id,
    label: t.label,
    description: t.description,
    deliveryEstimate: t.deliveryEstimate,
    customerPrice: t.id === "standard" && freeShippingEligible ? 0 : t.customerPrice,
    isFree: t.id === "standard" && freeShippingEligible,
  }));

  return NextResponse.json({ tiers });
}
