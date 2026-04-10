# Setup Guide — Ecommerce Backend Template

This is the comprehensive reference for setting up and working with this template. Read this entire document before starting any new brand project.

---

## 1. Project Overview

### What this template provides

A fully custom ecommerce backend with:

- **Auth**: Supabase-based email/password auth with cookie sessions, middleware route protection, admin roles
- **Products**: Database-backed product catalog with admin CRUD, inventory tracking, and image uploads
- **Orders**: Server-validated order placement with reCAPTCHA, price verification, and inventory decrement
- **Payments**: Zelle, crypto (USDC), and credit card (via QuickBooks invoicing) support
- **Shipping**: ShipStation integration with tiered shipping rates, tracking, and webhook status updates
- **Email**: Transactional emails via Resend (order confirmation, shipping notification, contact form, password reset)
- **Promo codes**: Percent/fixed discounts, per-product restrictions, usage limits, expiry, sales rep attribution
- **Admin dashboard**: Full order management, product CRUD, promo management, email settings, QBO connection
- **Accounting**: QuickBooks Online OAuth + automatic invoice creation

### Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS v4 (CSS-first, `@theme` in `globals.css`) |
| Auth / DB | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Email | Resend |
| Shipping | ShipStation API v1 |
| Accounting | QuickBooks Online (Intuit OAuth) |
| Analytics | Vercel Analytics, Microsoft Clarity (optional) |
| Animation | Framer Motion, Lenis (smooth scroll) |
| Toasts | Sonner |
| CAPTCHA | Google reCAPTCHA v2 |

### Architecture

```
Browser (Client)
  │
  ├── Marketing pages (app/page.tsx, components/)
  ├── Auth pages (app/login/, app/auth/)
  ├── Portal pages (app/portal/) ← requires auth
  │     ├── Catalog (fetches /api/products)
  │     ├── Cart (client state via CartProvider)
  │     ├── Checkout → POST /api/orders
  │     └── Orders, Account, Science
  │
  └── Admin pages (app/admin/) ← requires admin role
        ├── Orders dashboard
        ├── Products CRUD
        ├── Promo codes
        ├── Email settings
        └── QBO connection

Server (API Routes - app/api/)
  │
  ├── /api/auth/* → Supabase Auth
  ├── /api/products → Supabase products table
  ├── /api/orders → Order creation (validates, charges, emails)
  ├── /api/shipping/rates → Tiered shipping rates
  ├── /api/promo/validate → Promo code validation
  ├── /api/qbo/* → QuickBooks OAuth + invoicing
  ├── /api/webhooks/shipstation → Tracking updates
  └── /api/admin/* → Admin CRUD (protected)

External Services
  ├── Supabase (auth, database, storage)
  ├── Resend (transactional email)
  ├── ShipStation (shipping labels, tracking)
  ├── QuickBooks Online (invoicing, accounting)
  └── Google reCAPTCHA (checkout spam prevention)
```

---

## 2. Quick Start for a New Brand

Follow this checklist in order:

### Step 1: Create a new repo from this template
```bash
# If using GitHub template repository:
# Click "Use this template" on GitHub

# Or duplicate manually:
git clone <this-repo-url> brand-name-store
cd brand-name-store
rm -rf .git
git init
```

### Step 2: Create a new Supabase project
1. Go to https://supabase.com/dashboard
2. Create a new project (choose a region close to your users)
3. Copy the project URL and anon key from Settings > API

### Step 3: Run the database migration
1. Go to Supabase Dashboard > SQL Editor
2. Open `supabase/setup.sql` from this repo
3. Paste the entire file and click "Run"
4. This creates all tables, functions, triggers, RLS policies, indexes, and storage buckets

### Step 4: Create the first admin user
1. Sign up via the app, or create a user in Supabase Auth dashboard
2. In Supabase Auth > Users, click the user > edit user metadata
3. Set `app_metadata` to: `{"role": "admin"}`
4. Also run in SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### Step 5: Configure `config/site.ts`
Update every field with the brand's values:
```typescript
export const siteConfig = {
  name: "BrandName",
  tagline: "Your brand tagline",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://brandname.com",
  contactEmail: "contact@brandname.com",
  supportEmail: "support@brandname.com",
  fromEmail: "BrandName <noreply@brandname.com>",
  // ... etc
};
```

