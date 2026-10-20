"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { categories as staticCategories, products as staticProducts, type Category, type Product } from "@/lib/catalog";
import { photoFor } from "@/lib/images";

export type LiveProduct = Product & { images?: string[]; stock?: number; active?: boolean };
export type LiveCategory = Category & { image?: string; images?: string[]; active?: boolean };

type CatalogValue = {
  products: LiveProduct[];
  categories: LiveCategory[];
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

  useEffect(() => {
    fetch("/api/catalog")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length) setProducts(data.products);
        if (Array.isArray(data.categories) && data.categories.length) setCategories(data.categories.filter((item: LiveCategory) => item.active !== false));
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo<CatalogValue>(
    () => ({
      products,
      categories,
      productBySlug: (slug) => products.find((product) => product.slug === slug),
    }),
    [products, categories],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used within CatalogProvider");
  return value;
}
