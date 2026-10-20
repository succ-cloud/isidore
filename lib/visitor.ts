import { cookies } from "next/headers";

export const VISITOR_COOKIE = "isdore_visitor";
export const CONSENT_COOKIE = "isdore_consent";

const visitorPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function visitorCookie(id: string) {
  return {
    name: VISITOR_COOKIE,
    value: id,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    },
  };
}

export async function consentGranted() {
  const jar = await cookies();
  return jar.get(CONSENT_COOKIE)?.value === "granted";
}

export async function currentVisitorId() {
  const jar = await cookies();
  const value = jar.get(VISITOR_COOKIE)?.value || "";
  return visitorPattern.test(value) ? value : "";
}

export function validVisitorId(value: string) {
  return visitorPattern.test(value);
}
