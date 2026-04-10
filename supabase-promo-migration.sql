-- Promo Codes & Sales Rep Attribution Migration
-- Run this in the Supabase SQL Editor

-- ============================================================================
-- SALES REPS TABLE
-- ============================================================================

create table public.sales_reps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.sales_reps enable row level security;

create policy "Admins can manage sales reps"
  on public.sales_reps for all
  using (public.is_admin());

-- ============================================================================
-- PROMO CODES TABLE
-- ============================================================================

create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent numeric not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  discount_fixed numeric not null default 0 check (discount_fixed >= 0),
  sales_rep_id uuid references public.sales_reps(id) on delete set null,
  max_uses integer,
  times_used integer not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.promo_codes enable row level security;

create policy "Admins can manage promo codes"
  on public.promo_codes for all
  using (public.is_admin());

create index idx_promo_codes_code on public.promo_codes (code);

-- ============================================================================
-- ADD ATTRIBUTION COLUMNS TO PROFILES
-- ============================================================================

alter table public.profiles
  add column if not exists referred_by_rep_id uuid references public.sales_reps(id) on delete set null,
  add column if not exists referred_by_code text;

-- ============================================================================
-- ADD PROMO / ATTRIBUTION COLUMNS TO ORDERS
-- ============================================================================

alter table public.orders
  add column if not exists promo_code text,
  add column if not exists promo_discount numeric not null default 0,
  add column if not exists attributed_rep_id uuid references public.sales_reps(id) on delete set null;
