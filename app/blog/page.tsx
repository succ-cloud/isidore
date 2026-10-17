import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Journal",
  description: "Notes from Isdore Solar on backup sizing, solar cable, and trade accounts.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <div className="page">
      <p className="crumbs">
        <Link href="/">Home</Link> / Journal
      </p>
      <h1>Journal</h1>
      <p className="lede">Practical notes for people buying solar and electrical stock, written for the catalogue rather than copied from another retailer.</p>
      <div className="card-grid">
        {posts.map((post) => (
          <article className="info-card" key={post.slug}>
            <p className="brand">
              <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</time>
            </p>
            <h2>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p>{post.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
