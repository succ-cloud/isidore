import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { databaseReady } from "@/lib/database";
import { CategoryModel, OrderModel, ProductModel } from "@/lib/models";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  if (!(await databaseReady())) return NextResponse.json({ message: "The database is not connected." }, { status: 503 });

  const [products, activeProducts, lowStock, categories, orders, openOrders] = await Promise.all([
    ProductModel.countDocuments(),
    ProductModel.countDocuments({ active: true, stock: { $gt: 0 } }),
    ProductModel.countDocuments({ stock: { $lte: 5 } }),
    CategoryModel.countDocuments(),
    OrderModel.countDocuments(),
    OrderModel.countDocuments({ fulfillmentStatus: { $in: ["pending", "confirmed", "processing"] } }),
  ]);

  return NextResponse.json({
    products,
    activeProducts,
    lowStock,
    categories,
    orders,
    openOrders,
  });
}
