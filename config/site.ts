/**
 * Centralized brand configuration.
 *
 * When starting a new project, update the values below to match the brand.
 * Every backend file that previously hardcoded brand strings now imports from here.
 *
 * NOTE: `url` falls back to NEXT_PUBLIC_SITE_URL so it works on both server and client.
 */
export const siteConfig = {
  // Brand identity
  name: "YourBrand",
  tagline: "Your tagline here",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://yourbrand.com",
  contactEmail: "contact@yourbrand.com",
  supportEmail: "support@yourbrand.com",
  legalDisclaimer: "For research use only. Not intended for human consumption.",

  // Email (Resend)
  fromEmail: "YourBrand <noreply@yourbrand.com>",
  fallbackRecipients: ["contact@yourbrand.com"],

  // Analytics
  clarityId: "", // Microsoft Clarity project ID — leave empty to disable

  // Theme
  themeColor: "#050505",

  // Shipping & pricing
  shippingFee: 5.99,
  freeShippingThreshold: 100,
  coldChainFee: 8,
  paymentDiscountRate: 0.10,

  // Cart localStorage key prefix (must be unique per brand to avoid collisions)
  storagePrefix: "yourbrand",

  // Logo — set to a URL or local path; used in admin, auth, and email templates
  logoUrl: "",
  faviconUrl: "",
};

export type SiteConfig = typeof siteConfig;
