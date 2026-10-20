import assert from "node:assert/strict";
import test from "node:test";
import { buildOverview, percent, resolveRange, shouldAbandon, type MetricCheckout, type MetricEvent } from "../lib/analytics-metrics";

const now = new Date("2026-10-20T12:00:00.000Z");

function event(type: string, sessionId: string, extra: Partial<MetricEvent> = {}): MetricEvent {
  return { type, sessionId, createdAt: now.toISOString(), ...extra };
}

test("rates use unique sessions and page visits stay raw", () => {
  const events = [
    event("landing", "a"),
    event("landing", "a"),
    event("product_view", "a", { productSlug: "panel" }),
    event("product_view", "b", { productSlug: "panel" }),
    event("product_view", "b", { productSlug: "cable" }),
    event("add_to_cart", "a", { productSlug: "panel" }),
    event("add_to_cart", "a", { productSlug: "panel" }),
    event("checkout_start", "a"),
    event("order_complete", "a"),
    event("add_to_cart", "c", { productSlug: "cable" }),
  ];
  const checkouts: MetricCheckout[] = [
    {
      id: "1",
      status: "abandoned",
      lastStep: "cart",
      sessionId: "c",
      reachedAuth: false,
      returnedAfterAuth: false,
      abandonedAt: now.toISOString(),
      items: [{ slug: "cable", qty: 1 }],
    },
  ];
  const overview = buildOverview(events, checkouts, new Map([["panel", "Solar panel"], ["cable", "Cable"]]));
  assert.equal(overview.visitors.unique, 3);
  assert.equal(overview.visitors.total, 5);
  assert.equal(overview.productViews.events, 3);
  assert.equal(overview.productViews.sessions, 2);
  assert.equal(overview.addToCart.events, 3);
  assert.equal(overview.addToCart.sessions, 2);
  assert.equal(overview.rates.cartToCheckout, percent(1, 2));
  assert.equal(overview.rates.checkoutCompletion, 100);
  assert.equal(overview.rates.visitorToOrder, percent(1, 3));
  assert.equal(overview.mostViewed[0].name, "Solar panel");
  assert.equal(overview.mostViewed[0].events, 2);
  assert.equal(overview.mostViewed[0].sessions, 2);
  assert.equal(overview.abandonedCarts, 1);
  assert.equal(overview.abandonedCheckouts, 0);
  assert.equal(overview.rates.cartToCheckout, 50);
});

test("abandonment stages stay distinct and a completed order is left out", () => {
  const checkouts: MetricCheckout[] = [
    { id: "1", status: "abandoned", lastStep: "checkout", sessionId: "a", reachedAuth: false, returnedAfterAuth: false, items: [{ slug: "panel", qty: 1 }] },
    { id: "2", status: "abandoned", lastStep: "auth", sessionId: "b", reachedAuth: true, returnedAfterAuth: false, items: [{ slug: "panel", qty: 1 }] },
    { id: "3", status: "abandoned", lastStep: "checkout", sessionId: "c", reachedAuth: true, returnedAfterAuth: true, items: [{ slug: "panel", qty: 1 }] },
    { id: "4", status: "completed", lastStep: "order", sessionId: "d", reachedAuth: true, returnedAfterAuth: true, abandonedAt: now.toISOString(), items: [{ slug: "panel", qty: 1 }] },
  ];
  const overview = buildOverview([], checkouts, new Map());
  assert.deepEqual(
    overview.stages.map((stage) => stage.count),
    [0, 1, 1, 1],
  );
  assert.equal(overview.abandonedCarts + overview.abandonedCheckouts, 3);
});

test("idle threshold does not abandon an active or empty checkout", () => {
  const active = { status: "checkout", items: [{ slug: "panel" }], lastActivityAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString() };
  const idle = { status: "checkout", items: [{ slug: "panel" }], lastActivityAt: new Date(now.getTime() - 61 * 60 * 1000).toISOString() };
  const empty = { status: "cart", items: [], lastActivityAt: new Date(now.getTime() - 120 * 60 * 1000).toISOString() };
  const done = { status: "completed", items: [{ slug: "panel" }], lastActivityAt: new Date(now.getTime() - 120 * 60 * 1000).toISOString() };
  assert.equal(shouldAbandon(active, now.getTime(), 60), false);
  assert.equal(shouldAbandon(idle, now.getTime(), 60), true);
  assert.equal(shouldAbandon(empty, now.getTime(), 60), false);
  assert.equal(shouldAbandon(done, now.getTime(), 60), false);
});

test("custom dates use South African day bounds and swap backwards ranges", () => {
  const range = resolveRange({ preset: "custom", from: "2026-10-20", to: "2026-10-18", now });
  assert.equal(range.from.toISOString(), "2026-10-17T22:00:00.000Z");
  assert.equal(range.to.toISOString(), "2026-10-20T21:59:59.999Z");
  const today = resolveRange({ preset: "today", now: new Date("2026-10-19T22:30:00.000Z") });
  assert.equal(today.from.toISOString(), "2026-10-19T22:00:00.000Z");
});
