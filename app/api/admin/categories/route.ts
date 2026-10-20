import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { clean } from "@/lib/auth";
import { slugify } from "@/lib/catalog-store";
import { databaseReady } from "@/lib/database";
import { CategoryModel } from "@/lib/models";

const layouts = new Set(["stack", "reel", "panel", "grid"]);

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  if (!(await databaseReady())) return NextResponse.json({ message: "The database is not connected." }, { status: 503 });
  const categories = await CategoryModel.find().sort({ name: 1 }).lean();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  if (!(await databaseReady())) return NextResponse.json({ message: "The database is not connected." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const name = clean(body?.name, 80);
  const summary = clean(body?.summary, 280);
  const layout = layouts.has(body?.layout) ? body.layout : "grid";
  const image = clean(body?.image, 240);
  if (!name) return NextResponse.json({ message: "A category needs a name." }, { status: 400 });
  const slug = slugify(clean(body?.slug, 80) || name);
  if (!slug) return NextResponse.json({ message: "Use a category name with letters or numbers." }, { status: 400 });
  if (await CategoryModel.exists({ slug })) {
    return NextResponse.json({ message: "A category with that name already exists." }, { status: 409 });
  }
  const category = await CategoryModel.create({ slug, name, summary, layout, image, active: body?.active !== false });
  return NextResponse.json({ category }, { status: 201 });
}
