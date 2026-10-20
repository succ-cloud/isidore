"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/context/CatalogContext";
import { track } from "@/lib/track";

export type CartLine = { slug: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "isdore-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { productBySlug } = useCatalog();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as CartLine[];
      if (Array.isArray(saved)) {
        setLines(saved.filter((line) => line.qty > 0 && productBySlug(line.slug)));
      }
    } catch {
      setLines([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((sum, line) => {
      const product = productBySlug(line.slug);
      return sum + (product ? product.price * line.qty : 0);
    }, 0);
    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.qty, 0),
      subtotal,
      ready,
      add: (slug, qty = 1) => {
        setLines((current) => {
          const existing = current.find((line) => line.slug === slug);
          const next = existing
            ? current.map((line) => (line.slug === slug ? { ...line, qty: line.qty + qty } : line))
            : [...current, { slug, qty }];
          queueMicrotask(() => track({ type: "add_to_cart", productSlug: slug, qty, items: next }));
          return next;
        });
      },
      setQty: (slug, qty) => {
        setLines((current) => {
          const next = qty <= 0 ? current.filter((line) => line.slug !== slug) : current.map((line) => (line.slug === slug ? { ...line, qty } : line));
          queueMicrotask(() =>
            track(qty <= 0 ? { type: "remove_from_cart", productSlug: slug, items: next } : { type: "cart_qty", productSlug: slug, qty, items: next }),
          );
          return next;
        });
      },
      remove: (slug) => {
        setLines((current) => {
          const next = current.filter((line) => line.slug !== slug);
          queueMicrotask(() => track({ type: "remove_from_cart", productSlug: slug, items: next }));
          return next;
        });
      },
      clear: () => setLines([]),
    };
  }, [lines, ready, productBySlug]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
