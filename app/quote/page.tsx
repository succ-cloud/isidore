import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Request a quote",
  description: "Request project pricing from Isdore Solar for solar, cable, and electrical packages.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <div className="page">
      <p className="crumbs">
        <Link href="/">Home</Link> / Request a quote
      </p>
      <h1>Request a quote</h1>
      <p className="lede">List the products, quantities, and the branch you want to collect from. We price what is in stock and flag anything that has to be ordered in.</p>
      <LeadForm
        endpoint="/api/quote"
        submitLabel="Request quote"
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "companyName", label: "Company" },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Cellphone", type: "tel", required: true },
          { name: "details", label: "What should we quote?", type: "textarea", required: true },
        ]}
      />
    </div>
  );
}
