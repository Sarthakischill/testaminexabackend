import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getInvoiceStatus, isConnected } from "@/lib/qbo";
import { sendOrderConfirmedEmail } from "@/lib/emails/send";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const { data: order, error } = await adminClient
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status === "confirmed" || order.status === "processing" || order.status === "shipped" || order.status === "delivered") {
    return NextResponse.json({ paid: true });
  }

  if (!order.qbo_invoice_id) {
    return NextResponse.json({ paid: false, error: "No invoice found" });
  }

  const connected = await isConnected();
  if (!connected) {
    return NextResponse.json({ paid: false, error: "QBO not connected" });
  }

  try {
    const { paid } = await getInvoiceStatus(order.qbo_invoice_id);

    if (paid) {
      const now = new Date().toISOString();
      await adminClient
        .from("orders")
        .update({
          status: "confirmed",
          confirmed_at: now,
          updated_at: now,
        })
        .eq("id", orderId);

      if (process.env.SHIPSTATION_API_KEY_V1 || process.env.SHIPSTATION_API_KEY) {
        try {
          const { createOrder: ssCreateOrder } = await import("@/lib/shipstation");
          const ssResult = await ssCreateOrder({
            orderNumber: order.order_number || order.id.slice(0, 12),
            orderDate: order.created_at,
            orderStatus: "awaiting_shipment",
            shipTo: {
              name: order.shipping_name,
              street1: order.shipping_address,
              city: order.shipping_city,
              state: order.shipping_state,
              postalCode: order.shipping_zip,
              country: "US",
            },
            items: (
              order.items as { name: string; quantity: number; price: number }[]
            ).map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
            })),
            amountPaid: order.total,
            shippingAmount: order.shipping_fee || 0,
            carrierCode: order.carrier_code || undefined,
            serviceCode: order.service_code || undefined,
            requestedShippingService: order.service_name || undefined,
          });

          await adminClient
            .from("orders")
            .update({ shipstation_order_id: String(ssResult.orderId) })
            .eq("id", orderId);
        } catch (err) {
          console.error("ShipStation push on QBO payment:", err);
        }
      }

      try {
        await sendOrderConfirmedEmail(order);
      } catch {
        // Non-blocking
      }

      return NextResponse.json({ paid: true });
    }

    return NextResponse.json({ paid: false });
  } catch (err) {
    console.error("QBO status check error:", err);
    return NextResponse.json({ paid: false, error: "Status check failed" });
  }
}
