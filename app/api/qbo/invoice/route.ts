import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createInvoice, isConnected } from "@/lib/qbo";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connected = await isConnected();
  if (!connected) {
    return NextResponse.json(
      { error: "QuickBooks is not connected" },
      { status: 503 }
    );
  }

  const { orderId } = await request.json();
  if (!orderId) {
    return NextResponse.json(
      { error: "orderId is required" },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();
  const { data: order, error: orderError } = await adminClient
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.payment_method !== "credit_card") {
    return NextResponse.json(
      { error: "Order is not a credit card order" },
      { status: 400 }
    );
  }

  if (order.qbo_invoice_id) {
    const tokens = await import("@/lib/qbo").then((m) => m.getTokens());
    const env = process.env.QBO_ENVIRONMENT || "sandbox";
    const domain =
      env === "production"
        ? "https://app.qbo.intuit.com"
        : "https://app.sandbox.qbo.intuit.com";
    const paymentLink = `${domain}/app/customerlink?txnId=${order.qbo_invoice_id}&txnType=invoice&realmId=${tokens?.realm_id}`;

    return NextResponse.json({
      invoiceId: order.qbo_invoice_id,
      paymentLink,
    });
  }

  try {
    const items = (order.items || []).map(
      (item: { name: string; quantity: number; price: number; volume?: string }) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        volume: item.volume,
      })
    );

    const { invoiceId, paymentLink } = await createInvoice({
      id: order.id,
      order_number: order.order_number,
      items,
      total: order.total,
      subtotal: order.subtotal || order.total,
      shipping_name: order.shipping_name,
      shipping_email: order.shipping_email,
      shipping_fee: order.shipping_fee,
      cold_chain_fee: order.cold_chain_fee,
      promo_discount: order.promo_discount,
      payment_discount: order.payment_discount,
    });

    await adminClient
      .from("orders")
      .update({ qbo_invoice_id: invoiceId })
      .eq("id", orderId);

    return NextResponse.json({ invoiceId, paymentLink });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invoice creation failed";
    console.error("QBO invoice creation error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
