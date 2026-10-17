"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AddToCart } from "@/components/AddToCart";
import { ProductArt } from "@/components/ProductArt";
import { brands, categories, categoryBySlug, products } from "@/lib/catalog";
import { formatRand } from "@/lib/site";

export function ShopCatalog({ lockedCategory }: { lockedCategory?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedBrands = (params.get("brand") || "").split(",").filter(Boolean);
  const min = Number(params.get("min") || 0);
  const max = Number(params.get("max") || 0);
  const stockOnly = params.get("stock") === "1";
  const sort = params.get("sort") || "featured";
  const query = (params.get("q") || "").trim().toLowerCase();
  const category = lockedCategory || "";
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (category) list = list.filter((product) => product.categorySlug === category);
    if (selectedBrands.length) list = list.filter((product) => selectedBrands.includes(product.brand));
    if (min > 0) list = list.filter((product) => product.price >= min);
    if (max > 0) list = list.filter((product) => product.price <= max);
    if (stockOnly) list = list.filter((product) => product.inStock);
    if (query) {
      list = list.filter((product) => `${product.name} ${product.brand} ${product.summary}`.toLowerCase().includes(query));
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "featured") list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [category, selectedBrands, min, max, stockOnly, query, sort]);

  function update(next: Record<string, string | null>) {
    const search = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) search.delete(key);
      else search.set(key, value);
    }
    const suffix = search.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
  }

  function toggleBrand(brand: string) {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((item) => item !== brand)
      : [...selectedBrands, brand];
    update({ brand: next.join(",") || null });
  }

  const heading = category ? categoryBySlug(category)?.name || "Shop" : "Shop by product";

  return (
    <div className="catalogue">
      <button className="btn-navy filter-toggle" type="button" onClick={() => setFiltersOpen((open) => !open)}>
        {filtersOpen ? "Hide filters" : "Show filters"}
      </button>
      <aside className={`filters${filtersOpen ? " is-open" : ""}`}>
        <h2>Filters</h2>
        <fieldset>
          <legend>Category</legend>
          <Link className={!category ? "is-active" : ""} href="/shop">
            All products
          </Link>
          {categories.map((item) => (
            <Link key={item.slug} className={item.slug === category ? "is-active" : ""} href={`/shop/${item.slug}`}>
              {item.name}
            </Link>
          ))}
        </fieldset>
        <fieldset>
          <legend>Brand</legend>
          {brands.map((brand) => (
            <label key={brand} className="check">
              <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} />
              {brand}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Price (R)</legend>
          <label>
            Min
            <input
              type="number"
              min={0}
              defaultValue={params.get("min") || ""}
              onBlur={(event) => update({ min: event.target.value || null })}
            />
          </label>
          <label>
            Max
            <input
              type="number"
              min={0}
              defaultValue={params.get("max") || ""}
              onBlur={(event) => update({ max: event.target.value || null })}
            />
          </label>
        </fieldset>
        <label className="check">
          <input type="checkbox" checked={stockOnly} onChange={(event) => update({ stock: event.target.checked ? "1" : null })} />
          In stock only
        </label>
        <button
          className="text-button"
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
        >
          Clear filters
        </button>
      </aside>
      <div>
        <div className="catalogue-head">
          <div>
            <p className="crumbs">
              <Link href="/">Home</Link> / <span>{heading}</span>
            </p>
            <h1>{heading}</h1>
            <p>{filtered.length} products</p>
          </div>
          <label className="sort">
            Sort
            <select value={sort} onChange={(event) => update({ sort: event.target.value === "featured" ? null : event.target.value })}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
        {filtered.length === 0 ? (
          <p className="empty">Nothing matches those filters. Clear them or try another category.</p>
        ) : (
          <div className="product-grid">
            {filtered.map((product) => (
              <article key={product.slug} className="product-card">
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
        )}
      </div>
    </div>
  );
}
