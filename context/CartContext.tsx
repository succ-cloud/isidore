"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { productBySlug } from "@/lib/catalog";

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
          if (!existing) return [...current, { slug, qty }];
          return current.map((line) => (line.slug === slug ? { ...line, qty: line.qty + qty } : line));
        });
      },
      setQty: (slug, qty) => {
        setLines((current) =>
          qty <= 0 ? current.filter((line) => line.slug !== slug) : current.map((line) => (line.slug === slug ? { ...line, qty } : line)),
        );
      },
      remove: (slug) => setLines((current) => current.filter((line) => line.slug !== slug)),
      clear: () => setLines([]),
    };
  }, [lines, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
