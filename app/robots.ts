import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const BASE_URL = siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/portal/", "/portal/product/", "/portal/science/"],
        disallow: [
          "/portal/cart/",
          "/portal/checkout/",
          "/portal/orders/",
          "/portal/account/",
          "/portal/contact/",
          "/admin/",
          "/auth/",
          "/api/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
