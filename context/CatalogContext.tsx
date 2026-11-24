"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { categories as staticCategories, products as staticProducts, subcategories as staticSubcategories, type Category, type Product, type Subcategory } from "@/lib/catalog";
import { photoFor } from "@/lib/images";

export type LiveProduct = Product & { images?: string[]; stock?: number; active?: boolean };
export type LiveCategory = Category & { image?: string; images?: string[]; active?: boolean };
export type LiveSubcategory = Subcategory & { active?: boolean };

type CatalogValue = {
  products: LiveProduct[];
  categories: LiveCategory[];
  subcategories: LiveSubcategory[];
  productBySlug: (slug: string) => LiveProduct | undefined;
};

const CatalogContext = createContext<CatalogValue | null>(null);

const initialProducts: LiveProduct[] = staticProducts.map((product) => ({
  ...product,
  images: [photoFor(product.categorySlug, product.slug)],
  stock: product.inStock ? 25 : 0,
  active: true,
}));

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<LiveProduct[]>(initialProducts);
  const [categories, setCategories] = useState<LiveCategory[]>(staticCategories);
  const [subcategories, setSubcategories] = useState<LiveSubcategory[]>(staticSubcategories);

  useEffect(() => {
    fetch("/api/catalog")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length) setProducts(data.products);
        if (Array.isArray(data.categories) && data.categories.length) setCategories(data.categories.filter((item: LiveCategory) => item.active !== false));
        if (Array.isArray(data.subcategories)) setSubcategories(data.subcategories.filter((item: LiveSubcategory) => item.active !== false));
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo<CatalogValue>(
    () => ({
      products,
      categories,
      subcategories,
      productBySlug: (slug) => products.find((product) => product.slug === slug),
    }),
    [products, categories, subcategories],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used within CatalogProvider");
  return value;
}
