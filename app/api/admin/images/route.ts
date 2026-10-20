import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { removeUploadedImage, saveUploadedImage } from "@/lib/uploads";

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, message: "Only an administrator can upload images." }, { status: 403 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Choose an image to upload." }, { status: 400 });
  }
  try {
    const url = await saveUploadedImage(file);
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "The image could not be saved." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, message: "Only an administrator can remove images." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const url = String(body?.url ?? "");
  await removeUploadedImage(url);
  return NextResponse.json({ ok: true });
}
