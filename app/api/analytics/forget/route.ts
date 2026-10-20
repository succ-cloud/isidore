import { NextResponse } from "next/server";
import { forgetVisitor } from "@/lib/analytics";
import { getSessionUser } from "@/lib/auth";
import { currentVisitorId } from "@/lib/visitor";

export async function POST() {
  const [sessionId, user] = await Promise.all([currentVisitorId(), getSessionUser()]);
  await forgetVisitor(sessionId, user?.id);
  return NextResponse.json({ ok: true, message: "Browsing activity for this browser was deleted." });
}
