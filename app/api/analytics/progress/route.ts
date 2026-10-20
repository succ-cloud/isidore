import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { cleanItems, recordProgress, type CheckoutStep } from "@/lib/analytics";
import { consentGranted, currentVisitorId, visitorCookie } from "@/lib/visitor";

export async function POST(request: Request) {
  if (!(await consentGranted())) return new NextResponse(null, { status: 204 });
  const body = await request.json().catch(() => null);
  const step = String(body?.step || "");
  if (step !== "auth" && step !== "checkout") {
    return NextResponse.json({ ok: false, message: "Unknown checkout step." }, { status: 400 });
  }
  const existing = await currentVisitorId();
  const sessionId = existing || crypto.randomUUID();
  const user = await getSessionUser();
  await recordProgress(sessionId, user?.id, step as CheckoutStep, cleanItems(body?.items));
  const response = NextResponse.json({ ok: true });
  if (!existing) {
    const cookie = visitorCookie(sessionId);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}
