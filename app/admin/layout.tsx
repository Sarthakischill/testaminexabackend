import type { Metadata } from "next";
import { AdminToaster } from "./toaster";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} Admin | Order Manager`,
  description: "Admin dashboard for managing orders",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AdminToaster />
    </>
  );
}
