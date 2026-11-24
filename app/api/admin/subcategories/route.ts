import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { clean } from "@/lib/auth";
import { slugify } from "@/lib/catalog-store";
import { databaseReady } from "@/lib/database";
import { CategoryModel, SubcategoryModel } from "@/lib/models";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  if (!(await databaseReady())) return NextResponse.json({ message: "The database is not connected." }, { status: 503 });
  const subcategories = await SubcategoryModel.find().sort({ name: 1 }).lean();
  return NextResponse.json({ subcategories });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  if (!(await databaseReady())) return NextResponse.json({ message: "The database is not connected." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const name = clean(body?.name, 80);
  const categorySlug = clean(body?.categorySlug, 80);
  const summary = clean(body?.summary, 280);
  if (!name) return NextResponse.json({ message: "A subcategory needs a name." }, { status: 400 });
  if (!(await CategoryModel.exists({ slug: categorySlug }))) {
    return NextResponse.json({ message: "Choose a main category that exists." }, { status: 400 });
  }
  let slug = slugify(clean(body?.slug, 80) || name);
  if (!slug) return NextResponse.json({ message: "Use a subcategory name with letters or numbers." }, { status: 400 });
  if (await SubcategoryModel.exists({ slug }) || (await CategoryModel.exists({ slug }))) {
    const scoped = slugify(`${name}-${categorySlug}`);
    slug = scoped && scoped !== slug ? scoped : "";
  }
  if (!slug || (await SubcategoryModel.exists({ slug }))) {
    return NextResponse.json({ message: "A subcategory with that name already exists." }, { status: 409 });
  }
  const subcategory = await SubcategoryModel.create({ slug, name, categorySlug, summary, active: body?.active !== false });
  return NextResponse.json({ subcategory }, { status: 201 });
}
