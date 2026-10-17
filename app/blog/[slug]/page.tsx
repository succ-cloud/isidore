import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { postBySlug, posts } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) return { title: "Journal" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) notFound();

  return (
    <article className="page prose">
      <p className="crumbs">
        <Link href="/">Home</Link> / <Link href="/blog">Journal</Link>
      </p>
      <p className="brand">
        <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</time>
        {" · "}
        {post.author}
      </p>
      <h1>{post.title}</h1>
      {post.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </article>
  );
}
