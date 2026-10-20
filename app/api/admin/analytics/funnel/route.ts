import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getFunnel } from "@/lib/analytics";

export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  const url = new URL(request.url);
  const funnel = await getFunnel({
    preset: url.searchParams.get("preset") || "7",
    from: url.searchParams.get("from") || "",
    to: url.searchParams.get("to") || "",
  });
  return NextResponse.json(funnel);
}
