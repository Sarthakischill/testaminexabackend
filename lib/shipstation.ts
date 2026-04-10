import { siteConfig } from "@/config/site";

const API_BASE_V1 = "https://ssapi.shipstation.com";

function getOriginAddress() {
  return {
    name: process.env.SHIPSTATION_FROM_NAME || siteConfig.name,
    street1: process.env.SHIPSTATION_FROM_STREET || "",
    city: process.env.SHIPSTATION_FROM_CITY || "",
    state: process.env.SHIPSTATION_FROM_STATE || "",
    postalCode: process.env.SHIPSTATION_FROM_ZIP || "",
    country: "US",
  };
}

export type ShipStationAddress = {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
};

export type ShippingTierConfig = {
  id: "standard" | "priority" | "express";
  label: string;
  description: string;
  deliveryEstimate: string;
  customerPrice: number;
};

export const SHIPPING_TIERS: ShippingTierConfig[] = [
  {
    id: "standard",
    label: "Standard Shipping",
    description: "Reliable ground delivery",
    deliveryEstimate: "5–7 business days",
    customerPrice: 5.99,
  },
  {
    id: "priority",
    label: "Priority Shipping",
    description: "Faster delivery",
    deliveryEstimate: "2–3 business days",
    customerPrice: 12.99,
  },
  {
    id: "express",
    label: "Express Shipping",
    description: "Fastest available option",
    deliveryEstimate: "1–2 business days",
    customerPrice: 29.99,
  },
];

export type ShipStationOrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  weight?: { value: number; units: string };
};

export type CreateOrderPayload = {
  orderNumber: string;
  orderDate: string;
  orderStatus: "awaiting_shipment" | "on_hold";
  shipTo: ShipStationAddress;
  items: ShipStationOrderItem[];
  amountPaid: number;
  shippingAmount: number;
  carrierCode?: string;
  serviceCode?: string;
  requestedShippingService?: string;
};

class ShipStationError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ShipStationError";
    this.status = status;
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);

    if (res.status === 429 && attempt < maxRetries) {
      const retryAfter = res.headers.get("Retry-After");
      const waitMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : Math.pow(2, attempt + 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    return res;
  }

  throw new ShipStationError("Max retries exceeded", 429);
}

export async function createOrder(
  payload: CreateOrderPayload
): Promise<{ orderId: number; orderNumber: string }> {
  const origin = getOriginAddress();

  const v1Body = {
    orderNumber: payload.orderNumber,
    orderDate: payload.orderDate,
    orderStatus: payload.orderStatus,
    billTo: {
      name: payload.shipTo.name,
      street1: payload.shipTo.street1,
      street2: payload.shipTo.street2 || null,
      city: payload.shipTo.city,
      state: payload.shipTo.state,
      postalCode: payload.shipTo.postalCode,
      country: payload.shipTo.country,
    },
    shipTo: {
      name: payload.shipTo.name,
      street1: payload.shipTo.street1,
      street2: payload.shipTo.street2 || null,
      city: payload.shipTo.city,
      state: payload.shipTo.state,
      postalCode: payload.shipTo.postalCode,
      country: payload.shipTo.country,
    },
    items: payload.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      weight: item.weight || { value: 4, units: "ounces" },
    })),
    amountPaid: payload.amountPaid,
    shippingAmount: payload.shippingAmount,
    carrierCode: payload.carrierCode || null,
    serviceCode: payload.serviceCode || null,
    requestedShippingService: payload.requestedShippingService || null,
    shipFrom: {
      name: origin.name,
      street1: origin.street1,
      city: origin.city,
      state: origin.state,
      postalCode: origin.postalCode,
      country: origin.country,
    },
  };

  const v1Key = process.env.SHIPSTATION_API_KEY_V1 || process.env.SHIPSTATION_API_KEY || "";
  const v1Secret = process.env.SHIPSTATION_API_SECRET || "";

  if (!v1Key || !v1Secret) {
    throw new ShipStationError("ShipStation API credentials not configured", 500);
  }

  const authHeader = Buffer.from(`${v1Key}:${v1Secret}`).toString("base64");

  const res = await fetchWithRetry(`${API_BASE_V1}/orders/createorder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify(v1Body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ShipStationError(
      `ShipStation create order error: ${text}`,
      res.status
    );
  }

  const data = await res.json();

  return {
    orderId: data.orderId,
    orderNumber: data.orderNumber,
  };
}

export function buildTrackingUrl(
  carrierCode: string,
  trackingNumber: string
): string {
  const code = carrierCode.toLowerCase();

  if (code.includes("usps")) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  }
  if (code.includes("fedex")) {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  }
  if (code.includes("ups")) {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  }
  if (code.includes("dhl")) {
    return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${trackingNumber}`;
  }

  return `https://parcelsapp.com/en/tracking/${trackingNumber}`;
}
