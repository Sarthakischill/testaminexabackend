import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderShippedEmail } from "@/lib/emails/send";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { resource_url, resource_type } = body;

  if (resource_type !== "SHIP_NOTIFY" && resource_type !== "ITEM_SHIP_NOTIFY") {
    return NextResponse.json({ status: "ignored" });
  }

  if (!resource_url) {
    return NextResponse.json(
      { error: "Missing resource_url" },
      { status: 400 }
    );
  }

  // Validate that the resource URL points to ShipStation's API
  try {
    const url = new URL(resource_url);
    if (!url.hostname.endsWith("shipstation.com")) {
      return NextResponse.json({ error: "Invalid resource_url domain" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid resource_url" }, { status: 400 });
  }

  const v1Key = process.env.SHIPSTATION_API_KEY_V1 || process.env.SHIPSTATION_API_KEY || "";
  const v1Secret = process.env.SHIPSTATION_API_SECRET || "";

  if (!v1Key) {
    console.error("SHIPSTATION_API_KEY_V1 not configured for webhook");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  try {
    const authHeader = Buffer.from(`${v1Key}:${v1Secret}`).toString("base64");

    const res = await fetch(resource_url, {
      headers: { Authorization: `Basic ${authHeader}` },
    });

    if (!res.ok) {
      console.error(
        "Failed to fetch ShipStation resource:",
        res.status,
        await res.text()
      );
      return NextResponse.json(
        { error: "Failed to fetch resource" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const shipments = data.shipments || [data];

    console.log(`ShipStation webhook: ${resource_type}, ${shipments.length} shipment(s)`);

    const adminClient = createAdminClient();

    for (const shipment of shipments) {
      const trackingNumber = shipment.trackingNumber;
      const orderNumber = shipment.orderNumber;
      const carrierCode = shipment.carrierCode;

      if (!orderNumber) {
        console.log("ShipStation webhook: skipping shipment with no orderNumber");
        continue;
      }

      console.log(`ShipStation webhook: processing ${orderNumber}, tracking: ${trackingNumber}, carrier: ${carrierCode}`);

      const { data: order, error: lookupError } = await adminClient
        .from("orders")
        .select("*")
        .or(
          `shipstation_order_id.eq.${shipment.orderId},order_number.eq.${orderNumber}`
        )
        .single();

      if (lookupError || !order) {
        console.error(
          `Webhook: could not find order for ${orderNumber}:`,
          lookupError
        );
        continue;
      }

      // Skip if already shipped/delivered to avoid duplicate emails
      if (order.status === "shipped" || order.status === "delivered") {
        continue;
      }

      const now = new Date().toISOString();
      const updateData: Record<string, unknown> = {
        status: "shipped",
        updated_at: now,
        shipped_at: now,
      };

      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }

      if (carrierCode) {
        updateData.carrier_code = carrierCode;
      }

      const { error: updateError } = await adminClient.from("orders").update(updateData).eq("id", order.id);

      if (updateError) {
        console.error(`Webhook: failed to update order ${order.id}:`, updateError);
        continue;
      }

      console.log(`Webhook: order ${orderNumber} updated to shipped`);

      try {
        await sendOrderShippedEmail(
          { ...order, ...updateData } as typeof order,
          trackingNumber,
          carrierCode
        );
      } catch (emailErr) {
        console.error("Webhook: failed to send shipped email:", emailErr);
      }
    }

    return NextResponse.json({ status: "processed" });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
