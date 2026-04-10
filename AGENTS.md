# AGENTS.md

## Project Overview

This is a **reusable ecommerce backend template** built with Next.js App Router and Supabase.

It provides a fully custom backend for storefront brands — including auth, orders, payments, shipping (ShipStation), accounting (QuickBooks Online), email notifications (Resend), promo codes, sales rep attribution, inventory management, and a full admin dashboard.

The frontend (marketing pages, product UI, brand design) is meant to be customized per client. The backend is shared infrastructure.

**Before starting any work on a new brand project, read `SETUP_GUIDE.md` first.** It contains the full architecture reference, onboarding checklist, and customization guide.

---

## Core Principles

* Prefer **server components** by default
* Avoid client-side data fetching — all data comes from server or API routes
* Keep JavaScript sent to the browser minimal
* All brand-specific values live in `config/site.ts` — never hardcode brand names, emails, or URLs elsewhere
* Prioritize fast initial render over heavy interactivity

---

## Data Fetching

* All data fetching happens on the **server** via API routes or Supabase server client
* Do not use `useEffect` for fetching data
* Supabase logic is isolated inside `/lib/supabase`
* Components should never directly call external APIs

---

## Brand Configuration

* `config/site.ts` is the single source of truth for all brand-specific values
* Every file that needs brand name, URL, email, shipping fees, etc. imports from `config/site.ts`
* When starting a new project, update `config/site.ts` first — it propagates everywhere automatically

---

## Folder Structure

* `/app` — routes and pages (Next.js App Router)
* `/app/api` — API route handlers (the backend)
* `/app/admin` — admin dashboard pages
* `/app/portal` — authenticated storefront pages
* `/components` — reusable UI components (frontend — customized per brand)
* `/lib` — business logic (pricing, products, emails, integrations)
* `/lib/supabase` — Supabase client setup (server, client, admin, middleware)
* `/config` — brand configuration (`site.ts`)
* `/supabase` — database migration (`setup.sql`)

---

## Key Files

* `config/site.ts` — brand config (name, URLs, emails, shipping, analytics)
* `supabase/setup.sql` — unified database schema (run once per new project)
* `lib/pricing.ts` — pricing engine (bundle discounts, payment discounts, promo codes)
* `lib/cart-context.tsx` — client-side cart state
* `lib/products-db.ts` — product queries from Supabase
* `lib/shipstation.ts` — ShipStation integration
* `lib/qbo.ts` — QuickBooks Online integration
* `lib/emails/` — email sending, templates, settings
* `middleware.ts` — auth middleware (route protection)

---

## Performance Guidelines

* Always render meaningful content on first load
* Avoid blocking the initial render with heavy scripts
* Load animations and non-critical features after content
* Use optimized images and define dimensions

---

## What to Avoid

* No hardcoded brand names outside `config/site.ts`
* No client-side API calls to external services
* No large third-party libraries unless necessary
* No mixing data fetching logic inside UI components
* No overengineering early in the project

---

## Development Approach

* Read `SETUP_GUIDE.md` before starting
* Configure `config/site.ts` first
* Run `supabase/setup.sql` in the new Supabase project
* Set up `.env.local` with project credentials
* Build/customize the frontend
* Add products via the admin panel
* Deploy
