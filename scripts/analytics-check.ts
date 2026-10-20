import { readFileSync } from "fs";
import { CheckoutModel, EventModel } from "@/lib/models";
import { completeCheckout, forgetVisitor, getCheckout, listCheckouts, recordEvent, sweepAbandoned } from "@/lib/analytics";

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const index = line.indexOf("=");
  if (index < 1 || line.startsWith("#")) continue;
  const key = line.slice(0, index).trim();
  if (!process.env[key]) process.env[key] = line.slice(index + 1).trim();
}

async function main() {
  const sessionId = crypto.randomUUID();
  const items = [{ slug: "solar-panel", qty: 1 }];
  try {
    await recordEvent({ type: "landing", sessionId, path: "/" });
    await recordEvent({ type: "product_view", sessionId, path: "/product/test", productSlug: "solar-panel" });
    await recordEvent({ type: "add_to_cart", sessionId, path: "/product/test", productSlug: "solar-panel", qty: 1, items });
    await recordEvent({ type: "checkout_start", sessionId, path: "/cart", items });
    await recordEvent({ type: "cart_view", sessionId, path: "/login", items });
    const { recordProgress } = await import("@/lib/analytics");
    await recordProgress(sessionId, undefined, "auth", items);

    const idle = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const updated = await CheckoutModel.updateOne({ sessionId, status: { $ne: "completed" } }, { $set: { lastActivityAt: idle, abandonNoted: false } });
    if (updated.matchedCount !== 1) throw new Error(`checkout not stored (${updated.matchedCount})`);
    await sweepAbandoned();

    const abandoned = await listCheckouts({ preset: "7", status: "abandoned_open" });
    const row = abandoned.checkouts.find((checkout) => checkout.visitor === sessionId.slice(0, 8));
    if (!row) throw new Error("idle checkout was not marked abandoned");
    if (row.lastStep !== "auth") throw new Error(`expected auth step, got ${row.lastStep}`);

    await completeCheckout(sessionId, undefined, "ISTEST01");
    const detail = await getCheckout(row.id);
    if (!detail?.completed || detail.completedOrderNumber !== "ISTEST01") throw new Error("completed checkout still looks abandoned");
    const still = await listCheckouts({ preset: "7", status: "abandoned_open" });
    if (still.checkouts.some((checkout) => checkout.id === row.id)) throw new Error("completed checkout remains in the abandoned list");

    const events = await EventModel.countDocuments({ sessionId });
    if (events < 5) throw new Error(`expected several events, got ${events}`);
    console.log("PASS events=" + events + " abandoned-step=" + row.lastStep);
  } finally {
    await forgetVisitor(sessionId, undefined);
    const left = await EventModel.countDocuments({ sessionId });
    const carts = await CheckoutModel.countDocuments({ sessionId });
    if (left || carts) console.log("CLEANUP_LEFT events=" + left + " checkouts=" + carts);
    else console.log("CLEAN");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    const message = String(error?.message ?? error).replace(/mongodb(\+srv)?:\/\/[^@\s]+@/g, "mongodb://***@");
    console.log("FAILED", message.slice(0, 400));
    process.exit(1);
  });
