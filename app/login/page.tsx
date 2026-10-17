import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="page">Loading login…</p>}>
      <LoginForm />
    </Suspense>
  );
}
