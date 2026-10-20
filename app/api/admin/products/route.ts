import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { clean } from "@/lib/auth";
import { slugify } from "@/lib/catalog-store";
import { databaseReady } from "@/lib/database";
import { CategoryModel, ProductModel } from "@/lib/models";

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function productFields(body: Record<string, unknown>, slug: string) {
  const name = clean(body.name, 120);
  const categorySlug = clean(body.categorySlug, 80);
  const price = numberValue(body.price, -1);
  const stock = Math.max(0, Math.floor(numberValue(body.stock, 0)));
  if (!name) return { error: "A product needs a name." };
  if (price < 0) return { error: "Enter a price of zero or more." };
  if (!(await CategoryModel.exists({ slug: categorySlug }))) return { error: "Choose a category that exists." };
  const compareAt = body.compareAt === "" || body.compareAt == null ? undefined : numberValue(body.compareAt, -1);
  if (compareAt != null && compareAt < 0) return { error: "The compare price must be zero or more." };
  const images = Array.isArray(body.images) ? body.images.map((item) => clean(item, 240)).filter(Boolean).slice(0, 6) : [];
  return {
    value: {
      slug,
      name,
      categorySlug,
      brand: clean(body.brand, 80),
      price,
      compareAt,
      sku: clean(body.sku, 40),
      stock,
      active: body.active !== false,
      featured: Boolean(body.featured),
      promo: Boolean(body.promo),
      summary: clean(body.summary, 280),
      description: clean(body.description, 2000),
      images,
    },
  };
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  if (!(await databaseReady())) return NextResponse.json({ message: "The database is not connected." }, { status: 503 });
  const url = new URL(request.url);
  const q = clean(url.searchParams.get("q"), 80);
  const page = Math.max(1, Math.floor(Number(url.searchParams.get("page")) || 1));
  const limit = 8;
  const filter = q ? { $or: [{ name: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }, { sku: new RegExp(q, "i") }] } : {};
  const [total, products] = await Promise.all([
    ProductModel.countDocuments(filter),
    ProductModel.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  return NextResponse.json({ products, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  if (!(await databaseReady())) return NextResponse.json({ message: "The database is not connected." }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "We could not read that product." }, { status: 400 });
  const base = slugify(clean(body.slug, 80) || clean(body.name, 120));
  if (!base) return NextResponse.json({ message: "Use a product name with letters or numbers." }, { status: 400 });
  let slug = base;
  let suffix = 2;
  while (await ProductModel.exists({ slug })) slug = `${base}-${suffix++}`;
  const parsed = await productFields(body, slug);
  if ("error" in parsed) return NextResponse.json({ message: parsed.error }, { status: 400 });
  const product = await ProductModel.create(parsed.value);
  return NextResponse.json({ product }, { status: 201 });
}
