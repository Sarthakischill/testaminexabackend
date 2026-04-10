import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Buy Research Peptides | BPC-157, GHK-Cu, NAD+, GLP-3 & Peptide Pens",
  description:
    `Browse ${siteConfig.name}'s full catalog of research-grade peptides — BPC-157, GHK-Cu, NAD+, GLP-3, Epithalon, Tesamorelin, MOTS-c, MT2, and Amino Zero pre-filled peptide pens. 99%+ HPLC purity. COA included.`,
  openGraph: {
    title: `Research Peptide Catalog | ${siteConfig.name}`,
    description:
      "Shop pharmaceutical-grade research peptides — vials & pre-filled pens. BPC-157, GHK-Cu, NAD+, GLP-3 & more. 99%+ purity, cold-chain shipped.",
  },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
