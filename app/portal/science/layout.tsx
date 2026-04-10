import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Peptide Research & Science | Studies, Mechanisms & Data",
  description:
    "Explore the science behind research peptides — BPC-157, GHK-Cu, NAD+, GLP-3 and more. In-depth research summaries, mechanisms of action, and published study references.",
  openGraph: {
    title: `Peptide Science & Research | ${siteConfig.name}`,
    description:
      "In-depth research summaries and mechanisms of action for BPC-157, GHK-Cu, NAD+, GLP-3, Epithalon, and other research peptides.",
  },
};

export default function ScienceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
