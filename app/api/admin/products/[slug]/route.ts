import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { clean } from "@/lib/auth";
import { databaseReady } from "@/lib/database";
import { CategoryModel, ProductModel } from "@/lib/models";
import { removeUploadedImage } from "@/lib/uploads";

type Params = { params: Promise<{ slug: string }> };

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  if (!(await databaseReady())) return NextResponse.json({ message: "The database is not connected." }, { status: 503 });
  const { slug } = await params;
  const product = await ProductModel.findOne({ slug });
  if (!product) return NextResponse.json({ message: "That product was not found." }, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "We could not read that product." }, { status: 400 });
  const name = clean(body.name, 120);
  const categorySlug = clean(body.categorySlug, 80);
  const price = numberValue(body.price, -1);
  if (!name) return NextResponse.json({ message: "A product needs a name." }, { status: 400 });
  if (price < 0) return NextResponse.json({ message: "Enter a price of zero or more." }, { status: 400 });
  if (!(await CategoryModel.exists({ slug: categorySlug }))) {
    return NextResponse.json({ message: "Choose a category that exists." }, { status: 400 });
  }
  const previous = [...(product.images ?? [])];
  const images = Array.isArray(body.images) ? body.images.map((item: unknown) => clean(item, 240)).filter(Boolean).slice(0, 6) : [];
  product.name = name;
  product.categorySlug = categorySlug;
  product.brand = clean(body.brand, 80);
  product.price = price;
  product.compareAt = body.compareAt === "" || body.compareAt == null ? undefined : numberValue(body.compareAt, 0);
  product.sku = clean(body.sku, 40);
  product.stock = Math.max(0, Math.floor(numberValue(body.stock, 0)));
  product.active = body.active !== false;
  product.featured = Boolean(body.featured);
  product.promo = Boolean(body.promo);
  product.summary = clean(body.summary, 280);
  product.description = clean(body.description, 2000);
  product.images = images;
  await product.save();
  for (const image of previous) {
    if (!images.includes(image)) await removeUploadedImage(image);
  }
  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  if (!(await databaseReady())) return NextResponse.json({ message: "The database is not connected." }, { status: 503 });
  const { slug } = await params;
  const product = await ProductModel.findOne({ slug });
  if (!product) return NextResponse.json({ message: "That product was not found." }, { status: 404 });
  const images = [...(product.images ?? [])];
  await product.deleteOne();
  for (const image of images) await removeUploadedImage(image);
  return NextResponse.json({ ok: true });
}
