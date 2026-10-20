import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  EVENT_TYPES,
  allowEvent,
  cleanCampaign,
  cleanItems,
  cleanPath,
  cleanQuery,
  cleanReferrer,
  recordEvent,
  type EventType,
} from "@/lib/analytics";
import { consentGranted, currentVisitorId, visitorCookie } from "@/lib/visitor";

const blockedTypes = new Set(["order_complete", "login_complete", "register_complete", "checkout_abandoned"]);
const bannedFields = ["password", "card", "pan", "cvv", "cvc", "token", "authorization", "secret"];

function withVisitor(response: NextResponse, sessionId: string, created: boolean) {
  if (!created) return response;
  const cookie = visitorCookie(sessionId);
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}

export async function POST(request: Request) {
  if (!(await consentGranted())) return new NextResponse(null, { status: 204 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || bannedFields.some((key) => key in (body as object))) {
    return NextResponse.json({ ok: false, message: "That event could not be read." }, { status: 400 });
  }
  const type = String((body as { type?: unknown }).type || "");
  if (!EVENT_TYPES.includes(type as EventType) || blockedTypes.has(type)) {
    return NextResponse.json({ ok: false, message: "That event is not accepted." }, { status: 400 });
  }

  const existing = await currentVisitorId();
  const sessionId = existing || crypto.randomUUID();
  if (!allowEvent(sessionId)) {
    return withVisitor(NextResponse.json({ ok: false, message: "Too many events." }, { status: 429 }), sessionId, !existing);
  }

  const user = await getSessionUser();
  const payload = body as Record<string, unknown>;
  const productSlug = String(payload.productSlug || "").trim().toLowerCase();
  const categorySlug = String(payload.categorySlug || "").trim().toLowerCase();
  await recordEvent({
    type: type as EventType,
    sessionId,
    userId: user?.id,
    path: cleanPath(payload.path),
    productSlug: /^[a-z0-9-]{1,80}$/.test(productSlug) ? productSlug : "",
    categorySlug: /^[a-z0-9-]{1,80}$/.test(categorySlug) ? categorySlug : "",
    referrer: cleanReferrer(payload.referrer),
    campaign: cleanCampaign(payload.campaign),
    query: cleanQuery(payload.query),
    qty: Math.min(99, Math.max(0, Math.floor(Number(payload.qty) || 0))) || undefined,
    items: cleanItems(payload.items),
  });
  return withVisitor(NextResponse.json({ ok: true }), sessionId, !existing);
}
