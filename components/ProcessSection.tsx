import Link from "next/link";

const steps = [
  {
    href: "/delivery",
    title: "Delivery & Returns",
    copy: "See standard delivery rates and the 30-day window for unused stock.",
    icon: "truck",
  },
  {
    href: "/quote",
    title: "Request a Quote",
    copy: "Need project pricing? Send the list and we will quote it.",
    icon: "card",
  },
  {
    href: "/stores",
    title: "Store Locator",
    copy: "Find an Isdore trade counter and check the counter hours.",
    icon: "pin",
  },
  {
    href: "/contact",
    title: "Customer Support",
    copy: "Ask the desk about a product, a specification, or an order.",
    icon: "shield",
  },
];

export function ProcessSection() {
  return (
    <section className="section process" aria-label="How to buy">
      <div className="process-grid">
        {steps.map((step) => (
          <Link key={step.href} href={step.href} className="process-card">
            <Icon name={step.icon} />
            <h2>{step.title}</h2>
            <p>{step.copy}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Icon({ name }: { name: string }) {
  if (name === "truck") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="7" cy="17.5" r="1.4" fill="currentColor" />
        <circle cx="17" cy="17.5" r="1.4" fill="currentColor" />
      </svg>
    );
  }
  if (name === "card") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (name === "pin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="10" r="2" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 5 6v6c0 4.2 2.8 7.2 7 9 4.2-1.8 7-4.8 7-9V6l-7-3z" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
