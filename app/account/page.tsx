import type { Metadata } from "next";
import { AccountPanel } from "@/components/AccountPanel";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountPanel />;
}
