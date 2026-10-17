import Link from "next/link";
import { categories } from "@/lib/catalog";
import { categoryPhotoSet } from "@/lib/images";

export function CategorySection() {
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
          {categories.map((category) => (
            <Link key={category.slug} href={`/shop/${category.slug}`} className="cat-card">
              <span className={`collage layout-${category.layout}`} aria-hidden="true">
                {categoryPhotoSet(category.slug).map((src, index) => (
                  <img key={src} src={src} alt="" className={`swatch s${index + 1}`} />
                ))}
              </span>
              <span className="cat-label">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
