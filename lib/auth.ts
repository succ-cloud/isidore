import { createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { readJson } from "@/lib/db";

const scryptAsync = promisify(scrypt);
const COOKIE = "isdore_session";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicUser = Pick<UserRecord, "id" | "name" | "email" | "phone">;

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Set AUTH_SECRET before running in production.");
  }
  return "isdore-dev-secret-change-before-deploy";
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const keyBuffer = Buffer.from(key, "hex");
  if (derived.length !== keyBuffer.length) return false;
  return timingSafeEqual(derived, keyBuffer);
}

export function createSessionToken(userId: string) {
  const body = Buffer.from(
    JSON.stringify({ sub: userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 14 }),
  ).toString("base64url");
  const signature = createHmac("sha256", authSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function readSessionToken(token: string | undefined) {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = createHmac("sha256", authSecret()).update(body).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      sub: string;
      exp: number;
    };
    if (!payload.sub || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    },
  };
}

export const clearedSessionCookie = {
  name: COOKIE,
  value: "",
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  },
};

export function toPublicUser(user: UserRecord): PublicUser {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone };
}

export async function getSessionUser() {
  const jar = await cookies();
  const payload = readSessionToken(jar.get(COOKIE)?.value);
  if (!payload) return null;
  const users = await readJson<UserRecord[]>("users.json", []);
  const user = users.find((entry) => entry.id === payload.sub);
  return user ? toPublicUser(user) : null;
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function clean(value: unknown, max = 160) {
  return String(value ?? "").trim().slice(0, max);
}
