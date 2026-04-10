import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getProduct, products } from "@/lib/products";

const BASE_URL = siteConfig.url;

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const categoryLabel = product.category === "pen" ? "Pre-Filled Peptide Pen" : "Research Peptide Vial";
  const brandPrefix = product.brand ? `${product.brand} ` : "";

  const title = `Buy ${brandPrefix}${product.name} ${product.volume} | ${product.purity} Purity | ${categoryLabel}`;
  const description = `${product.name} (${product.fullName}) — ${product.volume}, ${product.purity} HPLC-verified purity. ${product.description.slice(0, 120)} From $${product.price}. COA included. Cold-chain shipped.`;

  return {
    title,
    description,
    openGraph: {
      title: `${product.name} ${product.volume} — ${product.purity} Purity | ${siteConfig.name}`,
      description,
      type: "website",
      url: `${BASE_URL}/portal/product/${id}`,
      images: product.image ? [{ url: product.image, width: 800, height: 800, alt: `${product.name} ${categoryLabel}` }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `Buy ${product.name} ${product.volume} | ${siteConfig.name}`,
      description: `${product.purity} purity ${product.name} — ${product.description.slice(0, 100)}`,
    },
    alternates: {
      canonical: `${BASE_URL}/portal/product/${id}`,
    },
  };
}

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
