"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { posts } from "@/lib/blog";
import { useCatalog } from "@/context/CatalogContext";
import { formatRand } from "@/lib/site";

export function SearchResults() {
  const params = useSearchParams();
  const { products } = useCatalog();
  const query = (params.get("q") || "").trim();
  const needle = query.toLowerCase();
  const foundProducts = needle
    ? products.filter((product) => `${product.name} ${product.brand} ${product.summary}`.toLowerCase().includes(needle))
    : [];
  const foundPosts = needle
    ? posts.filter((post) => `${post.title} ${post.description}`.toLowerCase().includes(needle))
    : [];

  return (
    <div className="page">
      <h1>Search</h1>
      <p className="lede">{query ? `Results for “${query}”.` : "Type a product, brand, or topic in the header search."}</p>
      <h2>Products</h2>
      {foundProducts.length === 0 ? (
        <p>No products matched.</p>
      ) : (
        <div className="card-grid">
          {foundProducts.map((product) => (
            <article className="info-card" key={product.slug}>
              <p className="brand">{product.brand}</p>
              <h2>
                <Link href={`/product/${product.slug}`}>{product.name}</Link>
              </h2>
              <p className="price">{formatRand(product.price)}</p>
            </article>
          ))}
        </div>
      )}
      <h2>From the journal</h2>
      {foundPosts.length === 0 ? (
        <p>No articles matched.</p>
      ) : (
        <ul>
          {foundPosts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
