import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopCatalog } from "@/components/ShopCatalog";
import { categoryBySlug } from "@/lib/catalog";
import { readCatalog } from "@/lib/catalog-store";

type Props = { params: Promise<{ category: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const catalog = await readCatalog();
  const match = catalog.categories.find((item) => item.slug === category) || categoryBySlug(category);
  if (!match) return { title: "Shop" };
  return {
    title: match.name,
    description: match.summary,
    alternates: { canonical: `/shop/${match.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const catalog = await readCatalog();
  const match = catalog.categories.find((item) => item.slug === category) || categoryBySlug(category);
  if (!match) notFound();
  return (
    <Suspense fallback={<p className="page">Loading {match.name}…</p>}>
      <ShopCatalog lockedCategory={match.slug} />
    </Suspense>
  );
}
