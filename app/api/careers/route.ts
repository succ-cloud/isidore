import { NextResponse } from "next/server";
import { clean, isEmail } from "@/lib/auth";
import { updateJson } from "@/lib/db";
import { sendMail } from "@/lib/mail";

const roles = new Set(["Trade counter assistant", "Delivery driver", "Inside sales"]);

type Application = { name: string; email: string; phone: string; role: string; note: string; createdAt: string };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || clean(body.company)) {
    return NextResponse.json({ ok: false, message: "We could not read that form." }, { status: 400 });
  }
  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 30);
  const role = clean(body.role, 80);
  const note = clean(body.note, 2000);
  if (!name || !isEmail(email) || phone.replace(/\D/g, "").length < 10 || !roles.has(role)) {
    return NextResponse.json({ ok: false, message: "Add your name, email, cellphone, and the role you are applying for." }, { status: 400 });
  }
  await updateJson<Application[]>("applications.json", [], (current) => [
    ...current,
    { name, email, phone, role, note, createdAt: new Date().toISOString() },
  ]);
  try {
    await sendMail({
      subject: `Application: ${role} — ${name}`,
      replyTo: email,
      text: `${name}\n${email}\n${phone}\n${role}\n\n${note}`,
    });
  } catch (error) {
    console.error("Careers email failed", error);
  }
  return NextResponse.json({ ok: true, message: "Application received. We will email you if we take it further." });
}
