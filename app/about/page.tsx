import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About us",
  description: "Isdore Solar is an electrical and solar wholesaler for contractors and DIY projects in South Africa.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="page prose">
      <p className="crumbs">
        <Link href="/">Home</Link> / About us
      </p>
      <h1>About {site.name}</h1>
      <p>
        {site.name} is being built as a trade and retail counter for solar backup, cable, distribution gear, lighting, and the general electrical items a site uses every week.
      </p>
      <p>
        The branch list, phone number, and address on this site are placeholders. They will be replaced when the company details are final. Until then, use the contact form and we will answer at the mailbox configured for the site.
      </p>
      <p>
        Contractors who order often can <Link href="/register">open an account</Link> so collections and invoices stay under one name. Project pricing goes through the <Link href="/quote">quote form</Link>.
      </p>
    </div>
  );
}
