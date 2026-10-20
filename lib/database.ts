import { connectMongo } from "@/lib/mongo";

export async function databaseReady() {
  try {
    const connection = await connectMongo();
    if (!connection) return false;
    const { seedDatabase } = await import("@/lib/seed");
    await seedDatabase();
    return true;
  } catch {
    return false;
  }
}
