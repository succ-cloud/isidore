"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useCatalog, type LiveCategory, type LiveProduct } from "@/context/CatalogContext";
import { categoryPhotoSet, photoFor } from "@/lib/images";
import { formatRand } from "@/lib/site";

const featuredSlugs = ["solar-backup", "cable-wire", "lighting"];

function coverFor(category: LiveCategory) {
  const chosen = (category.images ?? []).filter(Boolean);
  return chosen[0] || categoryPhotoSet(category.slug)[0];
}

function savings(product: LiveProduct) {
  if (!product.compareAt || product.compareAt <= product.price) return null;
  const amount = product.compareAt - product.price;
  return { amount, percent: Math.round((amount / product.compareAt) * 100) };
}

export function CategorySection() {
  const { categories, products } = useCatalog();
  const { add } = useCart();
  const router = useRouter();
  const rail = useRef<HTMLUListElement>(null);
  const categorySlugs = new Set(categories.map((category) => category.slug));
  const inCategory = products.filter((product) => product.inStock && categorySlugs.has(product.categorySlug));
  const discounted = inCategory.filter((product) => savings(product));
  const priced = inCategory.filter((product) => !savings(product));
  const offers = [...discounted, ...priced].slice(0, 4);
  const featured = featuredSlugs
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is LiveCategory => Boolean(category));
  const lead = featured.length ? featured : categories.slice(0, 3);
  const leadSlugs = new Set(lead.map((category) => category.slug));
  const more = categories.filter((category) => !leadSlugs.has(category.slug));

  function scrollRail(direction: 1 | -1) {
    const node = rail.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>("li");
    const distance = (card?.offsetWidth ?? 200) + 16;
    node.scrollBy({ left: direction * distance, behavior: "smooth" });
  }

  return (
    <section className="section categories" aria-labelledby="category-title">
      <div className="cat-feature">
        <div className="cat-copy">
          <p className="cat-kicker">Trade range</p>
          <h2 id="category-title">Shop by category</h2>
          <p>Solar, cable and wire, lighting, HVAC, and the electrical stock used by contractors and DIY projects.</p>
          <Link className="cat-view" href="/shop">
            View all
          </Link>
        </div>
        <ul className="cat-feature-grid">
          {lead.map((category) => (
            <li key={category.slug}>
              <Link href={`/shop/${category.slug}`} className="cat-card">
                <span className="cat-photo">
                  <img src={coverFor(category)} alt="" />
                </span>
                <span className="cat-name">{category.name}</span>
                <span className="cat-summary">{category.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {more.length ? (
        <div className="cat-signature">
          <div className="cat-copy">
            <h2>Also on the counter.</h2>
            <p>Meters, security, switches, and the climate equipment for the rest of the job.</p>
          </div>
          <div className="cat-rail-wrap">
            <ul className="cat-rail" ref={rail}>
              {more.map((category) => (
                <li key={category.slug}>
                  <Link href={`/shop/${category.slug}`} className="cat-tile">
                    <span className="cat-tile-photo">
                      <img src={coverFor(category)} alt="" />
                    </span>
                    <strong>{category.name}</strong>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="cat-arrows">
              <button type="button" aria-label="Previous categories" onClick={() => scrollRail(-1)}>
                ‹
              </button>
              <button type="button" aria-label="Next categories" onClick={() => scrollRail(1)}>
                ›
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {offers.length ? (
        <div className="cat-offers">
          <div className="cat-offers-head">
            <p className="cat-kicker">Ready to order</p>
            <h2>Prices on the counter</h2>
          </div>
          <ul className="cat-offer-grid">
            {offers.map((product) => {
              const deal = savings(product);
              const image = product.images?.[0] || photoFor(product.categorySlug, product.slug);
              return (
                <li key={product.slug}>
                  <article className="offer-card">
                    <Link href={`/product/${product.slug}`} className="cat-photo">
                      <img src={image} alt="" />
                      {deal ? <span className="offer-badge">Save {deal.percent}%</span> : null}
                    </Link>
                    <h3>
                      <Link href={`/product/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className="offer-price">
                      <strong>{formatRand(product.price)}</strong>
                      {deal ? <s>{formatRand(product.compareAt ?? 0)}</s> : null}
                    </p>
                    <p className="offer-save">{deal ? `Discount ${formatRand(deal.amount)}` : "Listed price"}</p>
                    <button
                      className="btn-green"
                      type="button"
                      onClick={() => {
                        add(product.slug, 1);
                        router.push("/cart");
                      }}
                    >
                      Place an order
                    </button>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
