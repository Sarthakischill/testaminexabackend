import { getResend, FROM_EMAIL } from "@/lib/resend";
import { getEmailSetting } from "@/lib/emails/settings";
import {
  emailWrapper,
  emailHeading,
  emailSubtext,
  emailCard,
  emailLabel,
  emailButton,
  emailStatusBadge,
  emailDivider,
} from "@/lib/emails/template";

function getCarrierDisplayName(carrierCode?: string): string | null {
  if (!carrierCode) return null;
  const code = carrierCode.toLowerCase();
  if (code.includes("usps")) return "USPS";
  if (code.includes("fedex")) return "FedEx";
  if (code.includes("ups")) return "UPS";
  if (code.includes("dhl")) return "DHL";
  return carrierCode.toUpperCase();
}

function buildTrackingLink(carrierCode?: string, trackingNumber?: string): string | null {
  if (!trackingNumber) return null;
  const code = (carrierCode || "").toLowerCase();
  if (code.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  if (code.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  if (code.includes("ups")) return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  if (code.includes("dhl")) return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${trackingNumber}`;
  return `https://parcelsapp.com/en/tracking/${trackingNumber}`;
}

type OrderData = {
  id: string;
  total: number;
  subtotal?: number;
  items: { name: string; quantity: number; price: number; volume?: string }[];
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  status: string;
  created_at: string;
  zelle_screenshot_url?: string | null;
  order_number?: string | null;
  payment_method?: string | null;
  shipping_fee?: number;
  cold_chain?: boolean;
  cold_chain_fee?: number;
};

function formatOrderItems(items: OrderData["items"]): string {
  return items
    .map(
      (i) => `
      <tr>
        <td style="font-family: Helvetica, Arial, sans-serif; padding: 10px 0; font-size: 14px; color: #333; border-bottom: 1px solid #f0f0f0;">
          ${i.name} <span style="color: #999;">(${i.volume || "N/A"})</span>
        </td>
        <td style="font-family: Helvetica, Arial, sans-serif; padding: 10px 0; font-size: 14px; color: #999; text-align: center; border-bottom: 1px solid #f0f0f0;">
          x${i.quantity}
        </td>
        <td style="font-family: Helvetica, Arial, sans-serif; padding: 10px 0; font-size: 14px; color: #333; text-align: right; font-weight: 500; border-bottom: 1px solid #f0f0f0;">
          $${(i.price * i.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");
}

function orderItemsTable(items: OrderData["items"], total: number, order?: OrderData): string {
  const shippingLine = order && typeof order.shipping_fee === "number"
    ? `<tr>
        <td colspan="2" style="font-family: Helvetica, Arial, sans-serif; padding: 6px 0; font-size: 13px; color: #888;">Shipping</td>
        <td style="font-family: Helvetica, Arial, sans-serif; padding: 6px 0; font-size: 13px; color: #888; text-align: right;">${order.shipping_fee > 0 ? `$${Number(order.shipping_fee).toFixed(2)}` : '<span style="color: #16a34a;">Free</span>'}</td>
      </tr>`
    : "";

  const coldChainLine = order?.cold_chain
    ? `<tr>
        <td colspan="2" style="font-family: Helvetica, Arial, sans-serif; padding: 6px 0; font-size: 13px; color: #0891b2;">❄️ Cold Chain Packaging</td>
        <td style="font-family: Helvetica, Arial, sans-serif; padding: 6px 0; font-size: 13px; color: #0891b2; text-align: right;">$${Number(order.cold_chain_fee || 0).toFixed(2)}</td>
      </tr>`
    : "";

  return emailCard(`
    ${emailLabel("Order Items")}
    <table style="width: 100%; border-collapse: collapse;">
      ${formatOrderItems(items)}
      ${shippingLine}
      ${coldChainLine}
    </table>
    ${emailDivider()}
    <p style="font-family: Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 500; text-align: right; margin: 8px 0 0; color: #000;">
      $${total.toFixed(2)}
    </p>
  `);
}

function orderNumberBlock(orderNumber: string): string {
  return `
    <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
      ${emailLabel("Order Number")}
      <p style="font-family: Helvetica, Arial, sans-serif; font-size: 28px; font-weight: 300; color: #0c4a6e; margin: 4px 0 0; letter-spacing: 0.05em;">${orderNumber}</p>
    </div>`;
}

function shippingBlock(order: OrderData): string {
  return emailCard(`
    ${emailLabel("Shipping To")}
    <p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #555; line-height: 1.7; margin: 0;">
      ${order.shipping_name}<br/>
      ${order.shipping_address}<br/>
      ${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}
    </p>
  `);
}

function paymentLabel(method: string | null | undefined): string {
  if (method === "crypto") return "USDC";
  if (method === "credit_card") return "Credit Card";
  return "Zelle";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function sendOrderReceivedCustomerEmail(order: OrderData, paymentLink?: string | null) {
  const setting = await getEmailSetting("order_received");
  if (!setting.enabled) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const isCreditCard = order.payment_method === "credit_card";

  const subjectLine = isCreditCard
    ? `Complete Your Payment — ${order.order_number || order.id.slice(0, 8).toUpperCase()}`
    : `Order Received — ${order.order_number || order.id.slice(0, 8).toUpperCase()}`;

  const subtext = isCreditCard
    ? `Thank you, ${order.shipping_name}. We've received your order. A payment invoice has been sent to your email from QuickBooks — please check your inbox (including spam/junk) to complete your payment.`
    : `Thank you, ${order.shipping_name}. We've received your order and your ${paymentLabel(order.payment_method)} payment is being verified.`;

  const statusBadge = isCreditCard
    ? emailStatusBadge(`<strong>Status: Awaiting Payment</strong><br/>Look for an email from QuickBooks with the subject "Invoice" to complete your payment. Your order will be automatically confirmed once paid.`, "orange")
    : emailStatusBadge(`<strong>Status: Pending Verification</strong><br/>Your ${paymentLabel(order.payment_method)} payment is being reviewed. You'll receive a confirmation email once verified.`, "amber");

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: order.shipping_email,
    ...(setting.recipients.length > 0 && { cc: setting.recipients }),
    subject: subjectLine,
    html: emailWrapper(`
      ${emailHeading(isCreditCard ? "Complete Your Payment" : "Order Received")}
      ${emailSubtext(subtext)}
      ${order.order_number ? orderNumberBlock(order.order_number) : ""}
      ${orderItemsTable(order.items, order.total, order)}
      ${statusBadge}
      ${shippingBlock(order)}
      ${emailButton(`${siteUrl}/portal/orders/${order.id}`, "View Order")}
    `),
  });
}

export async function sendOrderReceivedOwnerEmail(order: OrderData) {
  const setting = await getEmailSetting("order_notification");
  if (!setting.enabled || setting.recipients.length === 0) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: setting.recipients,
    subject: `New Order ${order.order_number || ""} — $${order.total.toFixed(2)} from ${order.shipping_name}`,
    html: emailWrapper(`
      ${emailHeading("New Order Received")}
      ${emailSubtext(`A new order has been placed and is awaiting ${paymentLabel(order.payment_method)} verification.`)}

      ${emailCard(`
        ${order.order_number ? `
          ${emailLabel("Order Number (Payment Memo)")}
          <p style="font-family: Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 400; margin: 0 0 16px; letter-spacing: 0.03em; color: #000;">${order.order_number}</p>
        ` : `
          ${emailLabel("Order ID")}
          <p style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 500; margin: 0 0 16px; color: #000;">${order.id.slice(0, 8).toUpperCase()}</p>
        `}
        ${emailLabel("Customer")}
        <p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; margin: 0 0 4px; color: #333;">${order.shipping_name}</p>
        <p style="font-family: Helvetica, Arial, sans-serif; font-size: 13px; margin: 0; color: #888;">
          <a href="mailto:${order.shipping_email}" style="color: #0369a1;">${order.shipping_email}</a>
        </p>
      `)}

      ${orderItemsTable(order.items, order.total, order)}
      ${shippingBlock(order)}

      ${emailButton(`${siteUrl}/admin/orders/${order.id}`, "Review in Admin")}

      <p style="font-family: Helvetica, Arial, sans-serif; color: #ccc; font-size: 11px; text-align: center; margin-top: 24px;">
        Order placed ${formatDate(order.created_at)}
      </p>
    `),
  });
}

