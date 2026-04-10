-- Add ShipStation-related columns to the orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipstation_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_discount NUMERIC DEFAULT 0;

-- Atomic inventory decrement function
CREATE OR REPLACE FUNCTION decrement_inventory(p_product_id UUID, p_quantity INT)
RETURNS INT AS $$
DECLARE
  new_qty INT;
BEGIN
  UPDATE products
  SET inventory_quantity = GREATEST(0, inventory_quantity - p_quantity)
  WHERE id = p_product_id
  RETURNING inventory_quantity INTO new_qty;
  RETURN COALESCE(new_qty, -1);
END;
$$ LANGUAGE plpgsql;
