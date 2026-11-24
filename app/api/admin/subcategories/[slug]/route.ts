import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { clean } from "@/lib/auth";
import { databaseReady } from "@/lib/database";
import { ProductModel, SubcategoryModel } from "@/lib/models";

type Params = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  if (!(await databaseReady())) return NextResponse.json({ message: "The database is not connected." }, { status: 503 });
  const { slug } = await params;
  const current = await SubcategoryModel.findOne({ slug });
  if (!current) return NextResponse.json({ message: "That subcategory was not found." }, { status: 404 });
  const body = await request.json().catch(() => null);
  const name = clean(body?.name, 80);
  if (!name) return NextResponse.json({ message: "A subcategory needs a name." }, { status: 400 });
  current.name = name;
  current.summary = clean(body?.summary, 280);
  current.active = body?.active !== false;
  await current.save();
  return NextResponse.json({ subcategory: current });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  if (!(await databaseReady())) return NextResponse.json({ message: "The database is not connected." }, { status: 503 });
  const { slug } = await params;
  const subcategory = await SubcategoryModel.findOne({ slug });
  if (!subcategory) return NextResponse.json({ message: "That subcategory was not found." }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const reassignTo = clean(body?.reassignTo, 80);
  const productCount = await ProductModel.countDocuments({ subcategorySlug: slug });
  if (productCount > 0) {
    const target = reassignTo ? await SubcategoryModel.findOne({ slug: reassignTo }) : null;
    if (!target || target.slug === slug || target.categorySlug !== subcategory.categorySlug) {
      return NextResponse.json(
        { message: "Move the products in this subcategory to another subcategory in the same category before deleting it.", productCount },
        { status: 409 },
      );
    }
    await ProductModel.updateMany({ subcategorySlug: slug }, { subcategorySlug: reassignTo });
  }
  await subcategory.deleteOne();
  return NextResponse.json({ ok: true });
}
