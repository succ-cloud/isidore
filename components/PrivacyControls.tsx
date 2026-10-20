"use client";

import { useState } from "react";
import { useConsent } from "@/context/ConsentContext";

export function PrivacyControls() {
  const { choice, grant, deny } = useConsent();
  const [message, setMessage] = useState("");

  async function erase() {
    const response = await fetch("/api/analytics/forget", { method: "POST", credentials: "same-origin" });
    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    setMessage(data?.message || "Browsing activity for this browser was deleted.");
  }

  return (
    <div className="form-card privacy-controls">
      <h2>Your choice</h2>
      <p>{choice === "granted" ? "Analytics is allowed in this browser." : choice === "denied" ? "Analytics is off in this browser." : "You have not chosen yet."}</p>
      <div className="consent-actions">
        <button className="btn-green" type="button" onClick={grant}>
          Allow analytics
        </button>
        <button className="btn-navy" type="button" onClick={deny}>
          Decline
        </button>
        <button className="text-button" type="button" onClick={() => void erase()}>
          Delete stored activity
        </button>
      </div>
      {message ? <p className="form-note">{message}</p> : null}
    </div>
  );
}
