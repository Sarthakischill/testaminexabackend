export const PAYMENT_DISCOUNT_RATE = 0.10;

export function getBundleDiscount(quantity: number): number {
  if (quantity >= 3) return 0.05;
  if (quantity === 2) return 0.033;
  return 0;
}

export function calculateItemTotal(price: number, quantity: number): number {
  const discount = getBundleDiscount(quantity);
  return Math.round(price * quantity * (1 - discount) * 100) / 100;
}

export function calculateSubtotal(
  items: { price: number; quantity: number }[]
): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item.price, item.quantity), 0);
}

export function calculatePaymentDiscount(
  subtotal: number,
  paymentMethod: string
): number {
  if (paymentMethod === "credit_card") return 0;
  return Math.round(subtotal * PAYMENT_DISCOUNT_RATE * 100) / 100;
}

export function calculatePromoDiscount(
  afterPaymentDiscount: number,
  discountPercent: number,
  discountFixed: number
): number {
  if (discountPercent > 0) {
    return Math.round(afterPaymentDiscount * (discountPercent / 100) * 100) / 100;
  }
  if (discountFixed > 0) {
    return Math.min(discountFixed, afterPaymentDiscount);
  }
  return 0;
}

export type ProductDiscountMap = Record<string, { percent?: number; fixed?: number }>;

export function calculateOrderTotal(params: {
  items: { price: number; quantity: number; productId?: string }[];
  paymentMethod: string;
  shippingFee: number;
  coldChainFee: number;
  promoDiscountPercent?: number;
  promoDiscountFixed?: number;
  applicableProductIds?: string[] | null;
  productDiscounts?: ProductDiscountMap | null;
}): {
  subtotal: number;
  paymentDiscount: number;
  promoDiscount: number;
  shippingFee: number;
  coldChainFee: number;
  total: number;
} {
  const subtotal = calculateSubtotal(params.items);
  const paymentDiscount = calculatePaymentDiscount(subtotal, params.paymentMethod);

  let promoDiscount = 0;

  if (params.productDiscounts && Object.keys(params.productDiscounts).length > 0) {
    // Per-product discounts: each product has its own percent/fixed
    for (const item of params.items) {
      if (!item.productId) continue;
      const pd = params.productDiscounts[item.productId];
      if (!pd) continue;

      const itemTotal = calculateItemTotal(item.price, item.quantity);
      const itemPaymentDiscount = calculatePaymentDiscount(itemTotal, params.paymentMethod);
      const itemBase = itemTotal - itemPaymentDiscount;

      promoDiscount += calculatePromoDiscount(itemBase, pd.percent ?? 0, pd.fixed ?? 0);
    }
  } else {
    // Uniform discount (legacy behavior)
    const afterPaymentDiscount = subtotal - paymentDiscount;

    let promoBase = afterPaymentDiscount;
    if (params.applicableProductIds && params.applicableProductIds.length > 0) {
      const eligibleSubtotal = params.items
        .filter((i) => i.productId && params.applicableProductIds!.includes(i.productId))
        .reduce((sum, i) => sum + calculateItemTotal(i.price, i.quantity), 0);
      const eligiblePaymentDiscount = calculatePaymentDiscount(eligibleSubtotal, params.paymentMethod);
      promoBase = eligibleSubtotal - eligiblePaymentDiscount;
    }

    promoDiscount = calculatePromoDiscount(
      promoBase,
      params.promoDiscountPercent ?? 0,
      params.promoDiscountFixed ?? 0
    );
  }

  const total = subtotal - paymentDiscount - promoDiscount + params.shippingFee + params.coldChainFee;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    paymentDiscount: Math.round(paymentDiscount * 100) / 100,
    promoDiscount: Math.round(promoDiscount * 100) / 100,
    shippingFee: params.shippingFee,
    coldChainFee: params.coldChainFee,
    total: Math.round(total * 100) / 100,
  };
}
