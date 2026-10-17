import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";

const jobs = [
  {
    title: "Trade counter assistant",
    place: "Johannesburg",
    copy: "Help contractors find cable, breakers, and solar accessories, and keep the counter accurate.",
  },
  {
    title: "Delivery driver",
    place: "Gauteng",
    copy: "Run scheduled drops to sites and bring signed delivery notes back the same day.",
  },
  {
    title: "Inside sales",
    place: "Johannesburg",
    copy: "Turn quote requests into priced orders and follow up when a line is waiting on stock.",
  },
];

export const metadata: Metadata = {
  title: "Careers",
  description: "Open roles at Isdore Solar and an application form for the trade counter, deliveries, and inside sales.",
  alternates: { canonical: "/careers" },
};

export default function CareersPage() {
  return (
    <div className="page">
      <p className="crumbs">
        <Link href="/">Home</Link> / Careers
      </p>
      <h1>Careers</h1>
      <p className="lede">These roles are sample listings so the page works. Replace them with live vacancies before you invite applications.</p>
      <div className="card-grid">
        {jobs.map((job) => (
          <article className="info-card" key={job.title}>
            <p className="brand">{job.place}</p>
            <h2>{job.title}</h2>
            <p>{job.copy}</p>
          </article>
        ))}
      </div>
      <h2>Apply</h2>
      <LeadForm
        endpoint="/api/careers"
        submitLabel="Submit application"
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Cellphone", type: "tel", required: true },
          {
            name: "role",
            label: "Role",
            type: "select",
            required: true,
            options: jobs.map((job) => job.title),
          },
          { name: "note", label: "Short note", type: "textarea" },
        ]}
      />
    </div>
  );
}
