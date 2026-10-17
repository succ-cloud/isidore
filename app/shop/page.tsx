import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopCatalog } from "@/components/ShopCatalog";

export const metadata: Metadata = {
  title: "Shop by product",
  description: "Browse solar backup, cable, distribution, lighting, HVAC, and general electrical stock.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <Suspense fallback={<p className="page">Loading the catalogue…</p>}>
      <ShopCatalog />
    </Suspense>
  );
}
