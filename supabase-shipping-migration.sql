-- Add shipping and cold chain columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_fee numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cold_chain boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cold_chain_fee numeric(10,2) NOT NULL DEFAULT 0;
