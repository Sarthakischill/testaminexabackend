import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aminexa.net";

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
