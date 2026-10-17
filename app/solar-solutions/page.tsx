import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Solar solutions",
  description: "Home backup, small-business solar, and essential-load design from Isdore Solar.",
  alternates: { canonical: "/solar-solutions" },
};

const solutions = [
  {
    title: "Home backup",
    copy: "A hybrid inverter and one wall battery for lights, the fridge, and the router. Cooking and geysers stay off that board.",
    href: "/shop/solar-backup",
  },
  {
    title: "Small business",
    copy: "Daytime panels sized to the inverter, with a battery only for the tills, network, and a few lights after hours.",
    href: "/quote",
  },
  {
    title: "Array hardware",
    copy: "Panels, DC cable, and isolators sold as separate lines so the string can match the roof.",
    href: "/shop/solar-backup",
  },
];

export default function SolarPage() {
  return (
    <div className="page">
      <p className="crumbs">
        <Link href="/">Home</Link> / Solar solutions
      </p>
      <h1>Solar solutions</h1>
      <p className="lede">
        Start with the circuits that must stay on, then pick the inverter, battery, and panels around that list. We do not quote a whole-house battery for a fridge and a fibre router.
      </p>
      <div className="card-grid">
        {solutions.map((item) => (
          <article className="info-card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.copy}</p>
            <Link className="btn-navy" href={item.href}>
              {item.href === "/quote" ? "Request a quote" : "View products"}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
