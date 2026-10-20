import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { listCheckouts } from "@/lib/analytics";

export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  const url = new URL(request.url);
  const checkouts = await listCheckouts({
    preset: url.searchParams.get("preset") || "30",
    from: url.searchParams.get("from") || "",
    to: url.searchParams.get("to") || "",
    status: url.searchParams.get("status") || "abandoned_open",
  });
  return NextResponse.json(checkouts);
}
