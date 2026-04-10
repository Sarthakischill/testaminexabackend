-- Run this in the Supabase SQL Editor to set up the database

-- Profiles table (auto-populated on signup)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  date_of_birth date,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  referred_by_rep_id uuid,
  referred_by_code text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- NOTE: Do NOT query profiles from within a profiles policy — it causes infinite recursion.
-- Use auth.jwt() or a security-definer function to check admin role instead.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, date_of_birth)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    (new.raw_user_meta_data ->> 'date_of_birth')::date
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  total numeric not null default 0,
  shipping_name text not null,
  shipping_email text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_state text not null,
  shipping_zip text not null,
  zelle_screenshot_url text,
  order_number text,
  payment_method text not null default 'zelle' check (payment_method in ('zelle', 'crypto')),
  promo_code text,
  promo_discount numeric not null default 0,
  attributed_rep_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz
);

alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

create policy "Admins can update all orders"
  on public.orders for update
  using (public.is_admin());

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_orders_updated
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

-- Storage bucket for Zelle screenshots (create via Supabase dashboard or API)
-- insert into storage.buckets (id, name, public) values ('zelle-screenshots', 'zelle-screenshots', false);

-- Storage policies
-- create policy "Authenticated users can upload screenshots"
--   on storage.objects for insert
--   with check (bucket_id = 'zelle-screenshots' and auth.role() = 'authenticated');

-- create policy "Admins can view screenshots"
--   on storage.objects for select
--   using (
--     bucket_id = 'zelle-screenshots' and
--     exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
--   );

-- create policy "Users can view own screenshots"
--   on storage.objects for select
--   using (
--     bucket_id = 'zelle-screenshots' and
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
