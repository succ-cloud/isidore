export type TrackItem = { slug: string; qty: number };

export type TrackPayload = {
  type: string;
  productSlug?: string;
  categorySlug?: string;
  query?: string;
  qty?: number;
  items?: TrackItem[];
};

type Campaign = { source?: string; medium?: string; name?: string };

const recent = new Map<string, number>();
let chain: Promise<unknown> = Promise.resolve();

function send(url: string, body: unknown) {
  chain = chain.then(() =>
    fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify(body),
    }).catch(() => undefined),
  );
}

export function rememberCampaign() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const campaign = {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    name: params.get("utm_campaign") || "",
  };
  if (campaign.source || campaign.medium || campaign.name) {
    sessionStorage.setItem("isdore-campaign", JSON.stringify(campaign));
  }
}

function campaign(): Campaign | undefined {
  try {
    const raw = sessionStorage.getItem("isdore-campaign");
    return raw ? (JSON.parse(raw) as Campaign) : undefined;
  } catch {
    return undefined;
  }
}

function referrer() {
  try {
    const value = document.referrer;
    if (!value || value.startsWith(window.location.origin)) return "";
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.slice(0, 180);
  } catch {
    return "";
  }
}

export function trackingAllowed() {
  return typeof window !== "undefined" && localStorage.getItem("isdore-consent") === "granted";
}

export function track(event: TrackPayload, onceKey?: string) {
  if (!trackingAllowed()) return;
  if (onceKey) {
    const now = Date.now();
    if ((recent.get(onceKey) || 0) > now - 1200) return;
    recent.set(onceKey, now);
  }
  send("/api/analytics/events", {
    ...event,
    path: window.location.pathname,
    referrer: referrer(),
    campaign: campaign(),
  });
}

export function reportProgress(step: "auth" | "checkout", items: TrackItem[]) {
  if (!trackingAllowed()) return;
  send("/api/analytics/progress", { step, items, path: window.location.pathname });
}
