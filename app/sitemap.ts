import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";
import { categories, products } from "@/lib/catalog";
import { legalPages } from "@/lib/legal";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = [
    "",
    "/promotions",
    "/shop",
    "/brands",
    "/stores",
    "/careers",
    "/about",
    "/contact",
    "/delivery",
    "/quote",
    "/blog",
    "/solar-solutions",
  ];

  return [
    ...paths.map((path) => ({ url: `${site.url}${path || "/"}`, lastModified: now })),
    ...categories.map((category) => ({ url: `${site.url}/shop/${category.slug}`, lastModified: now })),
    ...products.map((product) => ({ url: `${site.url}/product/${product.slug}`, lastModified: now })),
    ...posts.map((post) => ({ url: `${site.url}/blog/${post.slug}`, lastModified: new Date(post.date) })),
    ...Object.keys(legalPages).map((slug) => ({ url: `${site.url}/legal/${slug}`, lastModified: now })),
  ];
}