### Step 6: Set up `.env.local`
```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Site URL (required)
NEXT_PUBLIC_SITE_URL=https://brandname.com

# Resend (required for emails)
RESEND_API_KEY=re_xxxxxxxxx

# reCAPTCHA (required for checkout)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lxxxxx
RECAPTCHA_SECRET_KEY=6Lxxxxx

# ShipStation (optional — disable if not using)
SHIPSTATION_API_KEY_V1=xxxxxxxx
SHIPSTATION_API_SECRET=xxxxxxxx
SHIPSTATION_FROM_NAME=BrandName
SHIPSTATION_FROM_STREET=123 Main St
SHIPSTATION_FROM_CITY=City
SHIPSTATION_FROM_STATE=CA
SHIPSTATION_FROM_ZIP=90001

# QuickBooks Online (optional — disable if not using)
QBO_CLIENT_ID=xxxxxxxx
QBO_CLIENT_SECRET=xxxxxxxx
QBO_ENVIRONMENT=sandbox  # or "production"
```

### Step 7: Install dependencies and run
```bash
npm install
npm run dev
```

### Step 8: Add products via admin panel
1. Log in with the admin account
2. Go to `/admin/products`
3. Add products with images, prices, descriptions

### Step 9: Deploy
```bash
# Deploy to Vercel
npx vercel
# Set environment variables in Vercel dashboard
```

---

## 3. `config/site.ts` Reference

| Field | Type | Where it's used |
|-------|------|----------------|
| `name` | string | SEO metadata, email templates, admin header, legal pages, QBO invoices, ShipStation, OG images, JSON-LD |
| `tagline` | string | Email footer, OG image subtitle, metadata description |
| `url` | string | Canonical URLs, email links, JSON-LD, robots.txt, sitemap, OG URLs. Falls back to `NEXT_PUBLIC_SITE_URL` env var. |
| `contactEmail` | string | Legal pages footer, JSON-LD contactPoint, email fallback recipients |
| `supportEmail` | string | Contact pages (public and portal) |
| `legalDisclaimer` | string | Email footer disclaimer text |
| `fromEmail` | string | Resend sender address (e.g., `"Brand <noreply@brand.com>"`) |
| `fallbackRecipients` | string[] | Fallback email recipients when `email_settings` DB table has no data |
| `clarityId` | string | Microsoft Clarity analytics ID. Empty string = disabled. |
| `themeColor` | string | HTML meta theme-color |
| `shippingFee` | number | Standard shipping cost (used in cart calculations) |
| `freeShippingThreshold` | number | Subtotal above which shipping is free |
| `coldChainFee` | number | Cold-chain packaging surcharge |
| `paymentDiscountRate` | number | Discount rate for non-credit-card payments (e.g., 0.10 = 10%) |
| `storagePrefix` | string | localStorage key prefix for cart persistence (must be unique per brand) |
| `logoUrl` | string | Brand logo image URL (used in navbar, footer, auth pages, loading screen). Falls back to `/logo.svg`. |
| `faviconUrl` | string | Brand favicon/icon URL (used in admin header, cart drawer). Falls back to `/favicon.svg`. |

---

## 4. Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, bypasses RLS) |
| `NEXT_PUBLIC_SITE_URL` | Production site URL (e.g., `https://brandname.com`) |
| `RESEND_API_KEY` | Resend API key for transactional emails |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Google reCAPTCHA v2 site key |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA v2 secret key |

### Optional — ShipStation

| Variable | Description |
|----------|-------------|
| `SHIPSTATION_API_KEY_V1` | ShipStation API key |
| `SHIPSTATION_API_SECRET` | ShipStation API secret |
| `SHIPSTATION_FROM_NAME` | Ship-from name (falls back to `siteConfig.name`) |
| `SHIPSTATION_FROM_STREET` | Ship-from street address |
| `SHIPSTATION_FROM_CITY` | Ship-from city |
| `SHIPSTATION_FROM_STATE` | Ship-from state |
| `SHIPSTATION_FROM_ZIP` | Ship-from ZIP code |

