import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getEvents } from "@/lib/analytics";

export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  const url = new URL(request.url);
  const events = await getEvents({
    preset: url.searchParams.get("preset") || "7",
    from: url.searchParams.get("from") || "",
    to: url.searchParams.get("to") || "",
    type: url.searchParams.get("type") || "",
    page: Number(url.searchParams.get("page") || 1),
  });
  return NextResponse.json(events);
}
