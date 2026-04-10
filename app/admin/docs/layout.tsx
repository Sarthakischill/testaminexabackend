import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} Admin | Operations Handbook`,
  description: `Internal operations documentation for ${siteConfig.name} admin staff`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
