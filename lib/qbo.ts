import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";

const INTUIT_AUTH_URL = "https://appcenter.intuit.com/connect/oauth2";
const INTUIT_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

function getBaseUrl(): string {
  const env = process.env.QBO_ENVIRONMENT || "sandbox";
  return env === "production"
    ? "https://quickbooks.api.intuit.com"
    : "https://sandbox-quickbooks.api.intuit.com";
}

function getClientId(): string {
  const id = process.env.QBO_CLIENT_ID;
  if (!id) throw new Error("QBO_CLIENT_ID is not configured");
  return id;
}

function getClientSecret(): string {
  const secret = process.env.QBO_CLIENT_SECRET;
  if (!secret) throw new Error("QBO_CLIENT_SECRET is not configured");
  return secret;
}

function getRedirectUri(): string {
  return (
    process.env.QBO_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/qbo/callback`
  );
}

type QboTokens = {
  access_token: string;
  refresh_token: string;
  realm_id: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
};

export function buildOAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    response_type: "code",
    scope: "com.intuit.quickbooks.accounting com.intuit.quickbooks.payment",
    redirect_uri: getRedirectUri(),
    state: state || "qbo-connect",
  });
  return `${INTUIT_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(
  code: string,
  realmId: string
): Promise<void> {
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(INTUIT_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  const data = await res.json();
  const now = new Date();

  const supabase = createAdminClient();
  await supabase.from("qbo_tokens").upsert({
    id: "default",
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    realm_id: realmId,
    access_token_expires_at: new Date(
      now.getTime() + data.expires_in * 1000
    ).toISOString(),
    refresh_token_expires_at: new Date(
      now.getTime() + (data.x_refresh_token_expires_in || 8640000) * 1000
    ).toISOString(),
    updated_at: now.toISOString(),
  });
}

export async function getTokens(): Promise<QboTokens | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("qbo_tokens")
    .select("*")
    .eq("id", "default")
    .single();

  if (error || !data) return null;
  return data as QboTokens;
}

export async function isConnected(): Promise<boolean> {
  const tokens = await getTokens();
  if (!tokens?.refresh_token) return false;
  const refreshExpiry = new Date(tokens.refresh_token_expires_at);
  return refreshExpiry > new Date();
}

async function refreshAccessToken(
  tokens: QboTokens
): Promise<QboTokens> {
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(INTUIT_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${text}`);
  }

  const data = await res.json();
  const now = new Date();

  const updated: QboTokens = {
    ...tokens,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    access_token_expires_at: new Date(
      now.getTime() + data.expires_in * 1000
    ).toISOString(),
    refresh_token_expires_at: new Date(
      now.getTime() + (data.x_refresh_token_expires_in || 8640000) * 1000
    ).toISOString(),
  };

  const supabase = createAdminClient();
  await supabase
    .from("qbo_tokens")
    .update({
      access_token: updated.access_token,
      refresh_token: updated.refresh_token,
      access_token_expires_at: updated.access_token_expires_at,
      refresh_token_expires_at: updated.refresh_token_expires_at,
      updated_at: now.toISOString(),
    })
    .eq("id", "default");

  return updated;
}

async function getValidTokens(): Promise<QboTokens> {
  let tokens = await getTokens();
  if (!tokens) throw new Error("QBO is not connected");

  const accessExpiry = new Date(tokens.access_token_expires_at);
  const buffer = 5 * 60 * 1000; // refresh 5 min early
  if (accessExpiry.getTime() - buffer < Date.now()) {
    tokens = await refreshAccessToken(tokens);
  }

  return tokens;
}

async function qboFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const tokens = await getValidTokens();
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/v3/company/${tokens.realm_id}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokens.access_token}`,
      ...options.headers,
    },
  });

  return res;
}

type OrderForInvoice = {
  id: string;
  order_number: string | null;
  items: { name: string; quantity: number; price: number; volume?: string }[];
  total: number;
  subtotal: number;
  shipping_name: string;
  shipping_email: string;
  shipping_fee?: number;
  cold_chain_fee?: number;
  promo_discount?: number;
  payment_discount?: number;
};

async function findOrCreateCustomer(
  email: string,
  name: string
): Promise<string> {
  const query = encodeURIComponent(`PrimaryEmailAddr = '${email}'`);
  const searchRes = await qboFetch(`/query?query=select * from Customer where ${query}`);

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    const existing = searchData.QueryResponse?.Customer?.[0];
    if (existing) return existing.Id;
  }

  const createRes = await qboFetch("/customer", {
    method: "POST",
    body: JSON.stringify({
      DisplayName: `${name} (${email})`,
      PrimaryEmailAddr: { Address: email },
      GivenName: name.split(" ")[0] || name,
      FamilyName: name.split(" ").slice(1).join(" ") || "",
    }),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`Failed to create QBO customer: ${text}`);
  }

  const createData = await createRes.json();
  return createData.Customer.Id;
}

