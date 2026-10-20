import { readFileSync } from "fs";
import { databaseReady } from "@/lib/database";
import { CategoryModel, ProductModel, UserModel } from "@/lib/models";

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const index = line.indexOf("=");
  if (index < 1 || line.startsWith("#")) continue;
  const key = line.slice(0, index).trim();
  if (!process.env[key]) process.env[key] = line.slice(index + 1).trim();
}

async function main() {
  const ready = await databaseReady();
  if (!ready) {
    console.log("NO_URI");
    process.exit(1);
  }

  const [categories, products, admins] = await Promise.all([
    CategoryModel.countDocuments(),
    ProductModel.countDocuments(),
    UserModel.countDocuments({ role: "admin" }),
  ]);
  console.log(`READY categories=${categories} products=${products} admins=${admins}`);
  process.exit(0);
}

main().catch((error) => {
  const message = String(error?.message ?? error).replace(/mongodb(\+srv)?:\/\/[^@\s]+@/g, "mongodb://***@");
  console.log("FAILED", message.slice(0, 400));
  process.exit(1);
});
