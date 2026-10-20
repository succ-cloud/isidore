"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useConsent } from "@/context/ConsentContext";
import { rememberCampaign, reportProgress, track } from "@/lib/track";

export function VisitorTracker() {
  const pathname = usePathname();
  const params = useSearchParams();
  const search = params.get("q") || "";
  const { choice } = useConsent();
  const { lines, ready } = useCart();
  const cartVisit = useRef("");
  const authVisit = useRef("");

  useEffect(() => {
    rememberCampaign();
  }, [pathname, search]);

  useEffect(() => {
    if (choice !== "granted" || pathname.startsWith("/admin")) return;
    const parts = pathname.split("/").filter(Boolean);
    if (pathname === "/") track({ type: "landing" }, `landing:${pathname}`);
    else if (parts[0] === "product" && parts[1]) track({ type: "product_view", productSlug: parts[1] }, `product:${parts[1]}`);
    else if (parts[0] === "shop" && parts[1]) track({ type: "category_view", categorySlug: parts[1] }, `category:${parts[1]}`);
    else if (pathname === "/search" && search) track({ type: "search", query: search }, `search:${search}`);
    else if (pathname === "/register") track({ type: "register_start" }, "register-start");
  }, [pathname, search, choice]);

  useEffect(() => {
    if (pathname !== "/cart") cartVisit.current = "";
  }, [pathname]);

  useEffect(() => {
    if (choice !== "granted" || pathname !== "/cart" || !ready) return;
    const signature = lines.map((line) => `${line.slug}:${line.qty}`).join(",");
    const token = `/cart:${signature}`;
    if (cartVisit.current === token) return;
    const staying = cartVisit.current.startsWith("/cart:");
    cartVisit.current = token;
    track({ type: "cart_view", items: lines }, `cart-view:${token}`);
    if (!lines.length) return;
    if (!staying) track({ type: "checkout_start", items: lines }, `checkout:${token}`);
    else reportProgress("checkout", lines);
  }, [pathname, choice, ready, lines]);

  useEffect(() => {
    if (choice !== "granted" || !ready || !lines.length) return;
    if (pathname !== "/login" && pathname !== "/register") {
      authVisit.current = "";
      return;
    }
    if (authVisit.current === pathname) return;
    authVisit.current = pathname;
    reportProgress("auth", lines);
  }, [pathname, choice, ready, lines]);

  return null;
}
