import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Ask Isdore Solar about a product, a specification, or an existing order.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="page">
      <p className="crumbs">
        <Link href="/">Home</Link> / Contact us
      </p>
      <h1>Customer support</h1>
      <p className="lede">Send a product question or an order query. We reply to the email address you enter.</p>
      <LeadForm
        endpoint="/api/contact"
        submitLabel="Send message"
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Cellphone", type: "tel" },
          { name: "message", label: "Message", type: "textarea", required: true },
        ]}
      />
    </div>
  );
}
