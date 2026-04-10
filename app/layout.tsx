import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050505",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://aminexa.net"),
  title: {
    default: "Buy Research Peptides Online | 99%+ Purity | AmiNexa",
    template: "%s | AmiNexa",
  },
  description:
    "Buy high-purity research peptides — BPC-157, GHK-Cu, NAD+, GLP-3, Epithalon & more. 99%+ HPLC-verified, manufactured in Germany, cold-chain shipped. COA included with every order.",
  keywords: [
    "buy research peptides",
    "research peptides for sale",
    "BPC-157",
    "GHK-Cu",
    "NAD+ peptide",
    "GLP-3",
    "Epithalon",
    "Tesamorelin",
    "MOTS-c",
    "Melanotan II",
    "MT2",
    "peptide pens",
    "high purity peptides",
    "99% purity peptides",
    "pharmaceutical grade peptides",
    "lab tested peptides",
    "peptides USA",
    "buy BPC-157",
    "buy GHK-Cu",
    "buy NAD+",
    "peptide supplier",
    "research grade peptides",
    "HPLC verified peptides",
    "cold chain peptides",
    "peptide COA",
  ],
  openGraph: {
    type: "website",
    siteName: "AmiNexa",
    title: "Buy Research Peptides Online | 99%+ HPLC Purity | AmiNexa",
    description:
      "Pharmaceutical-grade research peptides — BPC-157, GHK-Cu, NAD+, GLP-3 & more. 99%+ purity verified by independent labs. Manufactured in Germany. COA with every order. Free cold-chain shipping.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Research Peptides | 99%+ Purity | AmiNexa",
    description:
      "BPC-157, GHK-Cu, NAD+, GLP-3, Epithalon & more — 99%+ HPLC purity. Manufactured in Germany. Cold-chain shipped with COA.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://aminexa.net",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aminexa.net";

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AmiNexa",
    url: siteUrl,
    description:
      "Buy high-purity research peptides online — BPC-157, GHK-Cu, NAD+, GLP-3, Epithalon, Tesamorelin & more. 99%+ HPLC-verified purity. Manufactured in Germany. COA with every order.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/portal?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AmiNexa",
    url: siteUrl,
    description:
      "Research peptide supplier offering pharmaceutical-grade BPC-157, GHK-Cu, NAD+, GLP-3, and pre-filled peptide pens. 99%+ HPLC-verified purity. Manufactured in Germany with cold-chain shipping.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@aminexa.net",
      contactType: "customer support",
    },
    sameAs: [],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Site Navigation",
    itemListElement: [
      { "@type": "SiteNavigationElement", name: "Buy Research Peptides", url: `${siteUrl}/portal`, position: 1 },
      { "@type": "SiteNavigationElement", name: "Peptide Science & Research", url: `${siteUrl}/portal/science`, position: 2 },
      { "@type": "SiteNavigationElement", name: "Contact", url: `${siteUrl}/contact`, position: 3 },
      { "@type": "SiteNavigationElement", name: "Log In", url: `${siteUrl}/login`, position: 4 },
      { "@type": "SiteNavigationElement", name: "Privacy Policy", url: `${siteUrl}/privacy`, position: 5 },
      { "@type": "SiteNavigationElement", name: "Terms of Service", url: `${siteUrl}/terms`, position: 6 },
      { "@type": "SiteNavigationElement", name: "Return Policy", url: `${siteUrl}/returns`, position: 7 },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "AmiNexa Research Peptides",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "BPC-157 (10mg)", description: "Body Protection Compound — 99.4% HPLC purity, research-grade" }, price: "95.00", priceCurrency: "USD", url: `${siteUrl}/portal/product/bpc-157`, availability: "https://schema.org/InStock" },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "GHK-Cu (50mg)", description: "Copper Peptide — 99.2% HPLC purity, research-grade" }, price: "95.00", priceCurrency: "USD", url: `${siteUrl}/portal/product/ghk-cu`, availability: "https://schema.org/InStock" },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "NAD+ (500mg)", description: "Nicotinamide Adenine Dinucleotide — 99.9% HPLC purity, research-grade" }, price: "105.00", priceCurrency: "USD", url: `${siteUrl}/portal/product/nad`, availability: "https://schema.org/InStock" },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "GLP-3 (10mg)", description: "Glucagon-Like Peptide — 99.8% HPLC purity, research-grade" }, price: "135.00", priceCurrency: "USD", url: `${siteUrl}/portal/product/glp-3`, availability: "https://schema.org/InStock" },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background text-foreground selection:bg-accent selection:text-black relative overflow-x-hidden">
        <CartProvider>
          <SmoothScroll>
            <ScrollToTop />
            {children}
          </SmoothScroll>
        </CartProvider>
        <Analytics />
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","w6r6lgp0lh");`}
        </Script>
      </body>
    </html>
  );
}
