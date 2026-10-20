export type MetricEvent = {
  type: string;
  sessionId: string;
  productSlug?: string;
  referrer?: string;
  campaign?: string;
  createdAt: string;
};

export type MetricCheckout = {
  id: string;
  status: string;
  lastStep: string;
  sessionId: string;
  reachedAuth: boolean;
  returnedAfterAuth: boolean;
  abandonedAt?: string;
  items: { slug: string; qty: number }[];
};

export type RangeInput = { preset?: string; from?: string; to?: string; now?: Date };

const DAY = 24 * 60 * 60 * 1000;

export function resolveRange(input: RangeInput) {
  const now = input.now ?? new Date();
  const preset = input.preset || "7";
  if (preset === "custom") {
    const from = parseDay(input.from, false);
    const to = parseDay(input.to, true);
    if (from && to) {
      return from <= to
        ? { from, to, preset: "custom" }
        : { from: parseDay(input.to, false)!, to: parseDay(input.from, true)!, preset: "custom" };
    }
  }
  if (preset === "today") {
    const shifted = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const day = shifted.toISOString().slice(0, 10);
    return { from: new Date(`${day}T00:00:00+02:00`), to: now, preset: "today" };
  }
  const days = preset === "30" ? 30 : 7;
  return { from: new Date(now.getTime() - days * DAY), to: now, preset: String(days) };
}

function parseDay(value: string | undefined, end: boolean) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T${end ? "23:59:59.999" : "00:00:00"}+02:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function percent(part: number, whole: number) {
  if (whole <= 0) return null;
  return Math.round((part / whole) * 1000) / 10;
}

function sessions(events: MetricEvent[], type: string) {
  return new Set(events.filter((event) => event.type === type && event.sessionId).map((event) => event.sessionId));
}

function sourceOf(event: MetricEvent) {
  if (event.campaign) return event.campaign;
  if (!event.referrer) return "Direct";
  try {
    return new URL(event.referrer).host || "Direct";
  } catch {
    return "Direct";
  }
}

export function buildOverview(events: MetricEvent[], checkouts: MetricCheckout[], names: Map<string, string>) {
  const pageTypes = new Set(["landing", "product_view", "category_view", "search", "cart_view"]);
  const visitors = new Set(events.map((event) => event.sessionId).filter(Boolean));
  const productSessions = sessions(events, "product_view");
  const cartSessions = sessions(events, "add_to_cart");
  const checkoutSessions = sessions(events, "checkout_start");
  const orderSessions = sessions(events, "order_complete");
  const viewed = countProducts(events, "product_view", names);
  const added = countProducts(events, "add_to_cart", names);
  const abandoned = checkouts.filter((checkout) => checkout.items.length > 0 && (checkout.status === "abandoned" || checkout.abandonedAt));
  const stages = [
    { id: "cart", label: "Added to cart, checkout not opened", count: 0 },
    { id: "checkout", label: "Checkout opened, then left", count: 0 },
    { id: "auth", label: "Sent to sign in and did not return", count: 0 },
    { id: "returned", label: "Returned to checkout and did not order", count: 0 },
  ];
  for (const checkout of abandoned) {
    if (checkout.status === "completed") continue;
    if (checkout.returnedAfterAuth) stages[3].count += 1;
    else if (checkout.reachedAuth || checkout.lastStep === "auth") stages[2].count += 1;
    else if (checkout.lastStep === "checkout" || checkout.status === "checkout") stages[1].count += 1;
    else stages[0].count += 1;
  }
  const sources = new Map<string, { sessions: Set<string>; orders: Set<string> }>();
  for (const event of events) {
    if (!event.sessionId) continue;
    const key = sourceOf(event);
    const row = sources.get(key) ?? { sessions: new Set<string>(), orders: new Set<string>() };
    row.sessions.add(event.sessionId);
    if (event.type === "order_complete") row.orders.add(event.sessionId);
    sources.set(key, row);
  }

  return {
    visitors: {
      total: events.filter((event) => pageTypes.has(event.type)).length,
      unique: visitors.size,
    },
    productViews: { events: events.filter((event) => event.type === "product_view").length, sessions: productSessions.size },
    addToCart: { events: events.filter((event) => event.type === "add_to_cart").length, sessions: cartSessions.size },
    checkoutStarts: { events: events.filter((event) => event.type === "checkout_start").length, sessions: checkoutSessions.size },
    orders: { events: events.filter((event) => event.type === "order_complete").length, sessions: orderSessions.size },
    abandonedCarts: stages[0].count,
    abandonedCheckouts: stages[1].count + stages[2].count + stages[3].count,
    rates: {
      cartToCheckout: percent(checkoutSessions.size, cartSessions.size),
      checkoutCompletion: percent(orderSessions.size, checkoutSessions.size),
      visitorToOrder: percent(orderSessions.size, visitors.size),
    },
    mostViewed: viewed,
    mostAdded: added,
    stages,
    sources: [...sources.entries()]
      .map(([source, row]) => ({ source, sessions: row.sessions.size, orders: row.orders.size }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 8),
    funnel: [
      { id: "visitors", label: "Unique visitors", count: visitors.size },
      { id: "products", label: "Viewed a product", count: productSessions.size },
      { id: "cart", label: "Added to cart", count: cartSessions.size },
      { id: "checkout", label: "Started checkout", count: checkoutSessions.size },
      { id: "auth", label: "Sent to sign in", count: checkouts.filter((checkout) => checkout.reachedAuth).length },
      { id: "returned", label: "Returned to checkout", count: checkouts.filter((checkout) => checkout.returnedAfterAuth).length },
      { id: "ordered", label: "Completed an order", count: orderSessions.size },
    ],
    definitions: {
      totalVisitors: "Raw count of landing, product, category, search, and cart page events.",
      uniqueVisitors: "Distinct first-party browser sessions with any event in the range.",
      cartToCheckout: "Unique sessions that started checkout, divided by unique sessions that added a product.",
      checkoutCompletion: "Unique sessions that completed an order, divided by unique sessions that started checkout.",
      visitorToOrder: "Unique sessions that completed an order, divided by unique visitors.",
      abandoned: "Open checkouts with items that passed the idle threshold. A later order is removed from this count.",
    },
  };
}

function countProducts(events: MetricEvent[], type: string, names: Map<string, string>) {
  const rows = new Map<string, { events: number; sessions: Set<string> }>();
  for (const event of events) {
    if (event.type !== type || !event.productSlug) continue;
    const row = rows.get(event.productSlug) ?? { events: 0, sessions: new Set<string>() };
    row.events += 1;
    if (event.sessionId) row.sessions.add(event.sessionId);
    rows.set(event.productSlug, row);
  }
  return [...rows.entries()]
    .map(([slug, row]) => ({ slug, name: names.get(slug) || slug, events: row.events, sessions: row.sessions.size }))
    .sort((a, b) => b.events - a.events || b.sessions - a.sessions)
    .slice(0, 8);
}

export function shouldAbandon(checkout: { status: string; items: unknown[]; lastActivityAt: string }, now: number, minutes: number) {
  if (!checkout.items.length) return false;
  if (checkout.status === "completed" || checkout.status === "abandoned") return false;
  const idle = now - new Date(checkout.lastActivityAt).getTime();
  return idle >= minutes * 60 * 1000;
}
