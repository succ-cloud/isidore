"use client";

import { FormEvent, useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

export function LeadForm({
  endpoint,
  fields,
  submitLabel,
}: {
  endpoint: string;
  fields: Field[];
  submitLabel: string;
}) {
  const [values, setValues] = useState<Record<string, string>>({ company: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setStatus("error");
        setMessage(data.message || "Check the form and try again.");
        return;
      }
      setStatus("done");
      setMessage(data.message || "Sent.");
      setValues({ company: "" });
    } catch {
      setStatus("error");
      setMessage("We could not reach the server. Try again in a moment.");
    }
  }

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <label className="hp" aria-hidden="true">
        Company
        <input value={values.company || ""} onChange={(event) => setValues({ ...values, company: event.target.value })} tabIndex={-1} autoComplete="off" />
      </label>
      {fields.map((field) => (
        <label className="field" key={field.name}>
          {field.label}
          {field.type === "textarea" ? (
            <textarea
              required={field.required}
              rows={5}
              value={values[field.name] || ""}
              placeholder={field.placeholder}
              onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
            />
          ) : field.type === "select" ? (
            <select
              required={field.required}
              value={values[field.name] || ""}
              onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
            >
              <option value="">Select</option>
              {field.options?.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              required={field.required}
              type={field.type || "text"}
              value={values[field.name] || ""}
              placeholder={field.placeholder}
              onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
            />
          )}
        </label>
      ))}
      <button className="btn-green" type="submit" disabled={status === "sending" || status === "done"}>
        {status === "sending" ? "Sending…" : submitLabel}
      </button>
      <p className={`form-note${status === "error" ? " is-error" : ""}`} role="status">
        {message}
      </p>
    </form>
  );
}
