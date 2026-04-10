-- ==========================================================================
-- UNIFIED SUPABASE SCHEMA SETUP
-- ==========================================================================
-- Run this entire file in the Supabase SQL Editor for a new project.
-- It creates all tables, functions, triggers, RLS policies, indexes,
-- and storage buckets needed by the ecommerce template.
--
-- After running this, create your first admin user:
--   1. Sign up via the app or create a user in Supabase Auth dashboard
--   2. In Supabase Auth > Users, click the user > edit > set app_metadata to:
--      {"role": "admin"}
--   3. Also update their profiles row: UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ==========================================================================


-- ============================================================================
-- 1. PROFILES
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  date_of_birth DATE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  referred_by_rep_id UUID,
  referred_by_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- ============================================================================
-- 2. ADMIN HELPER FUNCTION
-- ============================================================================
-- NOTE: Do NOT query profiles from within a profiles policy — it causes infinite recursion.
-- Use this security-definer function instead.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());


-- ============================================================================
-- 3. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, date_of_birth)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    (NEW.raw_user_meta_data ->> 'date_of_birth')::DATE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================================
-- 4. UPDATED_AT TRIGGER FUNCTION (reused by multiple tables)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 5. ORDERS
-- ============================================================================

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'awaiting_payment')),
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,

  -- Shipping address
  shipping_name TEXT NOT NULL,
  shipping_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,

  -- Payment
  payment_method TEXT NOT NULL DEFAULT 'zelle'
    CHECK (payment_method IN ('zelle', 'crypto', 'credit_card')),
  zelle_screenshot_url TEXT,
  payment_discount NUMERIC DEFAULT 0,

  -- Shipping fees
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  cold_chain BOOLEAN NOT NULL DEFAULT FALSE,
  cold_chain_fee NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- Promo
  promo_code TEXT,
  promo_discount NUMERIC NOT NULL DEFAULT 0,
  attributed_rep_id UUID,

  -- ShipStation
  carrier_code TEXT,
  service_code TEXT,
  service_name TEXT,
  shipstation_order_id TEXT,
  estimated_delivery TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,

  -- QuickBooks
  qbo_invoice_id TEXT,

  -- Misc
  order_number TEXT,
  notes TEXT,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR select
  USING (public.is_admin());

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

CREATE TRIGGER on_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- ============================================================================
-- 6. PRODUCTS
-- ============================================================================

CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  display_price TEXT NOT NULL,
  purity TEXT NOT NULL DEFAULT '99.0%',
  volume TEXT NOT NULL,

  -- Visual / branding
  hex TEXT NOT NULL DEFAULT '#ffffff',
  image TEXT NOT NULL,
  scale_class TEXT NOT NULL DEFAULT 'scale-100',
  color_from TEXT NOT NULL DEFAULT '',
  color_to TEXT NOT NULL DEFAULT '',
  accent_glow TEXT NOT NULL DEFAULT '',

  -- Content
  description TEXT NOT NULL DEFAULT '',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  faqs JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Classification
  category TEXT NOT NULL DEFAULT 'vial' CHECK (category IN ('vial', 'pen')),
  brand TEXT,
  coming_soon BOOLEAN NOT NULL DEFAULT FALSE,

  -- Inventory
  inventory_quantity INTEGER NOT NULL DEFAULT 0,
  inventory_status TEXT NOT NULL DEFAULT 'not_ready'
    CHECK (inventory_status IN ('ready', 'not_ready')),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,

  -- Ordering & visibility
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

CREATE TRIGGER on_products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE INDEX idx_products_category ON public.products (category);
CREATE INDEX idx_products_sort ON public.products (sort_order);
CREATE INDEX idx_products_active ON public.products (active);
CREATE INDEX idx_products_inventory_status ON public.products (inventory_status);


-- ============================================================================
-- 7. SALES REPS
-- ============================================================================

CREATE TABLE public.sales_reps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sales_reps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sales reps"
  ON public.sales_reps FOR ALL
  USING (public.is_admin());

-- Add FK for profiles.referred_by_rep_id (profiles table created before sales_reps)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_referred_by_rep_fk
  FOREIGN KEY (referred_by_rep_id) REFERENCES public.sales_reps(id) ON DELETE SET NULL;

-- Add FK for orders.attributed_rep_id
ALTER TABLE public.orders
  ADD CONSTRAINT orders_attributed_rep_fk
  FOREIGN KEY (attributed_rep_id) REFERENCES public.sales_reps(id) ON DELETE SET NULL;


-- ============================================================================
-- 8. PROMO CODES
-- ============================================================================

CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent NUMERIC NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_fixed NUMERIC NOT NULL DEFAULT 0 CHECK (discount_fixed >= 0),
  sales_rep_id UUID REFERENCES public.sales_reps(id) ON DELETE SET NULL,
  max_uses INTEGER,
  times_used INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  applicable_product_ids TEXT[] DEFAULT NULL,
  product_discounts JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_promo_codes_code ON public.promo_codes (code);


-- ============================================================================
-- 9. EMAIL SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_settings (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  recipients TEXT[] NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read email_settings"
  ON email_settings FOR SELECT
  USING ((SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

CREATE POLICY "Admins can update email_settings"
  ON email_settings FOR UPDATE
  USING ((SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

CREATE POLICY "Admins can insert email_settings"
  ON email_settings FOR INSERT
  WITH CHECK ((SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

CREATE POLICY "Service role can read email_settings"
  ON email_settings FOR SELECT
  USING (auth.role() = 'service_role');

-- Seed with placeholder recipients — update via admin panel after setup
INSERT INTO email_settings (id, label, description, recipients) VALUES
  ('order_notification', 'New Order Notifications', 'Emails sent to admins/owners when a new order is placed', ARRAY[]::TEXT[]),
  ('contact_form', 'Contact Form Submissions', 'Emails sent when someone submits the contact form', ARRAY[]::TEXT[]),
  ('order_confirmed', 'Order Confirmed (Customer)', 'Confirmation email sent to the customer when payment is verified', ARRAY[]::TEXT[]),
  ('order_shipped', 'Order Shipped (Customer)', 'Shipping notification sent to the customer with tracking info', ARRAY[]::TEXT[]),
  ('order_received', 'Order Received (Customer)', 'Receipt email sent to the customer after placing an order', ARRAY[]::TEXT[])
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 10. QBO TOKENS (single-row table for OAuth credentials)
-- ============================================================================

CREATE TABLE IF NOT EXISTS qbo_tokens (
  id TEXT PRIMARY KEY DEFAULT 'default',
  access_token TEXT,
  refresh_token TEXT,
  realm_id TEXT,
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 11. INVENTORY DECREMENT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION decrement_inventory(p_product_id TEXT, p_quantity INT)
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


-- ============================================================================
-- 12. STORAGE BUCKETS
-- ============================================================================

-- Product images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

-- Payment screenshots (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('zelle-screenshots', 'zelle-screenshots', FALSE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'zelle-screenshots' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can view screenshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'zelle-screenshots'
    AND public.is_admin()
  );

CREATE POLICY "Users can view own screenshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'zelle-screenshots'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );
