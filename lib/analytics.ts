import { readJson, updateJson } from "@/lib/db";
import { databaseReady } from "@/lib/database";
import { buildOverview, resolveRange, type MetricCheckout, type MetricEvent, type RangeInput } from "@/lib/analytics-metrics";
import { readCatalog } from "@/lib/catalog-store";
import { CheckoutModel, EventModel } from "@/lib/models";
import { findUserById } from "@/lib/users";

export const EVENT_TYPES = [
  "landing",
  "product_view",
  "category_view",
  "search",
  "add_to_cart",
  "remove_from_cart",
  "cart_qty",
  "cart_view",
  "checkout_start",
  "register_start",
  "register_complete",
  "login_complete",
  "checkout_abandoned",
  "order_complete",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
export type CheckoutStatus = "cart" | "checkout" | "auth" | "completed" | "abandoned";
export type CheckoutStep = "cart" | "checkout" | "auth";

type Item = { slug: string; qty: number };

type StoredEvent = MetricEvent & {
  id: string;
  userId?: string;
  path?: string;
  categorySlug?: string;
  orderNumber?: string;
  query?: string;
  step?: string;
  qty?: number;
  checkoutId?: string;
};

type StoredCheckout = {
  id: string;
  sessionId: string;
  userId?: string;
  status: CheckoutStatus;
  items: Item[];
  lastStep: string;
  lastActivityAt: string;
  startedAt: string;
  abandonedAt?: string;
  abandonNoted: boolean;
  reachedAuth: boolean;
  returnedAfterAuth: boolean;
  completedOrderNumber?: string;
  createdAt: string;
  updatedAt: string;
};

export type IncomingEvent = {
  type: EventType;
  sessionId: string;
  userId?: string;
  path?: string;
  productSlug?: string;
  categorySlug?: string;
  orderNumber?: string;
  referrer?: string;
  campaign?: string;
  query?: string;
  step?: string;
  qty?: number;
  items?: Item[];
};

const hits = new Map<string, { count: number; reset: number }>();
let prunedAt = 0;

export function abandonMinutes() {
  const value = Number(process.env.CHECKOUT_ABANDON_MINUTES || 60);
  if (!Number.isFinite(value)) return 60;
  return Math.min(10080, Math.max(1, Math.round(value)));
}

export function retentionDays() {
  const value = Number(process.env.ANALYTICS_RETENTION_DAYS || 180);
  if (!Number.isFinite(value)) return 180;
  return Math.min(3650, Math.max(7, Math.round(value)));
}

export function allowEvent(sessionId: string) {
  const now = Date.now();
  const row = hits.get(sessionId);
  if (!row || row.reset < now) {
    if (hits.size > 5000) hits.clear();
    hits.set(sessionId, { count: 1, reset: now + 60_000 });
    return true;
  }
  row.count += 1;
  return row.count <= 80;
}

export function cleanItems(value: unknown): Item[] {
  if (!Array.isArray(value)) return [];
  const items: Item[] = [];
  for (const entry of value.slice(0, 30)) {
    const slug = String(entry?.slug ?? "").trim().toLowerCase();
    const qty = Math.min(99, Math.max(0, Math.floor(Number(entry?.qty) || 0)));
    if (!/^[a-z0-9-]{1,80}$/.test(slug) || qty < 1) continue;
    const existing = items.find((item) => item.slug === slug);
    if (existing) existing.qty = Math.min(99, existing.qty + qty);
    else items.push({ slug, qty });
  }
  return items;
}

export function cleanCampaign(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const source = cleanToken((value as { source?: unknown }).source);
  const medium = cleanToken((value as { medium?: unknown }).medium);
  const name = cleanToken((value as { name?: unknown }).name);
  return [source, medium, name].filter(Boolean).join(" / ").slice(0, 120);
}

function cleanToken(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/[^\w .\-]/g, "")
    .slice(0, 40);
}

export function cleanQuery(value: unknown) {
  const text = String(value ?? "").trim().slice(0, 80);
  if (!text) return "";
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(text)) return "";
  if (/\d(?:[ -]?\d){12,}/.test(text)) return "";
  return text;
}

export function cleanReferrer(value: unknown) {
  const text = String(value ?? "").trim();
  if (!/^https?:\/\//i.test(text)) return "";
  try {
    const url = new URL(text);
    return `${url.origin}${url.pathname}`.slice(0, 180);
  } catch {
    return "";
  }
}

export function cleanPath(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text.startsWith("/") || text.startsWith("//")) return "";
  return text.slice(0, 180);
}

