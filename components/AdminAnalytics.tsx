"use client";

import { useEffect, useState } from "react";
import { formatRand } from "@/lib/site";

type Preset = "today" | "7" | "30" | "custom";

type Overview = {
  thresholdMinutes: number;
  retentionDays: number;
  visitors: { total: number; unique: number };
  productViews: { events: number; sessions: number };
  addToCart: { events: number; sessions: number };
  checkoutStarts: { events: number; sessions: number };
  orders: { events: number; sessions: number };
  abandonedCarts: number;
  abandonedCheckouts: number;
  rates: { cartToCheckout: number | null; checkoutCompletion: number | null; visitorToOrder: number | null };
  mostViewed: { slug: string; name: string; events: number; sessions: number }[];
  mostAdded: { slug: string; name: string; events: number; sessions: number }[];
  stages: { id: string; label: string; count: number }[];
  sources: { source: string; sessions: number; orders: number }[];
  funnel: { id: string; label: string; count: number }[];
  definitions: Record<string, string>;
};

type Activity = {
  id: string;
  type: string;
  at: string;
  path: string;
  productSlug: string;
  visitor: string;
  signedIn: boolean;
};

type CheckoutRow = {
  id: string;
  visitor: string;
  status: string;
  lastStep: string;
  items: number;
  value: number;
  startedAt: string;
  lastActivityAt: string;
  signedIn: boolean;
  completed: boolean;
  completedOrderNumber: string;
  reachedAuth: boolean;
  returnedAfterAuth: boolean;
};

type CheckoutDetail = CheckoutRow & {
  customer: { name: string; email: string } | null;
  lines: { slug: string; name: string; qty: number; price: number; lineTotal: number }[];
  abandonedAt: string;
};

const presets: { id: Preset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "custom", label: "Custom" },
];

const checkoutFilters = [
  { id: "abandoned_open", label: "Still abandoned" },
  { id: "resumed", label: "Came back" },
  { id: "completed_after", label: "Ordered later" },
  { id: "incomplete", label: "All open" },
  { id: "all", label: "All" },
];

function rate(value: number | null) {
  return value === null ? "—" : `${value}%`;
}

