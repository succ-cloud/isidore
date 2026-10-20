import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrivacyControls } from "@/components/PrivacyControls";
import { legalPages } from "@/lib/legal";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(legalPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = legalPages[slug];
  if (!page) return { title: "Legal" };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/legal/${slug}` },
  };
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const page = legalPages[slug];
  if (!page) notFound();
  return (
    <article className="page prose">
      <p className="crumbs">
        <Link href="/">Home</Link> / {page.title}
      </p>
      <h1>{page.title}</h1>
      {page.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {slug === "privacy" ? <PrivacyControls /> : null}
    </article>
  );
}