### Optional — QuickBooks Online

| Variable | Description |
|----------|-------------|
| `QBO_CLIENT_ID` | Intuit OAuth client ID |
| `QBO_CLIENT_SECRET` | Intuit OAuth client secret |
| `QBO_ENVIRONMENT` | `"sandbox"` or `"production"` |
| `QBO_REDIRECT_URI` | OAuth callback URL (defaults to `{SITE_URL}/api/qbo/callback`) |

### Optional — Cloudflare Images

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `CLOUDFLARE_IMAGES_API_TOKEN` | Cloudflare Images API token |
| `CLOUDFLARE_IMAGES_ACCOUNT_HASH` | Cloudflare Images account hash |

---

## 5. Supabase Setup

### Running the migration

1. Open `supabase/setup.sql`
2. Paste into Supabase Dashboard > SQL Editor
3. Click "Run" — it creates everything in one pass

### Tables created

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup via trigger) |
| `orders` | All customer orders with full shipping, payment, and tracking data |
| `products` | Product catalog (managed via admin panel) |
| `sales_reps` | Sales representatives for promo attribution |
| `promo_codes` | Discount codes with percent/fixed, per-product restrictions, usage limits |
| `email_settings` | Configurable email routing for different notification types |
| `qbo_tokens` | QuickBooks Online OAuth token storage (single-row) |

### Storage buckets created

| Bucket | Visibility | Purpose |
|--------|-----------|---------|
| `product-images` | Public | Product photos uploaded via admin |
| `zelle-screenshots` | Private | Payment proof screenshots uploaded by customers |

### RLS policy overview

- **Profiles**: Users see/edit own profile; admins see all
- **Orders**: Users see/create own orders; admins see/update all
- **Products**: Anyone can view active products; admins can manage all
- **Sales reps, promo codes**: Admin-only
- **Email settings**: Admin + service role can read; admin can write

### Creating an admin user

After signup, the user must be granted admin access in two places:

1. **Supabase Auth `app_metadata`**: Set `{"role": "admin"}` — this is checked by middleware for `/admin` route access
2. **Profiles table `role` column**: Set to `'admin'` — this is checked by RLS policies via `is_admin()` function

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@brand.com';
```

---

## 6. Integrating a New Frontend

### What the frontend developer builds

These files are replaced or heavily customized per brand:

| Path | What to do |
|------|-----------|
| `app/page.tsx` | Marketing landing page — full redesign |
| `app/globals.css` | Brand colors in `@theme` block, fonts, scrollbar styles |
| `components/` | All UI components — Navbar, Footer, Hero, Features, FAQ, etc. |
| `public/` | Brand assets — logo, favicon, images, videos |
| `app/portal/page.tsx` | Authenticated storefront home — redesign the product grid, hero, copy |
| `app/portal/product/[id]/page.tsx` | Product detail page — redesign UI |
| `app/login/page.tsx` | Login/register page — redesign UI |
| Legal pages (`terms/`, `privacy/`, etc.) | Update legal copy for the brand |
| `app/contact/page.tsx` | Contact page — redesign UI |

### What stays as-is (backend)

Do NOT modify these unless adding new features:

| Path | What it does |
|------|-------------|
| `app/api/` (all 27 routes) | The entire backend API |
| `lib/supabase/` | Database client setup |
| `lib/pricing.ts` | Pricing engine |
| `lib/products-db.ts` | Product database queries |
| `lib/emails/` | Email sending infrastructure |
| `lib/shipstation.ts` | ShipStation integration |
| `lib/qbo.ts` | QuickBooks integration |
| `lib/admin-auth.ts` | Admin authentication |
| `lib/utils/validation.ts` | Input validation |
| `middleware.ts` | Auth middleware |
| `app/admin/` | Entire admin panel |
| `app/portal/cart/` | Cart page |
| `app/portal/checkout/` | Checkout flow |
| `app/portal/orders/` | Order history |
| `app/portal/account/` | Account page |

### Wiring up data in frontend components

**Products**: Fetch from the API endpoint:
```typescript
const res = await fetch("/api/products");
const products = await res.json();
```

**Cart**: Wrap your app in `CartProvider` (already done in `app/layout.tsx`), then use the `useCart()` hook:
```typescript
import { useCart } from "@/lib/cart-context";