export async function createInvoice(
  order: OrderForInvoice
): Promise<{ invoiceId: string; paymentLink: string }> {
  const customerId = await findOrCreateCustomer(
    order.shipping_email,
    order.shipping_name
  );

  const lineItems = order.items.map((item, idx) => {
    const bundleRate = item.quantity >= 3 ? 0.05 : item.quantity === 2 ? 0.033 : 0;
    const effectiveUnitPrice = Math.round(item.price * (1 - bundleRate) * 100) / 100;
    const lineAmount = Math.round(effectiveUnitPrice * item.quantity * 100) / 100;
    const desc = `${item.name}${item.volume ? ` (${item.volume})` : ""}${bundleRate > 0 ? ` — ${(bundleRate * 100).toFixed(1)}% bundle discount` : ""}`;

    return {
      LineNum: idx + 1,
      Amount: lineAmount,
      DetailType: "SalesItemLineDetail" as const,
      Description: desc,
      SalesItemLineDetail: {
        Qty: item.quantity,
        UnitPrice: effectiveUnitPrice,
      },
    };
  });

  if (order.payment_discount && order.payment_discount > 0) {
    lineItems.push({
      LineNum: lineItems.length + 1,
      Amount: -order.payment_discount,
      DetailType: "SalesItemLineDetail" as const,
      Description: "Payment Method Discount (10%)",
      SalesItemLineDetail: {
        Qty: 1,
        UnitPrice: -order.payment_discount,
      },
    });
  }

  if (order.promo_discount && order.promo_discount > 0) {
    lineItems.push({
      LineNum: lineItems.length + 1,
      Amount: -order.promo_discount,
      DetailType: "SalesItemLineDetail" as const,
      Description: "Promo Discount",
      SalesItemLineDetail: {
        Qty: 1,
        UnitPrice: -order.promo_discount,
      },
    });
  }

  if (order.shipping_fee && order.shipping_fee > 0) {
    lineItems.push({
      LineNum: lineItems.length + 1,
      Amount: order.shipping_fee,
      DetailType: "SalesItemLineDetail" as const,
      Description: "Shipping",
      SalesItemLineDetail: {
        Qty: 1,
        UnitPrice: order.shipping_fee,
      },
    });
  }

  if (order.cold_chain_fee && order.cold_chain_fee > 0) {
    lineItems.push({
      LineNum: lineItems.length + 1,
      Amount: order.cold_chain_fee,
      DetailType: "SalesItemLineDetail" as const,
      Description: "Cold Chain Packaging",
      SalesItemLineDetail: {
        Qty: 1,
        UnitPrice: order.cold_chain_fee,
      },
    });
  }

  const invoiceBody = {
    CustomerRef: { value: customerId },
    BillEmail: { Address: order.shipping_email },
    AllowOnlineCreditCardPayment: true,
    AllowOnlineACHPayment: true,
    AutoDocNumber: true,
    Line: lineItems,
    CustomerMemo: {
      value: `${siteConfig.name} Order ${order.order_number || order.id.slice(0, 8).toUpperCase()}`,
    },
    PrivateNote: `${siteConfig.name} Order ID: ${order.id}`,
  };

  const res = await qboFetch("/invoice", {
    method: "POST",
    body: JSON.stringify(invoiceBody),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create QBO invoice: ${text}`);
  }

  const data = await res.json();
  const invoice = data.Invoice;
  const invoiceId = invoice.Id;

  const tokens = await getTokens();
  const env = process.env.QBO_ENVIRONMENT || "sandbox";
  const domain =
    env === "production"
      ? "https://app.qbo.intuit.com"
      : "https://app.sandbox.qbo.intuit.com";
  const paymentLink = `${domain}/app/customerlink?txnId=${invoiceId}&txnType=invoice&realmId=${tokens?.realm_id}`;

  // Send the invoice email from QBO to the customer
  // QBO send endpoint requires Content-Type: application/octet-stream
  try {
    const sendTo = encodeURIComponent(order.shipping_email);
    const sendRes = await qboFetch(`/invoice/${invoiceId}/send?sendTo=${sendTo}`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
    });
    if (!sendRes.ok) {
      const sendErr = await sendRes.text();
      console.error("QBO invoice send failed:", sendErr);
    }
  } catch (err) {
    console.error("QBO invoice send error:", err);
  }

  return { invoiceId, paymentLink };
}

export async function getInvoiceStatus(
  invoiceId: string
): Promise<{ paid: boolean; balance: number }> {
  const res = await qboFetch(`/invoice/${invoiceId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch invoice status");
  }

  const data = await res.json();
  const balance = Number(data.Invoice?.Balance ?? -1);

  return {
    paid: balance === 0,
    balance,
  };
}

export async function disconnectQbo(): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("qbo_tokens").delete().eq("id", "default");
}

export async function getConnectionInfo(): Promise<{
  connected: boolean;
  realmId?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
}> {
  const tokens = await getTokens();
  if (!tokens?.refresh_token) {
    return { connected: false };
  }

  const refreshExpiry = new Date(tokens.refresh_token_expires_at);
  if (refreshExpiry <= new Date()) {
    return { connected: false };
  }

  return {
    connected: true,
    realmId: tokens.realm_id,
    accessTokenExpiresAt: tokens.access_token_expires_at,
    refreshTokenExpiresAt: tokens.refresh_token_expires_at,
  };
}
