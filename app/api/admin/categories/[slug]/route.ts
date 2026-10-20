import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { clean } from "@/lib/auth";
import { databaseReady } from "@/lib/database";
import { CategoryModel, ProductModel } from "@/lib/models";
import { removeUploadedImage } from "@/lib/uploads";

const layouts = new Set(["stack", "reel", "panel", "grid"]);

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
  const previousImage = current.image;
  current.name = name;
  current.summary = clean(body?.summary, 280);
  current.layout = layouts.has(body?.layout) ? body.layout : current.layout;
  current.image = clean(body?.image, 240);
  current.active = body?.active !== false;
  await current.save();
  if (previousImage && previousImage !== current.image) await removeUploadedImage(previousImage);
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
  await category.deleteOne();
  if (category.image) await removeUploadedImage(category.image);
  return NextResponse.json({ ok: true });
}
