import { NextResponse } from "next/server";
import { clean, getSessionUser, isEmail } from "@/lib/auth";
import { productBySlug } from "@/lib/catalog";
import { readJson, updateJson } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { site } from "@/lib/site";

type OrderItem = { slug: string; name: string; qty: number; price: number };
type Order = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  createdAt: string;
};

const methods = new Set(["PayFast", "Instant EFT", "Trade account", "Pay on collection"]);

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ orders: [] });
  const orders = await readJson<Order[]>("orders.json", []);
  return NextResponse.json({
    orders: orders.filter((order) => order.userId === user.id || order.email === user.email).reverse(),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || clean(body.company)) {
    return NextResponse.json({ ok: false, message: "We could not read that order." }, { status: 400 });
  }

  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 30);
  const address = clean(body.address, 180);
  const city = clean(body.city, 80);
  const paymentMethod = clean(body.paymentMethod, 40);

  if (!name || !isEmail(email) || phone.replace(/\D/g, "").length < 10 || !address || !city || !methods.has(paymentMethod)) {
    return NextResponse.json({ ok: false, message: "Add a name, email, cellphone, address, city, and payment method." }, { status: 400 });
  }

  const requested = Array.isArray(body.items) ? body.items : [];
  const items: OrderItem[] = [];
  for (const item of requested) {
    const product = productBySlug(clean(item?.slug, 80));
    const qty = Math.min(99, Math.max(0, Math.floor(Number(item?.qty) || 0)));
    if (!product || !product.inStock || qty < 1) continue;
    items.push({ slug: product.slug, name: product.name, qty, price: product.price });
  }
  if (!items.length) {
    return NextResponse.json({ ok: false, message: "Those items are not available to order." }, { status: 400 });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal >= site.freeDelivery ? 0 : site.deliveryFee;
  const user = await getSessionUser();
  const order: Order = {
    id: `IS${Date.now().toString().slice(-8)}`,
    userId: user?.id ?? null,
    name,
    email,
    phone,
    address,
    city,
    paymentMethod,
    items,
    subtotal,
    delivery,
    total: subtotal + delivery,
    createdAt: new Date().toISOString(),
  };

  await updateJson<Order[]>("orders.json", [], (current) => [...current, order]);

  const lines = items.map((item) => `${item.qty} x ${item.name} @ R${item.price}`).join("\n");
  try {
    await sendMail({
      subject: `Order ${order.id} from ${name}`,
      replyTo: email,
      text: `${name}\n${email}\n${phone}\n${address}, ${city}\n${paymentMethod}\n\n${lines}\n\nSubtotal R${subtotal}\nDelivery R${delivery}\nTotal R${order.total}`,
    });
    await sendMail({
      to: email,
      subject: `We received order ${order.id}`,
      text: `Hi ${name},\n\nWe received order ${order.id} for R${order.total.toFixed(2)}. Payment method: ${paymentMethod}. We will confirm stock and the next step by email.\n`,
    });
  } catch (error) {
    console.error("Order email failed", error);
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    message: `Order ${order.id} is placed. We will confirm it by email.`,
  });
}
