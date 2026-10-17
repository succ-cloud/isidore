"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatRand } from "@/lib/site";

type Order = {
  id: string;
  total: number;
  createdAt: string;
  paymentMethod: string;
  items: { name: string; qty: number }[];
};

export function AccountPanel() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/account");
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    void fetch("/api/orders")
      .then((response) => response.json())
      .then((data: { orders?: Order[] }) => setOrders(data.orders || []));
  }, [user]);

  if (!user) {
    return (
      <div className="page">
        <h1>Account</h1>
        <p>Loading your account…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Hello, {user.name}</h1>
      <p className="lede">
        {user.email}
        {user.phone ? ` · ${user.phone}` : ""}
      </p>
      <button
        className="btn-navy"
        type="button"
        onClick={() => {
          void logout().then(() => router.push("/"));
        }}
      >
        Sign out
      </button>
      <h2>Orders</h2>
      {orders.length === 0 ? (
        <p>
          No orders yet. <Link href="/shop">Start with the catalogue</Link>.
        </p>
      ) : (
        <div className="card-grid">
          {orders.map((order) => (
            <article className="info-card" key={order.id}>
              <p className="brand">{new Date(order.createdAt).toLocaleDateString("en-ZA")}</p>
              <h2>{order.id}</h2>
              <p>{formatRand(order.total)}</p>
              <p>{order.paymentMethod}</p>
              <ul>
                {order.items.map((item) => (
                  <li key={item.name}>
                    {item.qty} × {item.name}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
