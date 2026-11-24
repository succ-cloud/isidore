import { categories, products, subcategories } from "@/lib/catalog";
import { categoryPhotoSet, photoFor } from "@/lib/images";
import { CategoryModel, ProductModel, SubcategoryModel, UserModel } from "@/lib/models";

let seeded = false;

const retiredCategorySlugs = ["distribution", "general", "switchgear", "transmission", "pumps"];

export async function seedDatabase() {
  if (seeded) return;

  await CategoryModel.deleteMany({ slug: { $in: retiredCategorySlugs } });
  await ProductModel.deleteMany({ categorySlug: { $in: retiredCategorySlugs } });

  if ((await CategoryModel.countDocuments()) === 0) {
    await CategoryModel.insertMany(
      categories.map((category) => ({
        slug: category.slug,
        name: category.name,
        summary: category.summary,
        layout: category.layout,
        image: categoryPhotoSet(category.slug)[0] ?? "",
        active: true,
      })),
    );
  }

  for (const item of subcategories) {
    await SubcategoryModel.updateOne(
      { slug: item.slug },
      { $setOnInsert: { slug: item.slug, name: item.name, categorySlug: item.categorySlug, summary: item.summary, active: true } },
      { upsert: true },
    );
  }

  if ((await ProductModel.countDocuments()) === 0) {
    await ProductModel.insertMany(
      products.map((product) => ({
        slug: product.slug,
        name: product.name,
        categorySlug: product.categorySlug,
        subcategorySlug: product.subcategorySlug,
        brand: product.brand,
        price: product.price,
        compareAt: product.compareAt,
        sku: product.sku,
        stock: product.inStock ? 25 : 0,
        active: true,
        featured: Boolean(product.featured),
        promo: Boolean(product.promo),
        summary: product.summary,
        description: product.description,
        specs: product.specs,
        images: [photoFor(product.categorySlug, product.slug)],
      })),
    );
  }

  for (const product of products) {
    await ProductModel.updateOne(
      { slug: product.slug, $or: [{ subcategorySlug: { $exists: false } }, { subcategorySlug: "" }] },
      { $set: { subcategorySlug: product.subcategorySlug } },
    );
  }

  const unassigned = await ProductModel.find({ $or: [{ subcategorySlug: { $exists: false } }, { subcategorySlug: "" }] });
  for (const product of unassigned) {
    const match = await SubcategoryModel.findOne({ categorySlug: product.categorySlug }).sort({ name: 1 });
    if (!match) continue;
    product.subcategorySlug = match.slug;
    await product.save();
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword && adminPassword.length >= 8) {
    const existing = await UserModel.findOne({ email: adminEmail });
    if (!existing) {
      const { hashPassword } = await import("@/lib/auth");
      await UserModel.create({
        name: "Store admin",
        email: adminEmail,
        phone: "",
        passwordHash: await hashPassword(adminPassword),
        role: "admin",
      });
    }
  }

  seeded = true;
}
