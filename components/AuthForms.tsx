"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";

function PasswordField({ autoComplete, minLength }: { autoComplete: string; minLength?: number }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="field password-field">
      Password
      <span className="password-wrap">
        <input name="password" type={visible ? "text" : "password"} required minLength={minLength} autoComplete={autoComplete} />
        <button
          className="password-toggle"
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </span>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M3 4.5 20 19" />
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M9.2 7.2A8 8 0 0 1 12 6.5c6 0 9.5 5.5 9.5 5.5a16 16 0 0 1-3.1 3.4M6.1 8.6C3.8 10.2 2.5 12 2.5 12S6 17.5 12 17.5c1.2 0 2.3-.2 3.3-.6" />
      <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M10 10.2a2.6 2.6 0 0 0 3.6 3.6" />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setMessage("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const data = (await response.json()) as { ok?: boolean; message?: string; user?: { role?: string } };
    setSending(false);
    if (!response.ok || !data.ok) {
      setMessage(data.message || "Login failed.");
      return;
    }
    await refresh();
    if (data.user?.role === "admin") {
      router.push("/admin");
      return;
    }
    const next = params.get("next");
    router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/account");
  }

  return (
    <div className="page">
      <h1>Login</h1>
      <p className="lede">
        New here? <Link href="/register">Create an account</Link>.
      </p>
      <form className="form-card" onSubmit={onSubmit}>
        <label className="field">
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <PasswordField autoComplete="current-password" />
        <button className="btn-green" type="submit" disabled={sending}>
          {sending ? "Checking…" : "Login"}
        </button>
        <p className="form-note is-error" role="status">
          {message}
        </p>
      </form>
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setMessage("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
        company: form.get("company"),
      }),
    });
    const data = (await response.json()) as { ok?: boolean; message?: string };
    setSending(false);
    if (!response.ok || !data.ok) {
      setMessage(data.message || "Registration failed.");
      return;
    }
    await refresh();
    router.push("/account");
  }

  return (
    <div className="page">
      <h1>Register</h1>
      <p className="lede">
        Already registered? <Link href="/login">Log in</Link>.
      </p>
      <form className="form-card" onSubmit={onSubmit}>
        <label className="hp" aria-hidden="true">
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
        <label className="field">
          Name
          <input name="name" required autoComplete="name" />
        </label>
        <label className="field">
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label className="field">
          Cellphone
          <input name="phone" autoComplete="tel" />
        </label>
        <PasswordField autoComplete="new-password" minLength={8} />
        <button className="btn-green" type="submit" disabled={sending}>
          {sending ? "Creating account…" : "Create account"}
        </button>
        <p className="form-note is-error" role="status">
          {message}
        </p>
      </form>
    </div>
  );
}
