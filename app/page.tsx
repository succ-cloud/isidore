import type { Metadata } from "next";
import { CategorySection } from "@/components/CategorySection";
import { Hero } from "@/components/Hero";
import { PaymentStrip } from "@/components/PaymentStrip";
import { ProcessSection } from "@/components/ProcessSection";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Isdore Solar | Electrical and Solar Wholesale in South Africa" },
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategorySection />
      <ProcessSection />
      <PaymentStrip />
    </>
  );
}