export async function sendOrderConfirmedEmail(order: OrderData) {
  const setting = await getEmailSetting("order_confirmed");
  if (!setting.enabled) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: order.shipping_email,
    ...(setting.recipients.length > 0 && { cc: setting.recipients }),
    subject: `Payment Verified — Order ${order.order_number || order.id.slice(0, 8).toUpperCase()} Confirmed`,
    html: emailWrapper(`
      ${emailHeading("Payment Verified")}
      ${emailSubtext(`Great news, ${order.shipping_name}! Your ${paymentLabel(order.payment_method)} payment has been verified and your order is now being prepared.`)}
      ${emailStatusBadge(`<strong>Status: Confirmed</strong><br/>Your order is being carefully prepared and packaged${order.cold_chain ? " with cold-chain materials" : ""}.`, "green")}
      ${orderItemsTable(order.items, order.total, order)}
      ${emailButton(`${siteUrl}/portal/orders/${order.id}`, "View Order")}
    `),
  });
}

export async function sendOrderCancelledEmail(order: OrderData) {
  const setting = await getEmailSetting("order_confirmed");
  if (!setting.enabled) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: order.shipping_email,
    ...(setting.recipients.length > 0 && { cc: setting.recipients }),
    subject: `Order Cancelled — ${order.order_number || order.id.slice(0, 8).toUpperCase()}`,
    html: emailWrapper(`
      ${emailHeading("Order Cancelled")}
      ${emailSubtext(`Hi ${order.shipping_name}, your order has been cancelled.`)}
      ${emailStatusBadge(`<strong>Status: Cancelled</strong><br/>If you believe this is an error or you've already sent payment, please contact us.`, "red")}
      ${orderItemsTable(order.items, order.total, order)}
      ${emailButton(`${siteUrl}/portal/orders/${order.id}`, "View Order")}
      ${emailButton(`${siteUrl}/contact`, "Contact Support")}
    `),
  });
}

export async function sendOrderShippedEmail(order: OrderData, trackingNumber?: string, carrierCode?: string) {
  const setting = await getEmailSetting("order_shipped");
  if (!setting.enabled) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const carrierName = getCarrierDisplayName(carrierCode);
  const trackingUrl = trackingNumber ? buildTrackingLink(carrierCode, trackingNumber) : null;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: order.shipping_email,
    ...(setting.recipients.length > 0 && { cc: setting.recipients }),
    subject: `Order Shipped — ${order.order_number || order.id.slice(0, 8).toUpperCase()}`,
    html: emailWrapper(`
      ${emailHeading("Order Shipped")}
      ${emailSubtext(`Your order is on its way, ${order.shipping_name}!${order.cold_chain ? " It has been packed in insulated cold-chain packaging." : ""}`)}

      ${trackingNumber ? `
        <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
          ${carrierName ? `<p style="font-family: Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #a78bfa; margin: 0 0 8px;">Shipped via ${carrierName}</p>` : ""}
          ${emailLabel("Tracking Number")}
          <p style="font-family: Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 500; color: #5b21b6; margin: 4px 0 0;">${trackingNumber}</p>
          ${trackingUrl ? `
            <a href="${trackingUrl}" target="_blank" style="display: inline-block; margin-top: 16px; padding: 10px 24px; background: #7c3aed; color: #fff; font-family: Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 8px; letter-spacing: 0.05em;">
              Track Package →
            </a>
          ` : ""}
        </div>
      ` : ""}

      ${shippingBlock(order)}
      ${orderItemsTable(order.items, order.total, order)}
      ${emailButton(`${siteUrl}/portal/orders/${order.id}`, "View Order")}
    `),
  });
}

export async function sendOrderDeliveredEmail(order: OrderData, trackingNumber?: string, carrierCode?: string) {
  const setting = await getEmailSetting("order_shipped");
  if (!setting.enabled) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const carrierName = getCarrierDisplayName(carrierCode);
  const trackingUrl = trackingNumber ? buildTrackingLink(carrierCode, trackingNumber) : null;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: order.shipping_email,
    ...(setting.recipients.length > 0 && { cc: setting.recipients }),
    subject: `Order Delivered — ${order.order_number || order.id.slice(0, 8).toUpperCase()}`,
    html: emailWrapper(`
      ${emailHeading("Order Delivered")}
      ${emailSubtext(`Great news, ${order.shipping_name} — your order has been delivered!`)}

      ${emailStatusBadge(`<strong>Status: Delivered</strong><br/>Your package has arrived. We hope you're happy with your order!`, "green")}

      ${trackingNumber ? `
        <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
          ${carrierName ? `<p style="font-family: Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #a78bfa; margin: 0 0 8px;">Delivered via ${carrierName}</p>` : ""}
          ${emailLabel("Tracking Number")}
          <p style="font-family: Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 500; color: #5b21b6; margin: 4px 0 0;">${trackingNumber}</p>
          ${trackingUrl ? `
            <a href="${trackingUrl}" target="_blank" style="display: inline-block; margin-top: 16px; padding: 10px 24px; background: #7c3aed; color: #fff; font-family: Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 8px; letter-spacing: 0.05em;">
              View Delivery Details →
            </a>
          ` : ""}
        </div>
      ` : ""}

      ${orderItemsTable(order.items, order.total, order)}
      ${emailButton(`${siteUrl}/portal/orders/${order.id}`, "View Order")}

      <p style="font-family: Helvetica, Arial, sans-serif; color: #888; font-size: 13px; text-align: center; margin-top: 24px; line-height: 1.6;">
        Questions about your order? <a href="${siteUrl}/contact" style="color: #0369a1; text-decoration: underline;">Contact us</a>
      </p>
    `),
  });
}