function iso(value: Date | string | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function fromEvent(doc: Record<string, unknown>): StoredEvent {
  return {
    id: String(doc._id || doc.id),
    type: String(doc.type || ""),
    sessionId: String(doc.sessionId || ""),
    userId: doc.userId ? String(doc.userId) : undefined,
    path: doc.path ? String(doc.path) : undefined,
    productSlug: doc.productSlug ? String(doc.productSlug) : undefined,
    categorySlug: doc.categorySlug ? String(doc.categorySlug) : undefined,
    orderNumber: doc.orderNumber ? String(doc.orderNumber) : undefined,
    referrer: doc.referrer ? String(doc.referrer) : undefined,
    campaign: doc.campaign ? String(doc.campaign) : undefined,
    query: doc.query ? String(doc.query) : undefined,
    step: doc.step ? String(doc.step) : undefined,
    qty: typeof doc.qty === "number" ? doc.qty : undefined,
    checkoutId: doc.checkoutId ? String(doc.checkoutId) : undefined,
    createdAt: iso(doc.createdAt as Date | string) || new Date().toISOString(),
  };
}

function fromCheckout(doc: Record<string, unknown>): StoredCheckout {
  const items = cleanItems(doc.items);
  return {
    id: String(doc._id || doc.id),
    sessionId: String(doc.sessionId || ""),
    userId: doc.userId ? String(doc.userId) : undefined,
    status: (doc.status as CheckoutStatus) || "cart",
    items,
    lastStep: String(doc.lastStep || "cart"),
    lastActivityAt: iso(doc.lastActivityAt as Date | string) || iso(doc.updatedAt as Date | string) || new Date().toISOString(),
    startedAt: iso(doc.startedAt as Date | string) || iso(doc.createdAt as Date | string) || new Date().toISOString(),
    abandonedAt: iso(doc.abandonedAt as Date | string),
    abandonNoted: Boolean(doc.abandonNoted),
    reachedAuth: Boolean(doc.reachedAuth),
    returnedAfterAuth: Boolean(doc.returnedAfterAuth),
    completedOrderNumber: doc.completedOrderNumber ? String(doc.completedOrderNumber) : undefined,
    createdAt: iso(doc.createdAt as Date | string) || new Date().toISOString(),
    updatedAt: iso(doc.updatedAt as Date | string) || new Date().toISOString(),
  };
}

async function useMongo() {
  return databaseReady();
}

async function prune() {
  if (Date.now() - prunedAt < 10 * 60 * 1000) return;
  prunedAt = Date.now();
  const cutoff = new Date(Date.now() - retentionDays() * 24 * 60 * 60 * 1000);
  if (await useMongo()) {
    await EventModel.deleteMany({ createdAt: { $lt: cutoff } });
    await CheckoutModel.deleteMany({ updatedAt: { $lt: cutoff }, status: { $in: ["completed", "abandoned"] } });
    return;
  }
  await updateJson<StoredEvent[]>("events.json", [], (current) => current.filter((event) => new Date(event.createdAt) >= cutoff));
  await updateJson<StoredCheckout[]>("checkouts.json", [], (current) =>
    current.filter((checkout) => checkout.status === "cart" || checkout.status === "checkout" || checkout.status === "auth" || new Date(checkout.updatedAt) >= cutoff),
  );
}

export async function sweepAbandoned() {
  const minutes = abandonMinutes();
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  if (await useMongo()) {
    const stale = await CheckoutModel.find({
      status: { $in: ["cart", "checkout", "auth"] },
      "items.0": { $exists: true },
      lastActivityAt: { $lt: cutoff },
      abandonNoted: { $ne: true },
    }).limit(200);
    for (const doc of stale) {
      const when = new Date(new Date(doc.lastActivityAt).getTime() + minutes * 60 * 1000);
      const already = await EventModel.exists({ type: "checkout_abandoned", checkoutId: doc._id });
      if (!already) {
        await EventModel.create({
          type: "checkout_abandoned",
          sessionId: doc.sessionId,
          userId: doc.userId,
          path: "/cart",
          step: doc.lastStep,
          checkoutId: doc._id,
          createdAt: when,
        });
      }
      doc.status = "abandoned";
      doc.abandonedAt = doc.abandonedAt || when;
      doc.abandonNoted = true;
      await doc.save();
    }
    return;
  }
  await updateJson<StoredCheckout[]>("checkouts.json", [], (current) =>
    current.map((checkout) => {
      if (checkout.abandonNoted || !checkout.items.length) return checkout;
      if (checkout.status === "completed" || checkout.status === "abandoned") return checkout;
      if (new Date(checkout.lastActivityAt) >= cutoff) return checkout;
      return {
        ...checkout,
        status: "abandoned" as const,
        abandonedAt: new Date(new Date(checkout.lastActivityAt).getTime() + minutes * 60 * 1000).toISOString(),
        abandonNoted: true,
        updatedAt: new Date().toISOString(),
      };
    }),
  );
  const checkouts = await readJson<StoredCheckout[]>("checkouts.json", []);
  const noted = new Set(
    (await readJson<StoredEvent[]>("events.json", []))
      .filter((event) => event.type === "checkout_abandoned" && event.checkoutId)
      .map((event) => event.checkoutId as string),
  );
  for (const checkout of checkouts) {
    if (checkout.status !== "abandoned" || !checkout.abandonNoted || noted.has(checkout.id)) continue;
    noted.add(checkout.id);
    await insertEvent({
      id: crypto.randomUUID(),
      type: "checkout_abandoned",
      sessionId: checkout.sessionId,
      userId: checkout.userId,
      path: "/cart",
      step: checkout.lastStep,
      checkoutId: checkout.id,
      createdAt: checkout.abandonedAt || new Date().toISOString(),
    });
  }
}

async function insertEvent(event: StoredEvent) {
  if (await useMongo()) {
    if (event.type === "order_complete" && event.orderNumber) {
      const existing = await EventModel.exists({ type: "order_complete", orderNumber: event.orderNumber });
      if (existing) return;
    }
    await EventModel.create({ ...event, _id: event.id, createdAt: new Date(event.createdAt) });
    return;
  }
  await updateJson<StoredEvent[]>("events.json", [], (current) => {
    if (event.type === "order_complete" && event.orderNumber && current.some((row) => row.type === "order_complete" && row.orderNumber === event.orderNumber)) {
      return current;
    }
    return [...current, event];
  });
}

async function findOpen(sessionId: string) {
  if (await useMongo()) {
    const doc = await CheckoutModel.findOne({ sessionId, status: { $ne: "completed" } }).sort({ updatedAt: -1 }).lean<Record<string, unknown>>();
    return doc ? fromCheckout(doc) : null;
  }
  const rows = await readJson<StoredCheckout[]>("checkouts.json", []);
  return rows.filter((row) => row.sessionId === sessionId && row.status !== "completed").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
}

async function saveCheckout(checkout: StoredCheckout) {
  const next = { ...checkout, updatedAt: new Date().toISOString() };
  if (await useMongo()) {
    await CheckoutModel.findOneAndUpdate(
      { _id: next.id },
      {
        $set: {
          sessionId: next.sessionId,
          userId: next.userId,
          status: next.status,
          items: next.items,
          lastStep: next.lastStep,
          lastActivityAt: new Date(next.lastActivityAt),
          startedAt: new Date(next.startedAt),
          abandonedAt: next.abandonedAt ? new Date(next.abandonedAt) : undefined,
          abandonNoted: next.abandonNoted,
          reachedAuth: next.reachedAuth,
          returnedAfterAuth: next.returnedAfterAuth,
          completedOrderNumber: next.completedOrderNumber,
        },
        $setOnInsert: { _id: next.id },
      },
      { upsert: true },
    );
    return;
  }
  await updateJson<StoredCheckout[]>("checkouts.json", [], (current) => {
    const index = current.findIndex((row) => row.id === next.id);
    if (index < 0) return [...current, next];
    const copy = current.slice();
    copy[index] = next;
    return copy;
  });
}

export async function syncCheckout(sessionId: string, userId: string | undefined, step: CheckoutStep, items?: Item[]) {
  const existing = await findOpen(sessionId);
  const nextItems = items ?? existing?.items ?? [];
  if (!existing && nextItems.length === 0) return;
  const now = new Date().toISOString();
  const base: StoredCheckout = existing ?? {
    id: crypto.randomUUID(),
    sessionId,
    userId,
    status: "cart",
    items: [],
    lastStep: "cart",
    lastActivityAt: now,
    startedAt: now,
    abandonNoted: false,
    reachedAuth: false,
    returnedAfterAuth: false,
    createdAt: now,
    updatedAt: now,
  };
  let status: CheckoutStatus = base.status === "completed" ? "cart" : base.status;
  let lastStep = base.lastStep;
  let reachedAuth = base.reachedAuth;
  let returnedAfterAuth = base.returnedAfterAuth;
  if (step === "auth" && nextItems.length > 0) {
    status = "auth";
    lastStep = "auth";
    reachedAuth = true;
  } else if (step === "checkout" && nextItems.length > 0) {
    status = "checkout";
    lastStep = "checkout";
    if (reachedAuth) returnedAfterAuth = true;
  } else if (!existing || existing.status === "abandoned" || existing.status === "cart") {
    status = nextItems.length > 0 ? "cart" : existing?.status === "abandoned" ? "abandoned" : "cart";
    lastStep = "cart";
  }
  if (status === "abandoned") status = step === "checkout" ? "checkout" : "cart";
  await saveCheckout({
    ...base,
    userId: userId || base.userId,
    status,
    items: nextItems,
    lastStep,
    lastActivityAt: now,
    reachedAuth,
    returnedAfterAuth,
    abandonNoted: false,
  });
}

export async function recordEvent(input: IncomingEvent) {
  try {
    await prune();
    const event: StoredEvent = {
      id: crypto.randomUUID(),
      type: input.type,
      sessionId: input.sessionId,
      userId: input.userId,
      path: input.path,
      productSlug: input.productSlug,
      categorySlug: input.categorySlug,
      orderNumber: input.orderNumber,
      referrer: input.referrer,
      campaign: input.campaign,
      query: input.query,
      step: input.step,
      qty: input.qty,
      createdAt: new Date().toISOString(),
    };
    await insertEvent(event);
    const items = input.items ? cleanItems(input.items) : undefined;
    if (input.type === "add_to_cart" || input.type === "remove_from_cart" || input.type === "cart_qty") {
      await syncCheckout(input.sessionId, input.userId, "cart", items);
    }
    if (input.type === "cart_view" && items && items.length) await syncCheckout(input.sessionId, input.userId, "cart", items);
    if (input.type === "checkout_start") await syncCheckout(input.sessionId, input.userId, "checkout", items && items.length ? items : undefined);
    if (input.type === "add_to_cart" || input.type === "checkout_start" || input.type === "cart_qty" || input.type === "remove_from_cart") {
      await sweepAbandoned();
    }
  } catch (error) {
    console.error("Analytics event failed", input.type, error instanceof Error ? error.message : "");
  }
}

export async function recordProgress(sessionId: string, userId: string | undefined, step: CheckoutStep, items?: Item[]) {
  try {
    await syncCheckout(sessionId, userId, step, items ? cleanItems(items) : undefined);
  } catch (error) {
    console.error("Analytics progress failed", error instanceof Error ? error.message : "");
  }
}

export async function completeCheckout(sessionId: string | undefined, userId: string | undefined, orderNumber: string) {
  try {
    const finish = async (checkout: StoredCheckout | null) => {
      if (!checkout) return;
      await saveCheckout({
        ...checkout,
        userId: userId || checkout.userId,
        status: "completed",
        lastStep: "order",
        lastActivityAt: new Date().toISOString(),
        completedOrderNumber: orderNumber,
      });
    };
    if (sessionId) await finish(await findOpen(sessionId));
    if (userId) {
      if (await useMongo()) {
        const docs = await CheckoutModel.find({ userId, status: { $ne: "completed" } }).lean<Record<string, unknown>[]>();
        for (const doc of docs) await finish(fromCheckout(doc));
      } else {
        const rows = await readJson<StoredCheckout[]>("checkouts.json", []);
        for (const row of rows) {
          if (row.userId === userId && row.status !== "completed") await finish(row);
        }
      }
    }
  } catch (error) {
    console.error("Checkout completion failed", error instanceof Error ? error.message : "");
  }
}

export async function attachSession(sessionId: string | undefined, userId: string) {
  if (!sessionId) return;
  try {
    if (await useMongo()) {
      await EventModel.updateMany({ sessionId, $or: [{ userId: "" }, { userId: null }, { userId: { $exists: false } }] }, { $set: { userId } });
      await CheckoutModel.updateMany({ sessionId }, { $set: { userId } });
      return;
    }
    await updateJson<StoredEvent[]>("events.json", [], (current) => current.map((event) => (event.sessionId === sessionId && !event.userId ? { ...event, userId } : event)));
    await updateJson<StoredCheckout[]>("checkouts.json", [], (current) =>
      current.map((checkout) => (checkout.sessionId === sessionId ? { ...checkout, userId } : checkout)),
    );
  } catch (error) {
    console.error("Session attach failed", error instanceof Error ? error.message : "");
  }
}

export async function forgetVisitor(sessionId: string | undefined, userId: string | undefined) {
  const session = sessionId || "";
  const user = userId || "";
  if (!session && !user) return;
  if (await useMongo()) {
    await EventModel.deleteMany({ $or: [...(session ? [{ sessionId: session }] : []), ...(user ? [{ userId: user }] : [])] });
    await CheckoutModel.deleteMany({ $or: [...(session ? [{ sessionId: session }] : []), ...(user ? [{ userId: user }] : [])] });
    return;
  }
  await updateJson<StoredEvent[]>("events.json", [], (current) => current.filter((event) => event.sessionId !== session && event.userId !== user));
  await updateJson<StoredCheckout[]>("checkouts.json", [], (current) => current.filter((checkout) => checkout.sessionId !== session && checkout.userId !== user));
}

async function eventsInRange(from: Date, to: Date) {
  if (await useMongo()) {
    const docs = await EventModel.find({ createdAt: { $gte: from, $lte: to } }).sort({ createdAt: -1 }).limit(20000).lean<Record<string, unknown>[]>();
    return docs.map(fromEvent);
  }
  const rows = await readJson<StoredEvent[]>("events.json", []);
  return rows.filter((event) => {
    const time = new Date(event.createdAt).getTime();
    return time >= from.getTime() && time <= to.getTime();
  });
}

async function checkoutsInRange(from: Date, to: Date) {
  if (await useMongo()) {
    const docs = await CheckoutModel.find({
      $or: [
        { lastActivityAt: { $gte: from, $lte: to } },
        { createdAt: { $gte: from, $lte: to } },
        { abandonedAt: { $gte: from, $lte: to } },
      ],
    })
      .limit(5000)
      .lean<Record<string, unknown>[]>();
    return docs.map(fromCheckout);
  }
  const rows = await readJson<StoredCheckout[]>("checkouts.json", []);
  return rows.filter((checkout) => {
    const times = [checkout.lastActivityAt, checkout.createdAt, checkout.abandonedAt].filter(Boolean) as string[];
    return times.some((value) => {
      const time = new Date(value).getTime();
      return time >= from.getTime() && time <= to.getTime();
    });
  });
}

async function namesFor(slugs: string[]) {
  const { products } = await readCatalog(true);
  const names = new Map<string, string>();
  for (const product of products) names.set(product.slug, product.name);
  for (const slug of slugs) if (!names.has(slug)) names.set(slug, slug);
  return names;
}

export async function getOverview(input: RangeInput) {
  await sweepAbandoned();
  const range = resolveRange(input);
  const [events, checkouts] = await Promise.all([eventsInRange(range.from, range.to), checkoutsInRange(range.from, range.to)]);
  const names = await namesFor(events.map((event) => event.productSlug || ""));
  return {
    range: { from: range.from.toISOString(), to: range.to.toISOString(), preset: range.preset },
    thresholdMinutes: abandonMinutes(),
    retentionDays: retentionDays(),
    ...buildOverview(events, checkouts as MetricCheckout[], names),
  };
}

export async function getFunnel(input: RangeInput) {
  const overview = await getOverview(input);
  return { range: overview.range, funnel: overview.funnel, rates: overview.rates, definitions: overview.definitions };
}

export async function getEvents(input: RangeInput & { type?: string; page?: number }) {
  const range = resolveRange(input);
  let events = await eventsInRange(range.from, range.to);
  if (input.type && EVENT_TYPES.includes(input.type as EventType)) events = events.filter((event) => event.type === input.type);
  const page = Math.max(1, input.page || 1);
  const start = (page - 1) * 40;
  return {
    range: { from: range.from.toISOString(), to: range.to.toISOString(), preset: range.preset },
    page,
    pages: Math.max(1, Math.ceil(events.length / 40)),
    events: events.slice(start, start + 40).map((event) => ({
      id: event.id,
      type: event.type,
      at: event.createdAt,
      path: event.path || "",
      productSlug: event.productSlug || "",
      categorySlug: event.categorySlug || "",
      orderNumber: event.orderNumber || "",
      query: event.query || "",
      campaign: event.campaign || "",
      referrer: event.referrer || "",
      visitor: event.sessionId.slice(0, 8),
      signedIn: Boolean(event.userId),
    })),
  };
}

function matchesStatus(checkout: StoredCheckout, status: string) {
  if (status === "all") return true;
  if (status === "incomplete") return checkout.status !== "completed";
  if (status === "completed_after") return Boolean(checkout.abandonedAt) && checkout.status === "completed";
  if (status === "abandoned_open") return checkout.status === "abandoned";
  if (status === "resumed") return Boolean(checkout.abandonedAt) && checkout.status !== "abandoned" && checkout.status !== "completed";
  return checkout.status === status;
}

async function valueFor(items: Item[]) {
  const { products } = await readCatalog(true);
  const prices = new Map(products.map((product) => [product.slug, product]));
  let total = 0;
  const lines = items.map((item) => {
    const product = prices.get(item.slug);
    const price = product?.price ?? 0;
    total += price * item.qty;
    return { slug: item.slug, name: product?.name || item.slug, qty: item.qty, price, lineTotal: price * item.qty, known: Boolean(product) };
  });
  return { total, lines };
}

async function customerFor(userId?: string) {
  if (!userId) return null;
  const user = await findUserById(userId);
  if (!user) return { id: userId, name: "Signed-in customer", email: "" };
  return { id: user.id, name: user.name, email: user.email };
}

export async function listCheckouts(input: RangeInput & { status?: string }) {
  await sweepAbandoned();
  const range = resolveRange(input);
  const status = input.status || "abandoned_open";
  const rows = (await checkoutsInRange(range.from, range.to))
    .filter((checkout) => checkout.items.length > 0 && matchesStatus(checkout, status))
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))
    .slice(0, 80);
  const { products } = await readCatalog(true);
  const prices = new Map(products.map((product) => [product.slug, product.price]));
  return {
    range: { from: range.from.toISOString(), to: range.to.toISOString(), preset: range.preset },
    thresholdMinutes: abandonMinutes(),
    checkouts: rows.map((checkout) => ({
      id: checkout.id,
      visitor: checkout.sessionId.slice(0, 8),
      status: checkout.status,
      lastStep: checkout.lastStep,
      items: checkout.items.length,
      value: checkout.items.reduce((sum, item) => sum + (prices.get(item.slug) || 0) * item.qty, 0),
      startedAt: checkout.startedAt,
      lastActivityAt: checkout.lastActivityAt,
      signedIn: Boolean(checkout.userId),
      reachedAuth: checkout.reachedAuth,
      returnedAfterAuth: checkout.returnedAfterAuth,
      completed: checkout.status === "completed",
      completedOrderNumber: checkout.completedOrderNumber || "",
      abandonedAt: checkout.abandonedAt || "",
    })),
  };
}

export async function getCheckout(id: string) {
  await sweepAbandoned();
  let checkout: StoredCheckout | null = null;
  if (await useMongo()) {
    const doc = await CheckoutModel.findById(id).lean<Record<string, unknown> | null>();
    checkout = doc ? fromCheckout(doc) : null;
  } else {
    const rows = await readJson<StoredCheckout[]>("checkouts.json", []);
    checkout = rows.find((row) => row.id === id) ?? null;
  }
  if (!checkout) return null;
  const value = await valueFor(checkout.items);
  const customer = await customerFor(checkout.userId);
  return {
    id: checkout.id,
    visitor: checkout.sessionId.slice(0, 8),
    status: checkout.status,
    lastStep: checkout.lastStep,
    startedAt: checkout.startedAt,
    lastActivityAt: checkout.lastActivityAt,
    abandonedAt: checkout.abandonedAt || "",
    reachedAuth: checkout.reachedAuth,
    returnedAfterAuth: checkout.returnedAfterAuth,
    signedIn: Boolean(checkout.userId),
    customer,
    completed: checkout.status === "completed",
    completedOrderNumber: checkout.completedOrderNumber || "",
    value: value.total,
    lines: value.lines,
  };
}
