import { NextResponse } from "next/server";
import { attachSession, recordEvent } from "@/lib/analytics";
import { clean, getSessionUser, hashPassword, isEmail, sessionCookie, createSessionToken, toPublicUser } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/users";
import { consentGranted, currentVisitorId, visitorCookie } from "@/lib/visitor";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || clean(body.company)) {
    return NextResponse.json({ ok: false, message: "We could not read that form." }, { status: 400 });
  }

  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 30);
  const password = String(body.password ?? "");

  if (!name || !isEmail(email) || password.length < 8) {
    return NextResponse.json(
      { ok: false, message: "Use your name, a valid email, and a password of at least 8 characters." },
      { status: 400 },
    );
  }

  if (await findUserByEmail(email)) {
    return NextResponse.json({ ok: false, message: "An account with that email already exists. Log in instead." }, { status: 409 });
  }

  const user = await createUser({
    id: crypto.randomUUID(),
    name,
    email,
    phone,
    passwordHash: await hashPassword(password),
    role: "customer",
  });

  const response = NextResponse.json({ ok: true, user: toPublicUser(user) });
  const cookie = sessionCookie(createSessionToken(user.id));
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  if (await consentGranted()) {
    const existing = await currentVisitorId();
    const sessionId = existing || crypto.randomUUID();
    await attachSession(sessionId, user.id);
    await recordEvent({ type: "register_complete", sessionId, userId: user.id, path: "/register" });
    if (!existing) {
      const visitor = visitorCookie(sessionId);
      response.cookies.set(visitor.name, visitor.value, visitor.options);
    }
  }
  return response;
}

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}
