import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact AmiNexa | Bulk Peptide Orders & Research Inquiries",
  description:
    "Contact AmiNexa for bulk research peptide orders, wholesale pricing, institutional procurement, or technical questions about BPC-157, GHK-Cu, NAD+, and more.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
