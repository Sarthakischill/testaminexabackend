import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderReceivedCustomerEmail, sendOrderReceivedOwnerEmail } from "@/lib/emails/send";
import { validateShipping, validateOrderItems, sanitizeString } from "@/lib/utils/validation";
import { createInvoice, isConnected } from "@/lib/qbo";
import { calculateOrderTotal } from "@/lib/pricing";
import { SHIPPING_TIERS } from "@/lib/shipstation";

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
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { items, total: clientTotal, shipping, screenshotUrl, notes, orderNumber, paymentMethod, promoCode, coldChain, carrierCode, serviceCode, serviceName, estimatedDelivery, recaptchaToken, shippingTierId } = body;

  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (recaptchaSecret) {
    if (!recaptchaToken) {
      return NextResponse.json({ error: "reCAPTCHA verification failed. Please try again." }, { status: 400 });
    }
    try {
      const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success || verifyData.score < 0.3) {
        return NextResponse.json({ error: "reCAPTCHA verification failed. Please try again." }, { status: 400 });
      }
    } catch {
      // Non-blocking: allow order if reCAPTCHA service is down
    }
  }

  const itemsError = validateOrderItems(items);
  if (itemsError) {
    return NextResponse.json({ error: itemsError }, { status: 400 });
  }

  if (shipping && typeof shipping.state === "string") {
    shipping.state = shipping.state.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 2);
  }
  if (shipping && typeof shipping.zip === "string") {
    shipping.zip = shipping.zip.replace(/[^\d-]/g, "").slice(0, 10);
  }

  const shippingError = validateShipping(shipping);
  if (shippingError) {
    return NextResponse.json({ error: shippingError }, { status: 400 });
  }

  const validPaymentMethods = ["zelle", "crypto", "credit_card"];
  const sanitizedPaymentMethod = validPaymentMethods.includes(paymentMethod) ? paymentMethod : null;
  if (!sanitizedPaymentMethod) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  // Look up product prices from the database to prevent price manipulation
  const productIds = items.map((item: { product_id: string }) => item.product_id);
  const { data: dbProducts, error: productError } = await adminSupabase
    .from("products")
    .select("id, name, price, inventory_quantity, inventory_status")
    .in("id", productIds);

  if (productError || !dbProducts) {
    return NextResponse.json({ error: "Unable to verify product availability. Please try again." }, { status: 500 });
  }

  const productMap = new Map(dbProducts.map((p: { id: string; name: string; price: number; inventory_quantity: number; inventory_status: string }) => [p.id, p]));

  for (const item of items as { product_id: string; name: string; quantity: number }[]) {
    const dbProduct = productMap.get(item.product_id);
    if (!dbProduct) {
      return NextResponse.json({ error: `Product "${item.name}" is no longer available.` }, { status: 400 });
    }
    if (dbProduct.inventory_status !== "ready") {
      return NextResponse.json({ error: `${dbProduct.name} is not available for purchase` }, { status: 400 });
    }
    if (dbProduct.inventory_quantity < item.quantity) {
      return NextResponse.json({
        error: dbProduct.inventory_quantity <= 0
          ? `${dbProduct.name} is sold out`
          : `Only ${dbProduct.inventory_quantity} unit(s) of ${dbProduct.name} available`,
      }, { status: 400 });
    }
  }

  let attributedRepId: string | null = null;
  let validatedPromoCode: string | null = null;
  let promoDiscountPercent = 0;
  let promoDiscountFixed = 0;
  let promoApplicableProductIds: string[] | null = null;
  let promoProductDiscounts: Record<string, { percent?: number; fixed?: number }> | null = null;

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("referred_by_rep_id")
    .eq("id", user.id)
    .single();

  if (profile?.referred_by_rep_id) {
    attributedRepId = profile.referred_by_rep_id;
  }

  if (promoCode && typeof promoCode === "string") {
    const code = promoCode.trim().toUpperCase();
    const { data: promo } = await adminSupabase
      .from("promo_codes")
      .select("*")
      .eq("code", code)
      .eq("active", true)
      .single();

    if (promo) {
      const notExpired = !promo.expires_at || new Date(promo.expires_at) > new Date();
      const notMaxed = !promo.max_uses || promo.times_used < promo.max_uses;

      if (notExpired && notMaxed) {
        const applicableIds: string[] | null = promo.applicable_product_ids || null;
        const cartProductIds = (items as { product_id: string }[]).map((i) => i.product_id);
        const shouldApply = !applicableIds || applicableIds.length === 0 ||
          cartProductIds.some((pid) => applicableIds.includes(pid));

        if (shouldApply) {
          promoApplicableProductIds = applicableIds;
          validatedPromoCode = promo.code;
          promoDiscountPercent = Number(promo.discount_percent) || 0;
          promoDiscountFixed = Number(promo.discount_fixed) || 0;

          const rawPd = promo.product_discounts;
          if (rawPd && typeof rawPd === "object" && Object.keys(rawPd).length > 0) {
            promoProductDiscounts = rawPd as Record<string, { percent?: number; fixed?: number }>;
          }

          await adminSupabase
            .from("promo_codes")
            .update({ times_used: promo.times_used + 1 })
            .eq("id", promo.id);
        }

        if (promo.sales_rep_id && !profile?.referred_by_rep_id) {
          attributedRepId = promo.sales_rep_id;
          await adminSupabase
            .from("profiles")
            .update({
              referred_by_rep_id: promo.sales_rep_id,
              referred_by_code: promo.code,
            })
            .eq("id", user.id);
        }

        if (promo.sales_rep_id) {
          attributedRepId = attributedRepId || promo.sales_rep_id;
        }
      }
    }
  }

  // Determine shipping fee from the tier selected by the customer
  const FREE_SHIPPING_THRESHOLD = 100;
  const serverItems = (items as { product_id: string; quantity: number }[]).map((item) => {
    const dbProduct = productMap.get(item.product_id)!;
    return { price: dbProduct.price, quantity: item.quantity, productId: item.product_id };
  });

  const prelimSubtotal = serverItems.reduce((sum, i) => {
    const d = i.quantity >= 3 ? 0.05 : i.quantity === 2 ? 0.033 : 0;
    return sum + Math.round(i.price * i.quantity * (1 - d) * 100) / 100;
  }, 0);

  let serverShippingFee = 5.99; // default standard
  const tierId = shippingTierId || "standard";
  const tier = SHIPPING_TIERS.find((t) => t.id === tierId);
  if (tier) {
    const isFreeShipping = tier.id === "standard" && prelimSubtotal >= FREE_SHIPPING_THRESHOLD;
    serverShippingFee = isFreeShipping ? 0 : tier.customerPrice;
  }

  const serverColdChainFee = coldChain ? 8 : 0;

  const computed = calculateOrderTotal({
    items: serverItems,
    paymentMethod: sanitizedPaymentMethod,
    shippingFee: serverShippingFee,
    coldChainFee: serverColdChainFee,
    promoDiscountPercent,
    promoDiscountFixed,
    applicableProductIds: promoApplicableProductIds,
    productDiscounts: promoProductDiscounts,
  });

  // Reject if client total diverges from server total by more than $0.02
  if (typeof clientTotal === "number" && Math.abs(computed.total - clientTotal) > 0.02) {
    return NextResponse.json({ error: "Price mismatch. Please refresh and try again." }, { status: 400 });
  }

  const isCreditCard = sanitizedPaymentMethod === "credit_card";

  const orderItems = (items as { product_id: string; name: string; quantity: number; volume?: string }[]).map((item) => {
    const dbProduct = productMap.get(item.product_id)!;
    return {
      product_id: item.product_id,
      name: dbProduct.name,
      quantity: item.quantity,
      price: dbProduct.price,
      volume: item.volume,
    };
  });

  const { data: order, error } = await adminSupabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: isCreditCard ? "awaiting_payment" : "pending",
      items: orderItems,
      subtotal: computed.subtotal,
      total: computed.total,
      shipping_name: sanitizeString(shipping.name, 200),
      shipping_email: shipping.email.trim().toLowerCase(),
      shipping_address: sanitizeString(shipping.address, 300),
      shipping_city: sanitizeString(shipping.city, 100),
      shipping_state: sanitizeString(shipping.state, 2),
      shipping_zip: sanitizeString(shipping.zip, 10),
      zelle_screenshot_url: screenshotUrl || null,
      order_number: orderNumber ? sanitizeString(orderNumber, 20) : null,
      payment_method: sanitizedPaymentMethod,
      promo_code: validatedPromoCode,
      promo_discount: computed.promoDiscount,
      payment_discount: computed.paymentDiscount,
      attributed_rep_id: attributedRepId,
      notes: notes ? sanitizeString(notes, 1000) : null,
      shipping_fee: computed.shippingFee,
      cold_chain: !!coldChain,
      cold_chain_fee: computed.coldChainFee,
      carrier_code: typeof carrierCode === "string" ? carrierCode : null,
      service_code: typeof serviceCode === "string" ? serviceCode : null,
      service_name: typeof serviceName === "string" ? serviceName : null,
      estimated_delivery: typeof estimatedDelivery === "string" ? estimatedDelivery : null,
    })
    .select()
    .single();

  if (error) {
    console.error("Order insert error:", error);
    return NextResponse.json({ error: "Failed to create order. Please try again." }, { status: 500 });
  }

  // Atomic inventory decrement via database function
  for (const item of items as { product_id: string; quantity: number }[]) {
    await adminSupabase.rpc("decrement_inventory", {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    });
  }

  let paymentLink: string | null = null;

  if (isCreditCard) {
    try {
      const connected = await isConnected();
      if (connected) {
        const invoiceResult = await createInvoice({
          id: order.id,
          order_number: order.order_number,
          items: orderItems.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            volume: i.volume,
          })),
          total: order.total,
          subtotal: order.subtotal,
          shipping_name: order.shipping_name,
          shipping_email: order.shipping_email,
          shipping_fee: order.shipping_fee,
          cold_chain_fee: order.cold_chain_fee,
          promo_discount: order.promo_discount,
          payment_discount: order.payment_discount,
        });

        paymentLink = invoiceResult.paymentLink;

        await adminSupabase
          .from("orders")
          .update({ qbo_invoice_id: invoiceResult.invoiceId })
          .eq("id", order.id);

        order.qbo_invoice_id = invoiceResult.invoiceId;
      }
    } catch (err) {
      console.error("QBO invoice creation failed (order still created):", err);
    }
  }

  try {
    await Promise.all([
      sendOrderReceivedCustomerEmail(order, paymentLink),
      sendOrderReceivedOwnerEmail(order),
    ]);
  } catch (err) {
    console.error("Order email send failed:", err);
  }

  return NextResponse.json({ order, paymentLink }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = createAdminClient();
  const { data: orders, error } = await adminSupabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders });
}
