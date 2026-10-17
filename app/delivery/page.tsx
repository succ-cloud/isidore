import type { Metadata } from "next";
import Link from "next/link";
import { formatRand, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Delivery and returns",
  description: "Isdore Solar delivery rates, the free-delivery threshold, and the 30-day return window.",
  alternates: { canonical: "/delivery" },
};

export default function DeliveryPage() {
  return (
    <div className="page prose">
      <p className="crumbs">
        <Link href="/">Home</Link> / Delivery and returns
      </p>
      <h1>Delivery and returns</h1>
      <p>
        Orders of {formatRand(site.freeDelivery)} or more are delivered free inside our standard metro areas. Under that, delivery is {formatRand(site.deliveryFee)}. Collection from the branch you select has no delivery fee.
      </p>
      <p>
        A delivery date is confirmed after the order is accepted, because branch stock and the address both change the route. Remote sites are quoted before the truck leaves.
      </p>
      <p>
        Unused items in a resaleable condition can come back within 30 days with the invoice. Cut cable, opened consumables, and special orders are not returnable unless they arrived damaged or were the wrong item. Read the <Link href="/legal/returns">return policy</Link> before you send anything back.
      </p>
    </div>
  );
}
