import type { Metadata } from "next";
import Link from "next/link";
import { AddToCart } from "@/components/AddToCart";
import { ProductArt } from "@/components/ProductArt";
import { products } from "@/lib/catalog";
import { formatRand } from "@/lib/site";

export const metadata: Metadata = {
  title: "Promotions",
  description: "Current Isdore Solar promotions on panels, cable, protection, and lighting.",
  alternates: { canonical: "/promotions" },
};

export default function PromotionsPage() {
  const promos = products.filter((product) => product.promo);
  return (
    <div className="page">
      <p className="crumbs">
        <Link href="/">Home</Link> / Promotions
      </p>
      <h1>Promotions</h1>
      <p className="lede">Marked-down stock while the listed price lasts. Pictures are illustrations, and branch availability can differ.</p>
      <div className="product-grid">
        {promos.map((product) => (
          <article className="product-card" key={product.slug}>
            <Link href={`/product/${product.slug}`}>
              <ProductArt category={product.categorySlug} seed={product.slug} alt="" />
            </Link>
            <p className="brand">{product.brand}</p>
            <h2>
              <Link href={`/product/${product.slug}`}>{product.name}</Link>
            </h2>
            <p className="price">
              {formatRand(product.price)}
              {product.compareAt ? <s>{formatRand(product.compareAt)}</s> : null}
            </p>
            <AddToCart slug={product.slug} disabled={!product.inStock} />
          </article>
        ))}
      </div>
    </div>
  );
}
