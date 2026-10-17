import { NextResponse } from "next/server";
import { clean, createSessionToken, isEmail, sessionCookie, toPublicUser, verifyPassword, type UserRecord } from "@/lib/auth";
import { readJson } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = clean(body?.email, 120).toLowerCase();
  const password = String(body?.password ?? "");

  if (!isEmail(email) || !password) {
    return NextResponse.json({ ok: false, message: "Enter the email and password for your account." }, { status: 400 });
  }

  const users = await readJson<UserRecord[]>("users.json", []);
  const user = users.find((entry) => entry.email === email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ ok: false, message: "That email and password do not match." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user: toPublicUser(user) });
  const cookie = sessionCookie(createSessionToken(user.id));
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