const { items, addItem, removeItem, subtotal, shippingFee } = useCart();
```

**Cart drawer**: Import and render `CartDrawer` component — it reads from cart context automatically.

**Auth state**: Use the Supabase client:
```typescript
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

**Product types**: Import from `@/lib/products`:
```typescript
import { type Product } from "@/lib/products";
```

### Customizing email templates

Edit `lib/emails/template.ts` for the email layout (header, footer, colors). The template functions (`emailWrapper`, `emailHeading`, `emailButton`, etc.) are used by `lib/emails/send.ts` to compose all transactional emails.

Brand name and tagline in emails are already pulled from `config/site.ts`.

---

## 7. Backend Architecture

### API Routes (`app/api/`)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/products` | GET | List active products from DB (with static fallback) |
| `/api/orders` | POST | Create order: validates items, verifies prices server-side, checks inventory, decrements stock, sends emails, optionally creates QBO invoice |
| `/api/orders/[id]` | GET | Fetch single order (user must own it) |
| `/api/auth/callback` | GET | Supabase OAuth/code exchange → sets session cookies |
| `/api/auth/register` | POST | User registration with email verification |
| `/api/auth/forgot-password` | POST | Password reset flow |
| `/api/promo/validate` | POST | Validate promo code, returns discount details |
| `/api/shipping/rates` | GET | Returns shipping tiers; free shipping above threshold |
| `/api/contact` | POST | Contact form → sends email to configured recipients |
| `/api/upload` | POST | Authenticated file upload to Supabase storage |
| `/api/qbo/connect` | GET | Start QuickBooks OAuth flow |
| `/api/qbo/callback` | GET | QBO OAuth callback |
| `/api/qbo/connected` | GET | Check QBO connection status |
| `/api/qbo/invoice` | POST | Create QBO invoice for an order |
| `/api/qbo/status/[orderId]` | GET | Get QBO invoice status for order |
| `/api/webhooks/shipstation` | POST | ShipStation webhook (HMAC-verified) for tracking updates |
| `/api/admin/orders` | GET | List orders (paginated, filterable) |
| `/api/admin/orders/[id]` | GET/PATCH | Fetch/update single order (status, tracking, etc.) |
| `/api/admin/products` | GET/POST | List/create products |
| `/api/admin/products/[id]` | PATCH/DELETE | Update/delete product |
| `/api/admin/products/upload` | POST | Upload product image |
| `/api/admin/promo` | GET/POST/PATCH/DELETE | Promo code CRUD |
| `/api/admin/sales-reps` | GET/POST/PATCH/DELETE | Sales rep CRUD |
| `/api/admin/sales-reps/analytics` | GET | Sales rep performance data |
| `/api/admin/email-settings` | GET/PATCH | Email notification settings |
| `/api/admin/migrate` | POST | One-off schema migration via RPC |
| `/api/admin/screenshot` | GET | View payment proof screenshots |

### Lib Modules (`lib/`)

