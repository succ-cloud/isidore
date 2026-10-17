"use client";

import { useState } from "react";
import { AddToCart } from "@/components/AddToCart";

export function ProductPurchase({ slug, disabled }: { slug: string; disabled?: boolean }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="purchase">
      <label>
        Qty
        <input
          type="number"
          min={1}
          max={99}
          value={qty}
          disabled={disabled}
          onChange={(event) => setQty(Math.max(1, Math.min(99, Number(event.target.value) || 1)))}
        />
      </label>
      <AddToCart slug={slug} qty={qty} disabled={disabled} />
    </div>
  );
}
