import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductArt } from "@/components/ProductArt";
import { ProductPurchase } from "@/components/ProductPurchase";
import { categoryBySlug, productBySlug, products, productsInCategory } from "@/lib/catalog";
import { formatRand } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.summary,
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();
  const category = categoryBySlug(product.categorySlug);
  const related = productsInCategory(product.categorySlug).filter((item) => item.slug !== product.slug).slice(0, 3);

  return (
    <div className="page">
      <p className="crumbs">
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> /{" "}
        <Link href={`/shop/${product.categorySlug}`}>{category?.name}</Link>
      </p>
      <div className="product-layout">
        <ProductArt category={product.categorySlug} seed={product.slug} alt={product.name} />
        <div>
          <p className="brand">{product.brand}</p>
          <h1>{product.name}</h1>
          <p className="price">
            {formatRand(product.price)}
            {product.compareAt ? <s>{formatRand(product.compareAt)}</s> : null}
          </p>
          <p>{product.description}</p>
          <p>{product.inStock ? "In stock for delivery and collection." : "Waiting on the next inbound delivery."}</p>
          <p>SKU {product.sku}</p>
          <ProductPurchase slug={product.slug} disabled={!product.inStock} />
          <table className="specs">
            <tbody>
              {product.specs.map((spec) => (
                <tr key={spec.label}>
                  <th scope="row">{spec.label}</th>
                  <td>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {related.length > 0 ? (
        <>
          <h2>More in {category?.name}</h2>
          <div className="card-grid">
            {related.map((item) => (
              <article className="info-card" key={item.slug}>
                <h2>
                  <Link href={`/product/${item.slug}`}>{item.name}</Link>
                </h2>
                <p className="price">{formatRand(item.price)}</p>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
