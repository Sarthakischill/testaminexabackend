import type { Metadata } from "next";
import { researchData } from "@/lib/research-data";
import { getProduct } from "@/lib/products";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aminexa.net";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const research = researchData[id];
  const product = getProduct(id);

  if (!research) {
    return { title: "Research Not Found" };
  }

  const title = `${research.headline} Research | Mechanisms, Studies & Data`;
  const description = `${research.subheadline.slice(0, 140)} Explore mechanisms of action, published studies, safety profiles, and research applications for ${product?.name || id}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${research.headline} — Peptide Research & Science | AmiNexa`,
      description,
      type: "article",
      url: `${BASE_URL}/portal/science/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${research.headline} Research | AmiNexa`,
      description: research.subheadline.slice(0, 150),
    },
    alternates: {
      canonical: `${BASE_URL}/portal/science/${id}`,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(researchData).map((id) => ({ id }));
}

export default function ScienceDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
