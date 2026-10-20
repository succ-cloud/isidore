"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConsent } from "@/context/ConsentContext";

export function ConsentBanner() {
  const pathname = usePathname();
  const { choice, ready, grant, deny } = useConsent();
  if (!ready || choice || pathname === "/admin" || pathname.startsWith("/admin/")) return null;

  return (
    <div className="consent-bar" role="dialog" aria-label="Analytics consent">
      <p>
        Allow a first-party cookie so we can see which pages and products lead to an order. Passwords and card numbers are not collected.{" "}
        <Link href="/legal/privacy">Privacy notice</Link>
      </p>
      <div className="consent-actions">
        <button className="btn-green" type="button" onClick={grant}>
          Allow
        </button>
        <button className="consent-decline" type="button" onClick={deny}>
          Decline
        </button>
      </div>
    </div>
  );
}
