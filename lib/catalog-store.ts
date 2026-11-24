import { categories as staticCategories, products as staticProducts, subcategories as staticSubcategories, type Category, type Product, type Subcategory } from "@/lib/catalog";
import { databaseReady } from "@/lib/database";
import { photoFor } from "@/lib/images";
import { CategoryModel, ProductModel, SubcategoryModel } from "@/lib/models";
import { mongoEnabled } from "@/lib/mongo";

export type StoreCategory = Category & {
  image: string;
  images: string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreSubcategory = Subcategory & {
  active: boolean;
};

export type StoreProduct = Product & {
  stock: number;
  active: boolean;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
};

type CategoryDoc = {
  slug: string;
  name: string;
  summary?: string;
  layout?: Category["layout"];
  image?: string;
  images?: string[];
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type SubcategoryDoc = {
  slug: string;
  name: string;
  categorySlug: string;
  summary?: string;
  active?: boolean;
};

type ProductDoc = {
  slug: string;
  name: string;
  categorySlug: string;
  subcategorySlug?: string;
  brand?: string;
  price: number;
  compareAt?: number;
  sku?: string;
  stock?: number;
  active?: boolean;
  featured?: boolean;
  promo?: boolean;
  summary?: string;
  description?: string;
  specs?: { label: string; value: string }[];
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

function stamp(value?: Date) {
  return value ? value.toISOString() : undefined;
}

function fromCategory(doc: CategoryDoc): StoreCategory {
  return {
    slug: doc.slug,
    name: doc.name,
    summary: doc.summary ?? "",
    layout: doc.layout ?? "grid",
    image: doc.image ?? doc.images?.[0] ?? "",
    images: (doc.images ?? []).filter(Boolean).slice(0, 4),
    active: doc.active !== false,
    createdAt: stamp(doc.createdAt),
    updatedAt: stamp(doc.updatedAt),
  };
}

function fromSubcategory(doc: SubcategoryDoc): StoreSubcategory {
  return {
    slug: doc.slug,
    name: doc.name,
    categorySlug: doc.categorySlug,
    summary: doc.summary ?? "",
    active: doc.active !== false,
  };
}

function fromProduct(doc: ProductDoc): StoreProduct {
  const stock = doc.stock ?? 0;
  const active = doc.active !== false;
  return {
    slug: doc.slug,
    name: doc.name,
    categorySlug: doc.categorySlug,
    subcategorySlug: doc.subcategorySlug ?? "",
    brand: doc.brand ?? "",
    price: doc.price,
    compareAt: doc.compareAt,
    sku: doc.sku ?? "",
    inStock: active && stock > 0,
    stock,
    active,
    featured: Boolean(doc.featured),
    promo: Boolean(doc.promo),
    summary: doc.summary ?? "",
    description: doc.description ?? "",
    specs: doc.specs ?? [],
    images: doc.images?.length ? doc.images : [photoFor(doc.categorySlug, doc.slug)],
    createdAt: stamp(doc.createdAt),
    updatedAt: stamp(doc.updatedAt),
  };
}

function staticCatalog() {
  return {
    categories: staticCategories.map((category) => ({ ...category, image: "", images: [], active: true })),
    subcategories: staticSubcategories.map((item) => ({ ...item, active: true })),
    products: staticProducts.map((product) =>
      fromProduct({
        ...product,
        stock: product.inStock ? 25 : 0,
        active: true,
        images: [photoFor(product.categorySlug, product.slug)],
      }),
    ),
  };
}

export async function readCatalog(includeInactive = false) {
  if (!mongoEnabled()) return staticCatalog();
  try {
    const ready = await databaseReady();
    if (!ready) return staticCatalog();
    const [categories, subcategories, products] = await Promise.all([
      CategoryModel.find(includeInactive ? {} : { active: true }).sort({ name: 1 }).lean<CategoryDoc[]>(),
      SubcategoryModel.find(includeInactive ? {} : { active: true }).sort({ name: 1 }).lean<SubcategoryDoc[]>(),
      ProductModel.find(includeInactive ? {} : { active: true }).sort({ name: 1 }).lean<ProductDoc[]>(),
    ]);
    return {
      categories: categories.map(fromCategory),
      subcategories: subcategories.map(fromSubcategory),
      products: products.map(fromProduct),
    };
  } catch {
    return staticCatalog();
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
