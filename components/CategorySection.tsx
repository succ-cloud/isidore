"use client";

import Link from "next/link";
import { useRef } from "react";
import { useCatalog, type LiveCategory } from "@/context/CatalogContext";
import { categoryPhotoSet } from "@/lib/images";

const featuredSlugs = ["solar-backup", "cable-wire", "lighting"];

function coverFor(category: LiveCategory) {
  const chosen = (category.images ?? []).filter(Boolean);
  return chosen[0] || categoryPhotoSet(category.slug)[0];
}

export function CategorySection() {
  const { categories } = useCatalog();
  const rail = useRef<HTMLUListElement>(null);
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
    </section>
  );
}
