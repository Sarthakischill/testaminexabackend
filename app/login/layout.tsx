import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Log In or Register | Access Research Peptide Portal",
  description: `Log in or create your ${siteConfig.name} account to browse and order high-purity research peptides. Access COAs, order tracking, and exclusive pricing on BPC-157, GHK-Cu, NAD+ & more.`,
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
