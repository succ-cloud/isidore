import { connectMongo } from "@/lib/mongo";

export async function databaseReady() {
  try {
    const connection = await connectMongo();
    if (!connection) return false;
    const { seedDatabase } = await import("@/lib/seed");
    await seedDatabase();
    return true;
  } catch (error) {
    const message = String(error instanceof Error ? error.message : error).replace(/mongodb(\+srv)?:\/\/[^@\s]+@/g, "mongodb://***@");
    console.error("Database connection failed", message.slice(0, 300));
    return false;
  }
}
