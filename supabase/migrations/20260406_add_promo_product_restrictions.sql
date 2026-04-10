-- Add product-specific promo code restrictions
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS applicable_product_ids TEXT[] DEFAULT NULL;

-- Per-product discount overrides: {"product-id": {"percent": 10}, "other-id": {"fixed": 5}}
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS product_discounts JSONB DEFAULT NULL;
