"use client";

import Link from "next/link";
import { useCatalog, type LiveCategory } from "@/context/CatalogContext";
import { categoryPhotoSet, layoutForImageCount } from "@/lib/images";

const stockLayouts = new Set(["stack", "reel", "panel", "grid"]);

function collageFor(category: LiveCategory) {
  const chosen = (category.images ?? []).filter(Boolean).slice(0, 4);
  if (chosen.length) return { photos: chosen, layout: layoutForImageCount(chosen.length) };
  return {
    photos: categoryPhotoSet(category.slug).slice(0, 4),
    layout: stockLayouts.has(category.layout) ? category.layout : "grid",
  };
}

export function CategorySection() {
  const { categories } = useCatalog();
  return (
    <section className="section categories" aria-labelledby="category-title">
      <div className="section-intro">
        <h2 id="category-title">Your leading electrical wholesaler</h2>
        <hr />
        <h3>Power your next project with Isdore</h3>
        <p>
          Solar, cable and wire, distribution, lighting, and the general electrical stock used by contractors and DIY projects.
        </p>
      </div>
      <div className="cat-wrap">
        <div className="cat-track">
          {categories.map((category) => {
            const collage = collageFor(category);
            return (
            <Link key={category.slug} href={`/shop/${category.slug}`} className="cat-card">
              <span className={`collage layout-${collage.layout}`} aria-hidden="true">
                {collage.photos.map((src, index) => (
                  <img key={`${src}-${index}`} src={src} alt="" className={`swatch s${index + 1}`} />
                ))}
              </span>
              <span className="cat-label">{category.name}</span>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
