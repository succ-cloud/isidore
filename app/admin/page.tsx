import type { Metadata } from "next";
import Link from "next/link";
import { AdminDashboard } from "@/components/AdminDashboard";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="page">
        <h1>Admin</h1>
        <p>Log in with an administrator account to manage products and categories.</p>
        <Link className="btn-navy" href="/login?next=/admin">Log in</Link>
      </div>
    );
  }
  if (user.role !== "admin") {
    return (
      <div className="page">
        <h1>Admin</h1>
        <p>This account cannot manage the store.</p>
      </div>
    );
  }
  return <AdminDashboard name={user.name} email={user.email} />;
}