| File | Purpose |
|------|---------|
| `supabase/client.ts` | Browser-side Supabase client (uses anon key) |
| `supabase/server.ts` | Server-side Supabase client (uses cookies for auth) |
| `supabase/admin.ts` | Service role client (bypasses RLS — for server-only operations) |
| `supabase/middleware.ts` | Session refresh + route protection logic |
| `admin-auth.ts` | `requireAdmin()` — checks user is admin, returns admin Supabase client |
| `cart-context.tsx` | Client-side cart state (React context + reducer + localStorage) |
| `pricing.ts` | Bundle discounts, payment method discounts, promo code discounts, `calculateOrderTotal()` |
| `products.ts` | `Product` type definition, static product array (fallback), helper functions |
| `products-db.ts` | Supabase product queries: `getProducts()`, `getProductById()`, `getAllProductsAdmin()` |
| `research-data.ts` | Research/science data types and content per compound (optional feature) |
| `resend.ts` | Resend client singleton, `FROM_EMAIL` from siteConfig |
| `shipstation.ts` | ShipStation API: create order, shipping tiers, tracking URL builder |
| `qbo.ts` | QuickBooks Online: OAuth flow, token management, invoice creation |
| `emails/send.ts` | Transactional email functions: order confirmation, shipping notification, etc. |
| `emails/template.ts` | HTML email building blocks (wrapper, heading, button, badge, etc.) |
| `emails/settings.ts` | DB-backed email recipient settings with fallbacks |
| `utils/validation.ts` | Input sanitization, email/ZIP/state validation, order validation |

### Order placement flow

1. Client submits checkout form to `POST /api/orders`
2. Server validates reCAPTCHA token
3. Server fetches real product prices from DB (never trusts client prices)
4. Server verifies inventory availability
5. Server calculates order total using `lib/pricing.ts`
6. Server decrements inventory via `decrement_inventory()` SQL function
7. Server creates order in `orders` table
8. Server sends order confirmation email to customer
9. Server sends order notification email to admin recipients
10. If QBO is connected: server creates invoice and emails payment link
11. Server returns order ID to client

### Auth flow

- Middleware (`lib/supabase/middleware.ts`) runs on every request
- Public routes: `/`, `/login`, `/contact`, `/privacy`, `/terms`, `/disclaimer`, `/returns`, `/api/*`, `/auth/*`, `/_next/*`
- All other routes require auth — unauthenticated users redirect to `/login`
- `/admin/*` routes additionally require `app_metadata.role === "admin"` — non-admin users redirect to `/portal`

---

## 8. Common Customizations

### Adding or removing payment methods

1. Update the `orders` table constraint in `supabase/setup.sql`:
   ```sql
   CHECK (payment_method IN ('zelle', 'crypto', 'credit_card', 'new_method'))
   ```
2. Update `app/portal/checkout/page.tsx` to add the payment method UI
3. Update `app/api/orders/route.ts` validation logic
4. Update `lib/pricing.ts` if the new method has a different discount rate

### Changing shipping tiers

Edit `lib/shipstation.ts` — the `SHIPPING_TIERS` array:
```typescript
export const SHIPPING_TIERS: ShippingTierConfig[] = [
  { id: "standard", label: "Standard Shipping", description: "...", deliveryEstimate: "5-7 days", customerPrice: 5.99 },
  // Add/remove/modify tiers here
];
```

Also update `siteConfig.shippingFee` in `config/site.ts` to match the default tier price.

### Changing pricing and discount logic

Edit `lib/pricing.ts`:
- `PAYMENT_DISCOUNT_RATE` — percentage discount for non-credit-card payments
- `getBundleDiscount()` — quantity-based discount tiers
- `calculateOrderTotal()` — the full pricing pipeline

### Removing the science pages feature

If the brand doesn't need research/science pages:
1. Delete `app/portal/science/` directory
2. Delete `lib/research-data.ts`
3. Remove science URLs from `app/sitemap.ts`

### Removing cold-chain shipping

1. Set `siteConfig.coldChainFee` to `0`
2. Remove cold chain UI from `app/portal/checkout/page.tsx`
3. Optionally remove `cold_chain` and `cold_chain_fee` columns from orders table

### Adding new admin pages

1. Create `app/admin/your-page/page.tsx`
2. Use `requireAdmin()` from `lib/admin-auth.ts` for server components, or check auth client-side
3. Create matching API routes in `app/api/admin/your-endpoint/route.ts`
4. Add navigation link in the admin header (in `app/admin/page.tsx`)

---

## 9. What NOT to Modify

These files are the core backend infrastructure. They should remain unchanged across brands unless you're adding entirely new features:

### Never modify (shared backend core)