function when(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function queryFor(preset: Preset, from: string, to: string) {
  const params = new URLSearchParams({ preset });
  if (preset === "custom" && from && to) {
    params.set("from", from);
    params.set("to", to);
  }
  return params;
}

export function AdminAnalytics({ mode }: { mode: "analytics" | "checkouts" }) {
  const [preset, setPreset] = useState<Preset>("7");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [status, setStatus] = useState("abandoned_open");
  const [rows, setRows] = useState<CheckoutRow[]>([]);
  const [detail, setDetail] = useState<CheckoutDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "analytics") return;
    if (preset === "custom" && (!from || !to)) return;
    const params = queryFor(preset, from, to);
    setError("");
    void Promise.all([
      fetch(`/api/admin/analytics/overview?${params}`).then((response) => response.json()),
      fetch(`/api/admin/analytics/events?${params}`).then((response) => response.json()),
    ])
      .then(([summary, events]) => {
        if (summary.message) {
          setError(summary.message);
          return;
        }
        setOverview(summary);
        setActivity(Array.isArray(events.events) ? events.events.slice(0, 8) : []);
      })
      .catch(() => setError("Analytics could not be loaded."));
  }, [mode, preset, from, to]);

  useEffect(() => {
    if (mode !== "checkouts") return;
    if (preset === "custom" && (!from || !to)) return;
    const params = queryFor(preset, from, to);
    params.set("status", status);
    setError("");
    setDetail(null);
    void fetch(`/api/admin/checkouts/abandoned?${params}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          setError(data.message);
          return;
        }
        setRows(data.checkouts || []);
      })
      .catch(() => setError("Checkouts could not be loaded."));
  }, [mode, preset, from, to, status]);

  async function openCheckout(id: string) {
    const response = await fetch(`/api/admin/checkouts/${id}`);
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || "That checkout could not be opened.");
      return;
    }
    setDetail(data.checkout);
  }

  const maxFunnel = overview?.funnel[0]?.count || 1;
  const maxViewed = overview?.mostViewed[0]?.events || 1;

  return (
    <div className="analytics">
      <div className="dash-filters">
        {presets.map((item) => (
          <button key={item.id} className={preset === item.id ? "is-active" : ""} type="button" onClick={() => setPreset(item.id)}>
            {item.label}
          </button>
        ))}
        {preset === "custom" ? (
          <>
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} aria-label="From" />
            <input type="date" value={to} onChange={(event) => setTo(event.target.value)} aria-label="To" />
          </>
        ) : null}
      </div>
      {error ? <p className="form-note is-error">{error}</p> : null}
      {mode === "analytics" && overview ? (
        <>
          <div className="dash-stats cols-4">
            <article>
              <span>Page visits</span>
              <strong>{overview.visitors.total}</strong>
              <small>{overview.visitors.unique} unique visitors</small>
            </article>
            <article>
              <span>Product views</span>
              <strong>{overview.productViews.events}</strong>
              <small>{overview.productViews.sessions} visitors</small>
            </article>
            <article>
              <span>Added to cart</span>
              <strong>{overview.addToCart.events}</strong>
              <small>{overview.addToCart.sessions} visitors</small>
            </article>
            <article>
              <span>Checkout started</span>
              <strong>{overview.checkoutStarts.events}</strong>
              <small>{overview.checkoutStarts.sessions} visitors</small>
            </article>
          </div>
          <div className="dash-stats cols-4">
            <article>
              <span>Orders</span>
              <strong>{overview.orders.events}</strong>
              <small>{overview.orders.sessions} visitors</small>
            </article>
            <article>
              <span>Cart to checkout</span>
              <strong>{rate(overview.rates.cartToCheckout)}</strong>
              <small>Unique sessions</small>
            </article>
            <article>
              <span>Checkout completion</span>
              <strong>{rate(overview.rates.checkoutCompletion)}</strong>
              <small>Unique sessions</small>
            </article>
            <article>
              <span>Visit to order</span>
              <strong>{rate(overview.rates.visitorToOrder)}</strong>
              <small>{overview.abandonedCarts + overview.abandonedCheckouts} abandoned</small>
            </article>
          </div>
          <p className="analytics-note">
            Counts above the small type are raw events. Rates use unique browser sessions. A checkout is abandoned after {overview.thresholdMinutes} idle minutes and is kept for {overview.retentionDays} days.
          </p>
          <div className="dash-panels">
            <article className="dash-card">
              <h2>Journey</h2>
              <div className="metric-list">
                {overview.funnel.map((step) => (
                  <div key={step.id}>
                    <span>{step.label}</span>
                    <div className="metric-bar" aria-hidden="true">
                      <i style={{ width: `${Math.max(4, Math.round((step.count / maxFunnel) * 100))}%` }} />
                    </div>
                    <strong>{step.count}</strong>
                  </div>
                ))}
              </div>
            </article>
            <article className="dash-card">
              <h2>Where people stop</h2>
              <div className="metric-list">
                {overview.stages.map((stage) => (
                  <div className="metric-plain" key={stage.id}>
                    <span>{stage.label}</span>
                    <strong>{stage.count}</strong>
                  </div>
                ))}
              </div>
            </article>
          </div>
          <div className="dash-panels">
            <article className="dash-card">
              <h2>Most viewed</h2>
              {overview.mostViewed.length === 0 ? <p>No product views in this range.</p> : null}
              <div className="metric-list">
                {overview.mostViewed.map((product) => (
                  <div key={product.slug}>
                    <span>{product.name}</span>
                    <div className="metric-bar" aria-hidden="true">
                      <i style={{ width: `${Math.max(4, Math.round((product.events / maxViewed) * 100))}%` }} />
                    </div>
                    <strong>{product.events}</strong>
                  </div>
                ))}
              </div>
            </article>
            <article className="dash-card">
              <h2>Most added to cart</h2>
              {overview.mostAdded.length === 0 ? <p>No cart adds in this range.</p> : null}
              <div className="metric-list">
                {overview.mostAdded.map((product) => (
                  <div className="metric-plain" key={product.slug}>
                    <span>{product.name}</span>
                    <strong>{product.events}</strong>
                  </div>
                ))}
              </div>
            </article>
          </div>
          <div className="dash-panels">
            <article className="dash-card">
              <h2>Traffic sources</h2>
              {overview.sources.length === 0 ? <p>No attributed visits in this range.</p> : null}
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Visitors</th>
                      <th>Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.sources.map((source) => (
                      <tr key={source.source}>
                        <td>{source.source}</td>
                        <td>{source.sessions}</td>
                        <td>{source.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article className="dash-card">
              <h2>Recent activity</h2>
              {activity.length === 0 ? <p>No events in this range.</p> : null}
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Visitor</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <strong>{event.type.replace(/_/g, " ")}</strong>
                          <span>{event.productSlug || event.path}</span>
                        </td>
                        <td>{event.signedIn ? "Signed in" : event.visitor}</td>
                        <td>{when(event.at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </>
      ) : null}
      {mode === "checkouts" ? (
        <>
          <div className="dash-filters">
            {checkoutFilters.map((item) => (
              <button key={item.id} className={status === item.id ? "is-active" : ""} type="button" onClick={() => setStatus(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          {rows.length === 0 ? <p className="analytics-note">No checkouts match this filter.</p> : null}
          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Visitor</th>
                    <th>Status</th>
                    <th>Step</th>
                    <th>Value</th>
                    <th>Last activity</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.signedIn ? "Customer" : `Visitor ${row.visitor}`}</strong>
                        <span>{row.completed ? row.completedOrderNumber || "Completed" : `${row.items} products`}</span>
                      </td>
                      <td>{row.status}</td>
                      <td>{row.lastStep}</td>
                      <td>{formatRand(row.value)}</td>
                      <td>{when(row.lastActivityAt)}</td>
                      <td>
                        <button className="text-button" type="button" onClick={() => void openCheckout(row.id)}>
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {detail ? (
            <article className="dash-card">
              <h2>{detail.customer ? detail.customer.name : `Visitor ${detail.visitor}`}</h2>
              <p>
                {detail.customer?.email || (detail.signedIn ? "Signed-in customer" : "Anonymous session")} · {detail.status} · last step {detail.lastStep}
                {detail.reachedAuth ? " · opened sign in" : ""}
                {detail.returnedAfterAuth ? " · returned to checkout" : ""}
                {detail.completed ? ` · order ${detail.completedOrderNumber}` : ""}
              </p>
              <p>
                Started {when(detail.startedAt)}. Last activity {when(detail.lastActivityAt)}.
                {detail.abandonedAt ? ` Idle since ${when(detail.abandonedAt)}.` : ""}
              </p>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.lines.map((line) => (
                      <tr key={line.slug}>
                        <td>{line.name}</td>
                        <td>{line.qty}</td>
                        <td>{formatRand(line.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>Estimated value {formatRand(detail.value)} at current catalogue prices.</p>
            </article>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
