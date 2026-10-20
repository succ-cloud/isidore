import { getSessionUser, type PublicUser } from "@/lib/auth";

export async function requireAdmin(): Promise<PublicUser | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
