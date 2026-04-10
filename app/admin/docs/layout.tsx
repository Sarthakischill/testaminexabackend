import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AmiNexa Admin | Operations Handbook",
  description: "Internal operations documentation for AmiNexa admin staff",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
