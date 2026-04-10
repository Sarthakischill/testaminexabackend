export function sanitizeString(input: string, maxLength = 500): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s@.,'#\-\/]/gi, "")
    .trim()
    .slice(0, maxLength);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function isValidZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

export function isValidState(state: string): boolean {
  return /^[A-Za-z]{2}$/.test(state.trim());
}

export function validateShipping(shipping: {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}): string | null {
  if (!shipping.name || shipping.name.trim().length < 2) return "Name is required";
  if (!isValidEmail(shipping.email)) return "Invalid email address";
  if (!shipping.address || shipping.address.trim().length < 5) return "Address is required";
  if (!shipping.city || shipping.city.trim().length < 2) return "City is required";
  if (!isValidState(shipping.state)) return "Invalid state (use 2-letter abbreviation)";
  if (!isValidZip(shipping.zip)) return "Invalid ZIP code";
  return null;
}

export function validateOrderItems(items: unknown[]): string | null {
  if (!Array.isArray(items) || items.length === 0) return "At least one item is required";
  if (items.length > 50) return "Too many items";

  for (const item of items) {
    const i = item as Record<string, unknown>;
    if (!i.product_id || typeof i.product_id !== "string") return "Invalid product ID";
    if (!i.name || typeof i.name !== "string") return "Invalid product name";
    if (typeof i.quantity !== "number" || i.quantity < 1 || i.quantity > 100) return "Invalid quantity";
    if (typeof i.price !== "number" || i.price <= 0) return "Invalid price";
  }

  return null;
}
