import type { Metadata } from "next";
import { Montserrat, Oswald } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { site } from "@/lib/site";
import "./globals.css";

const body = Montserrat({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Oswald({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Electrical and solar wholesale`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: site.name,
    title: `${site.name} | Electrical and solar wholesale`,
    description: site.description,
    url: site.url,
  },
  twitter: { card: "summary", title: site.name, description: site.description },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WholesaleStore",
    name: site.name,
    description: site.description,
    url: site.url,
    email: site.email,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postal,
      addressCountry: site.address.countryCode,
    },
    areaServed: "ZA",
  };

  return (
    <html lang="en-ZA" className={`${body.variable} ${display.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>
          <Header />
          <main id="content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
