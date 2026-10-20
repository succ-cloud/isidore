import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getCheckout } from "@/lib/analytics";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  if (!(await requireAdmin())) return NextResponse.json({ message: "Administrators only." }, { status: 403 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ message: "Checkout not found." }, { status: 404 });
  const checkout = await getCheckout(id);
  if (!checkout) return NextResponse.json({ message: "Checkout not found." }, { status: 404 });
  return NextResponse.json({ checkout });
}