- `lib/supabase/client.ts`, `server.ts`, `admin.ts`, `middleware.ts` — Supabase client setup
- `middleware.ts` — root middleware
- `lib/admin-auth.ts` — admin authentication
- `lib/utils/validation.ts` — input validation
- `lib/pricing.ts` — pricing engine (unless changing discount logic)
- `lib/products-db.ts` — product database queries
- `app/api/orders/route.ts` — order creation logic
- `app/api/auth/*` — authentication flows
- `app/api/admin/*` — admin API routes
- `app/api/webhooks/*` — webhook handlers
- `app/api/qbo/*` — QuickBooks integration
- `app/api/promo/*` — promo validation
- `app/api/shipping/*` — shipping rates

### Modify only via `config/site.ts`

- Brand name, URLs, emails — change in `config/site.ts`, not in individual files
- Shipping fees — change in `config/site.ts`
- localStorage keys — change `storagePrefix` in `config/site.ts`

### Frontend files — replace per brand

- `app/page.tsx`, `components/`, `public/`, `app/globals.css` — full redesign per brand
- `app/portal/page.tsx` — storefront home, redesign per brand
- `app/login/page.tsx` — auth UI, redesign per brand
- Legal pages — update copy per brand

---

## Appendix: File Tree

```
config/
  site.ts                    ← Brand configuration (START HERE)

app/
  layout.tsx                 ← Root layout (uses siteConfig)
  page.tsx                   ← Marketing landing (customize per brand)
  globals.css                ← Tailwind theme tokens (customize per brand)
  opengraph-image.tsx        ← OG image (uses siteConfig)
  robots.ts                  ← Robots.txt
  sitemap.ts                 ← Sitemap

  api/                       ← Backend API routes (DO NOT MODIFY)
    auth/callback/
    auth/register/
    auth/forgot-password/
    products/
    orders/
    orders/[id]/
    shipping/rates/
    promo/validate/
    contact/
    upload/
    qbo/connect/
    qbo/callback/
    qbo/connected/
    qbo/invoice/
    qbo/status/[orderId]/
    webhooks/shipstation/
    admin/orders/
    admin/orders/[id]/
    admin/products/
    admin/products/[id]/
    admin/products/upload/
    admin/promo/
    admin/sales-reps/
    admin/sales-reps/analytics/
    admin/email-settings/
    admin/migrate/
    admin/screenshot/

  admin/                     ← Admin dashboard (DO NOT MODIFY)
    page.tsx
    layout.tsx
    toaster.tsx
    products/
    orders/[id]/
    promo/
    emails/
    qbo-connect/
    docs/

  portal/                    ← Authenticated storefront
    page.tsx                 ← Customize per brand
    layout.tsx
    template.tsx
    cart/                    ← DO NOT MODIFY
    checkout/                ← DO NOT MODIFY (except payment method UI)
    orders/                  ← DO NOT MODIFY
    orders/[id]/
    account/                 ← DO NOT MODIFY
    product/[id]/            ← Customize per brand
    science/                 ← Optional feature (remove if not needed)
    contact/

  login/                     ← Customize per brand
  auth/                      ← Auth flows
  contact/                   ← Customize per brand
  terms/, privacy/, etc.     ← Update legal copy per brand

components/                  ← UI components (customize per brand)
  Navbar.tsx
  Footer.tsx
  Hero.tsx
  Features.tsx
  FAQ.tsx
  CartDrawer.tsx
  LegalPage.tsx
  ... etc.

lib/                         ← Business logic (DO NOT MODIFY unless noted)
  supabase/
    client.ts
    server.ts
    admin.ts
    middleware.ts
  cart-context.tsx            ← Uses siteConfig for fees/storage
  pricing.ts                 ← Modify only to change discount logic
  products.ts                ← Product type + empty static array
  products-db.ts
  research-data.ts           ← Research types + empty data
  resend.ts
  shipstation.ts
  qbo.ts
  admin-auth.ts
  emails/
    send.ts
    template.ts              ← Uses siteConfig for brand in emails
    settings.ts
  utils/
    validation.ts

supabase/
  setup.sql                  ← Run once per new project
```
