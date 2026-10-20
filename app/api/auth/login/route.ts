import { NextResponse } from "next/server";
import { attachSession, recordEvent } from "@/lib/analytics";
import { clean, createSessionToken, isEmail, sessionCookie, toPublicUser, verifyPassword } from "@/lib/auth";
import { databaseReady } from "@/lib/database";
import { findUserByEmail } from "@/lib/users";
import { consentGranted, currentVisitorId, visitorCookie } from "@/lib/visitor";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = clean(body?.email, 120).toLowerCase();
  const password = String(body?.password ?? "");

  if (!isEmail(email) || !password) {
    return NextResponse.json({ ok: false, message: "Enter the email and password for your account." }, { status: 400 });
  }

  const database = await databaseReady();
  const user = await findUserByEmail(email);
  if (!user && !database) {
    return NextResponse.json({ ok: false, message: "The store database could not be reached. Check the network access list and try again." }, { status: 503 });
  }
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ ok: false, message: "That email and password do not match." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user: toPublicUser(user) });
  const cookie = sessionCookie(createSessionToken(user.id));
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  if (await consentGranted()) {
    const existing = await currentVisitorId();
    const sessionId = existing || crypto.randomUUID();
    await attachSession(sessionId, user.id);
    await recordEvent({ type: "login_complete", sessionId, userId: user.id, path: "/login" });
    if (!existing) {
      const visitor = visitorCookie(sessionId);
      response.cookies.set(visitor.name, visitor.value, visitor.options);
    }
  }
  return response;
}
