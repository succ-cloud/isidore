import { categories, products } from "@/lib/catalog";
import { categoryPhotoSet, photoFor } from "@/lib/images";
import { CategoryModel, ProductModel, UserModel } from "@/lib/models";

let seeded = false;

export async function seedDatabase() {
  if (seeded) return;

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

  if ((await ProductModel.countDocuments()) === 0) {
    await ProductModel.insertMany(
      products.map((product) => ({
        slug: product.slug,
        name: product.name,
        categorySlug: product.categorySlug,
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
