import type { Metadata } from "next";
import Link from "next/link";
import { SelectBranch } from "@/components/SelectBranch";
import { branches } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Store locator",
  description: "Find an Isdore Solar trade counter and set it as your shopping branch.",
  alternates: { canonical: "/stores" },
};

export default function StoresPage() {
  return (
    <div className="page">
      <p className="crumbs">
        <Link href="/">Home</Link> / Store locator
      </p>
      <h1>Store locator</h1>
      <p className="lede">Choose a branch to show it in the header. Hours below are placeholders until the real counters are confirmed.</p>
      <div className="card-grid" id="hours">
        {branches.map((branch) => (
          <article className="info-card" key={branch.id}>
            <h2>{branch.name}</h2>
            <p>{branch.address}</p>
            <p>{branch.phone}</p>
            <p>{branch.hours}</p>
            <SelectBranch id={branch.id} city={branch.city} />
          </article>
        ))}
      </div>
    </div>
  );
}
