# Ecommerce Backend Template

A fully custom, reusable ecommerce backend built with Next.js App Router + Supabase.

Provides auth, orders, payments, shipping (ShipStation), email (Resend), accounting (QuickBooks Online), promo codes, inventory management, and a full admin dashboard — out of the box.

## Quick Start

1. Duplicate this repo for a new brand project
2. Update `config/site.ts` with the brand's details
3. Create a new Supabase project and run `supabase/setup.sql`
4. Set up `.env.local` with credentials
5. Customize the frontend (pages, components, styles)
6. Deploy

## Documentation

See **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for the complete setup and architecture reference.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
