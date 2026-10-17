"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ProductArt } from "@/components/ProductArt";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { productBySlug } from "@/lib/catalog";
import { formatRand, site } from "@/lib/site";

export function CartView() {
  const { lines, setQty, remove, subtotal, clear } = useCart();
  const { user } = useAuth();
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);
  const delivery = subtotal === 0 || subtotal >= site.freeDelivery ? 0 : site.deliveryFee;
  const total = subtotal + delivery;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setMessage("");
    setError(false);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          address: form.get("address"),
          city: form.get("city"),
          paymentMethod: form.get("paymentMethod"),
          company: form.get("company"),
          items: lines.map((line) => ({ slug: line.slug, qty: line.qty })),
        }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string; orderId?: string };
      if (!response.ok || !data.ok) {
        setError(true);
        setMessage(data.message || "The order could not be placed.");
        return;
      }
      setOrderId(data.orderId || "");
      setMessage(data.message || "Order placed.");
      clear();
    } catch {
      setError(true);
      setMessage("We could not reach the server.");
    } finally {
      setSending(false);
    }
  }

  if (orderId) {
    return (
      <div className="page">
        <h1>Order {orderId} is in</h1>
        <p className="lede">{message}</p>
        <p>
          <Link className="btn-navy" href="/shop">
            Continue shopping
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Cart</h1>
      {lines.length === 0 ? (
        <p className="lede">
          Your cart is empty. <Link href="/shop">Browse the catalogue</Link>.
        </p>
      ) : (
        <div className="cart-layout">
          <div>
            {lines.map((line) => {
              const product = productBySlug(line.slug);
              if (!product) return null;
              return (
                <article className="line" key={line.slug}>
                  <ProductArt category={product.categorySlug} seed={product.slug} alt="" />
                  <div>
                    <h2>
                      <Link href={`/product/${product.slug}`}>{product.name}</Link>
                    </h2>
                    <div className="qty">
                      <button type="button" aria-label="Decrease quantity" onClick={() => setQty(line.slug, line.qty - 1)}>
                        −
                      </button>
                      <span>{line.qty}</span>
                      <button type="button" aria-label="Increase quantity" onClick={() => setQty(line.slug, line.qty + 1)}>
                        +
                      </button>
                      <button type="button" className="text-button" onClick={() => remove(line.slug)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <strong className="line-total">{formatRand(product.price * line.qty)}</strong>
                </article>
              );
            })}
          </div>
          <form className="summary-card form-card" onSubmit={onSubmit}>
            <h2>Checkout</h2>
            <p>
              <span>Subtotal</span>
              <strong>{formatRand(subtotal)}</strong>
            </p>
            <p>
              <span>Delivery</span>
              <strong>{delivery === 0 ? "Free" : formatRand(delivery)}</strong>
            </p>
            <p>
              <span>Total</span>
              <strong>{formatRand(total)}</strong>
            </p>
            <p className="lede">Free delivery applies from {formatRand(site.freeDelivery)}. Card numbers are not taken on this page.</p>
            <label className="hp" aria-hidden="true">
              Company
              <input name="company" tabIndex={-1} autoComplete="off" />
            </label>
            <label className="field">
              Name
              <input name="name" required defaultValue={user?.name || ""} autoComplete="name" />
            </label>
            <label className="field">
              Email
              <input name="email" type="email" required defaultValue={user?.email || ""} autoComplete="email" />
            </label>
            <label className="field">
              Cellphone
              <input name="phone" required defaultValue={user?.phone || ""} autoComplete="tel" />
            </label>
            <label className="field">
              Street address
              <input name="address" required autoComplete="street-address" />
            </label>
            <label className="field">
              City
              <input name="city" required autoComplete="address-level2" />
            </label>
            <label className="field">
              Payment method
              <select name="paymentMethod" required defaultValue="PayFast">
                <option>PayFast</option>
                <option>Instant EFT</option>
                <option>Trade account</option>
                <option>Pay on collection</option>
              </select>
            </label>
            <button className="btn-green" type="submit" disabled={sending}>
              {sending ? "Placing order…" : "Place order"}
            </button>
            <p className={`form-note${error ? " is-error" : ""}`} role="status">
              {message}
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
