import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const types: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

type Params = { params: Promise<{ name: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: Params) {
  const { name } = await params;
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  const type = types[extension];
  if (!type || !/^[\w.-]+$/.test(name)) return new NextResponse(null, { status: 404 });
  try {
    const bytes = await readFile(path.join(process.cwd(), "public", "uploads", name));
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
