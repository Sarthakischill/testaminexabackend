import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Contact ${siteConfig.name} | Bulk Peptide Orders & Research Inquiries`,
  description:
    `Contact ${siteConfig.name} for bulk research peptide orders, wholesale pricing, institutional procurement, or technical questions about BPC-157, GHK-Cu, NAD+, and more.`,
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
