-- QBO OAuth token storage (single-row table for admin credentials)
CREATE TABLE IF NOT EXISTS qbo_tokens (
  id TEXT PRIMARY KEY DEFAULT 'default',
  access_token TEXT,
  refresh_token TEXT,
  realm_id TEXT,
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add QBO invoice ID column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS qbo_invoice_id TEXT;

-- Update payment_method constraint to include credit_card
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('zelle', 'crypto', 'credit_card'));

-- Update status constraint to include awaiting_payment
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'awaiting_payment'));
