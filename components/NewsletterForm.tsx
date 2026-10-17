"use client";

import { FormEvent, useState } from "react";

const empty = { name: "", surname: "", phone: "", email: "", company: "" };

export function NewsletterForm() {
  const [fields, setFields] = useState(empty);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setStatus("error");
        setMessage(data.message || "We could not save those details. Check them and try again.");
        return;
      }
      setStatus("done");
      setMessage(data.message || "You're on the list.");
      setFields(empty);
    } catch {
      setStatus("error");
      setMessage("We could not reach the server. Try again in a moment.");
    }
  }

  function set(key: keyof typeof empty, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="newsletter" onSubmit={onSubmit}>
      <label className="hp" aria-hidden="true">
        Company
        <input tabIndex={-1} autoComplete="off" value={fields.company} onChange={(event) => set("company", event.target.value)} />
      </label>
      <label>
        <span className="sr-only">Name</span>
        <input required value={fields.name} onChange={(event) => set("name", event.target.value)} placeholder="Name" autoComplete="given-name" />
      </label>
      <label>
        <span className="sr-only">Surname</span>
        <input required value={fields.surname} onChange={(event) => set("surname", event.target.value)} placeholder="Surname" autoComplete="family-name" />
      </label>
      <label>
        <span className="sr-only">Cellphone</span>
        <input required value={fields.phone} onChange={(event) => set("phone", event.target.value)} placeholder="Cellphone (i.e +27820000000)" autoComplete="tel" inputMode="tel" />
      </label>
      <label>
        <span className="sr-only">Email address</span>
        <input required type="email" value={fields.email} onChange={(event) => set("email", event.target.value)} placeholder="Email Address *" autoComplete="email" />
      </label>
      <button className="btn-green" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Subscribe"}
      </button>
      <p className={`form-note${status === "error" ? " is-error" : ""}`} role="status">
        {message}
      </p>
    </form>
  );
}
