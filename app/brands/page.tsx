import type { Metadata } from "next";
import Link from "next/link";
import { brands, products } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop by brand",
  description: "Filter the Isdore Solar catalogue by brand.",
  alternates: { canonical: "/brands" },
};

export default function BrandsPage() {
  return (
    <div className="page">
      <p className="crumbs">
        <Link href="/">Home</Link> / Shop by brand
      </p>
      <h1>Shop by brand</h1>
      <p className="lede">These names are catalogue placeholders until the real supplier list is loaded.</p>
      <div className="card-grid">
        {brands.map((brand) => {
          const count = products.filter((product) => product.brand === brand).length;
          return (
            <article className="info-card" key={brand}>
              <h2>
                <Link href={`/shop?brand=${encodeURIComponent(brand)}`}>{brand}</Link>
              </h2>
              <p>
                {count} product{count === 1 ? "" : "s"}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
