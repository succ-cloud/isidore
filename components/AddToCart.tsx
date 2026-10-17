"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export function AddToCart({ slug, disabled, qty = 1 }: { slug: string; disabled?: boolean; qty?: number }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      className="btn-navy"
      type="button"
      disabled={disabled}
      onClick={() => {
        add(slug, qty);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
    >
      {disabled ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
