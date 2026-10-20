import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { clean } from "@/lib/auth";
import { databaseReady } from "@/lib/database";
import { categoryImages, layoutForImageCount } from "@/lib/images";
import { CategoryModel, ProductModel } from "@/lib/models";
import { removeUploadedImage } from "@/lib/uploads";

const stockLayouts = new Set(["stack", "reel", "panel", "grid"]);

type Params = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  if (!(await databaseReady())) return NextResponse.json({ message: "The database is not connected." }, { status: 503 });
  const { slug } = await params;
  const current = await CategoryModel.findOne({ slug });
  if (!current) return NextResponse.json({ message: "That category was not found." }, { status: 404 });
  const body = await request.json().catch(() => null);
  const name = clean(body?.name, 80);
  if (!name) return NextResponse.json({ message: "A category needs a name." }, { status: 400 });
  const previous = [...new Set([...(current.images ?? []), current.image].filter(Boolean))];
  const images = categoryImages(body?.images);
  current.name = name;
  current.summary = clean(body?.summary, 280);
  current.images = images;
  current.image = images[0] ?? "";
  current.layout = images.length ? layoutForImageCount(images.length) : stockLayouts.has(current.layout) ? current.layout : "grid";
  current.active = body?.active !== false;
  await current.save();
  for (const image of previous) {
    if (image.startsWith("/uploads/") && !images.includes(image)) await removeUploadedImage(image);
  }
  return NextResponse.json({ category: current });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  if (!(await databaseReady())) return NextResponse.json({ message: "The database is not connected." }, { status: 503 });
  const { slug } = await params;
  const category = await CategoryModel.findOne({ slug });
  if (!category) return NextResponse.json({ message: "That category was not found." }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const reassignTo = clean(body?.reassignTo, 80);
  const productCount = await ProductModel.countDocuments({ categorySlug: slug });
  if (productCount > 0) {
    if (!reassignTo || reassignTo === slug || !(await CategoryModel.exists({ slug: reassignTo }))) {
      return NextResponse.json(
        { message: "Move the products in this category to another category before deleting it.", productCount },
        { status: 409 },
      );
    }
    await ProductModel.updateMany({ categorySlug: slug }, { categorySlug: reassignTo });
  }
  const removed = [...(category.images ?? []), category.image].filter((image) => image?.startsWith("/uploads/"));
  await category.deleteOne();
  for (const image of removed) await removeUploadedImage(image);
  return NextResponse.json({ ok: true });
}
