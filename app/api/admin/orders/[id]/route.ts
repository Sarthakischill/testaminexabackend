import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import {
  sendOrderConfirmedEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
} from "@/lib/emails/send";
import { createOrder } from "@/lib/shipstation";

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
  const { data: order, error } = await adminClient
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
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
  const { status, trackingNumber, archived, notes } = body;

  const adminClient = createAdminClient();

  // Fetch current order to validate transition
  const { data: currentOrder } = await adminClient
    .from("orders")
    .select("status")
    .eq("id", id)
    .single();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof archived === "boolean") {
    updateData.archived = archived;
  }

  if (typeof notes === "string") {
    updateData.admin_notes = notes;
  }

  const VALID_TRANSITIONS: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    awaiting_payment: ["confirmed", "cancelled"],
    confirmed: ["processing", "shipped", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  let statusChanged = false;

  if (status) {
    const validStatuses = Object.keys(VALID_TRANSITIONS);
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const currentStatus = currentOrder?.status || "pending";
    if (currentStatus === status) {
      // No-op: status unchanged, skip side effects
    } else {
      const allowed = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${currentStatus} to ${status}` },
          { status: 400 }
        );
      }
      statusChanged = true;
    }

    updateData.status = status;

    if (status === "confirmed" && statusChanged) {
      updateData.confirmed_at = new Date().toISOString();
    }
    if (status === "shipped") {
      if (statusChanged) {
        updateData.shipped_at = new Date().toISOString();
      }
      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }
    }
  }

  const { data: order, error } = await adminClient
    .from("orders")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let shipstationError: string | null = null;

  if (status === "confirmed" && statusChanged && (process.env.SHIPSTATION_API_KEY_V1 || process.env.SHIPSTATION_API_KEY)) {
    try {
      const ssResult = await createOrder({
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
        items: (order.items as { name: string; quantity: number; price: number }[]).map(
          (item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
          })
        ),
        amountPaid: order.total,
        shippingAmount: order.shipping_fee || 0,
        carrierCode: order.carrier_code || undefined,
        serviceCode: order.service_code || undefined,
        requestedShippingService: order.service_name || undefined,
      });

      await adminClient
        .from("orders")
        .update({ shipstation_order_id: String(ssResult.orderId) })
        .eq("id", id);

      order.shipstation_order_id = String(ssResult.orderId);
    } catch (err) {
      shipstationError =
        err instanceof Error ? err.message : "ShipStation push failed";
      console.error("ShipStation order push failed:", err);
    }
  }

  if (statusChanged) {
    try {
      if (status === "confirmed") {
        await sendOrderConfirmedEmail(order);
      } else if (status === "shipped") {
        await sendOrderShippedEmail(order, trackingNumber, order.carrier_code);
      } else if (status === "delivered") {
        await sendOrderDeliveredEmail(order, order.tracking_number, order.carrier_code);
      } else if (status === "cancelled") {
        await sendOrderCancelledEmail(order);
      }
    } catch (err) {
      console.error("Order email send failed:", err);
    }
  }

  return NextResponse.json({
    order,
    ...(shipstationError && { shipstationWarning: shipstationError }),
  });
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

  const { error } = await adminClient
    .from("orders")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
