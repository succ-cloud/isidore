"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";

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
    const data = (await response.json()) as { ok?: boolean; message?: string };
    setSending(false);
    if (!response.ok || !data.ok) {
      setMessage(data.message || "Login failed.");
      return;
    }
    await refresh();
    router.push(params.get("next") || "/account");
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
        <label className="field">
          Password
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
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
        <label className="field">
          Password
          <input name="password" type="password" required minLength={8} autoComplete="new-password" />
        </label>
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
