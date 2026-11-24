import { NextResponse } from "next/server";
import { readUploadedImage } from "@/lib/uploads";

type Params = { params: Promise<{ name: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: Params) {
  const { name } = await params;
  const image = await readUploadedImage(name);
  if (!image) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.mime,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
