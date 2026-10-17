import Link from "next/link";
import { Logo } from "@/components/Logo";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ScrollTop } from "@/components/ScrollTop";
import { site } from "@/lib/site";

const info = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/careers", label: "Careers" },
];

const legal = [
  { href: "/legal/terms", label: "Terms and Conditions" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
  { href: "/legal/returns", label: "Return Policy" },
  { href: "/legal/b-bbee", label: "B-BBEE" },
  { href: "/legal/paia", label: "PAIA Manual" },
  { href: "/legal/internal-processing", label: "Internal Processing Notice" },
  { href: "/legal/external-processing", label: "External Processing Notice" },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link href="/" aria-label={`${site.name} home`}>
            <Logo variant="light" />
          </Link>
          <h2>Physical Address</h2>
          <p>
            {site.address.street}, {site.address.locality}, {site.address.postal}
          </p>
          <p>
            <a href={site.phoneHref}>{site.phone}</a>
          </p>
          <h2>Follow Us</h2>
          <div className="socials">
            {site.social.map((item) => (
              <a key={item.label} href={item.href} aria-label={item.label} target="_blank" rel="noreferrer">
                <Social name={item.label} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h2>Info</h2>
          <ul>
            {info.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Legal</h2>
          <ul>
            {legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for exclusive trade offers and updates.</p>
          <NewsletterForm />
        </div>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
      <ScrollTop />
    </footer>
  );
}

function Social({ name }: { name: string }) {
  if (name === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z" />
      </svg>
    );
  }
  if (name === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (name === "YouTube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M21 8.2a3 3 0 0 0-2.1-2.1C17.2 5.6 12 5.6 12 5.6s-5.2 0-6.9.5A3 3 0 0 0 3 8.2 31 31 0 0 0 2.5 12 31 31 0 0 0 3 15.8a3 3 0 0 0 2.1 2.1c1.7.5 6.9.5 6.9.5s5.2 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-3.8 31 31 0 0 0-.5-3.8zM10.5 15.2V8.8L16 12l-5.5 3.2z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M4 4h3.2l4.2 5.8L16.2 4H20l-6.3 7.4L20.4 20h-3.2l-4.6-6.3L7.6 20H4l6.6-7.7L4 4z" />
    </svg>
  );
}
