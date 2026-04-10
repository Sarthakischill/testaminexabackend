-- Inventory management migration for AmiNexa
-- Run this in the Supabase SQL Editor AFTER the products table exists (supabase-products-migration.sql)

-- ============================================================================
-- ADD INVENTORY COLUMNS TO PRODUCTS
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS inventory_quantity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inventory_status text NOT NULL DEFAULT 'not_ready'
    CHECK (inventory_status IN ('ready', 'not_ready')),
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5;

-- Index for quick filtering of purchasable products
CREATE INDEX IF NOT EXISTS idx_products_inventory_status ON public.products (inventory_status);

-- Safe default: all existing products start as not ready until admin sets them
UPDATE public.products
  SET inventory_quantity = 0,
      inventory_status = 'not_ready'
  WHERE inventory_status IS NULL OR inventory_quantity IS NULL;
