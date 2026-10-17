import { NextResponse } from "next/server";
import { clean, getSessionUser, hashPassword, isEmail, sessionCookie, createSessionToken, toPublicUser, type UserRecord } from "@/lib/auth";
import { readJson, updateJson } from "@/lib/db";

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

  const users = await readJson<UserRecord[]>("users.json", []);
  if (users.some((user) => user.email === email)) {
    return NextResponse.json({ ok: false, message: "An account with that email already exists. Log in instead." }, { status: 409 });
  }

  const user: UserRecord = {
    id: crypto.randomUUID(),
    name,
    email,
    phone,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  await updateJson<UserRecord[]>("users.json", [], (current) => [...current, user]);

  const response = NextResponse.json({ ok: true, user: toPublicUser(user) });
  const cookie = sessionCookie(createSessionToken(user.id));
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}
