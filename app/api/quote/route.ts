import { NextResponse } from "next/server";
import { clean, isEmail } from "@/lib/auth";
import { updateJson } from "@/lib/db";
import { sendMail } from "@/lib/mail";

type Quote = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  details: string;
  createdAt: string;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || clean(body.company)) {
    return NextResponse.json({ ok: false, message: "We could not read that form." }, { status: 400 });
  }
  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 30);
  const companyName = clean(body.companyName, 120);
  const details = clean(body.details, 2000);
  if (!name || !isEmail(email) || phone.replace(/\D/g, "").length < 10 || details.length < 8) {
    return NextResponse.json({ ok: false, message: "Add your name, email, cellphone, and what you need quoted." }, { status: 400 });
  }
  await updateJson<Quote[]>("quotes.json", [], (current) => [
    ...current,
    { name, email, phone, companyName, details, createdAt: new Date().toISOString() },
  ]);
  try {
    await sendMail({
      subject: `Quote request from ${name}`,
      replyTo: email,
      text: `${name}\n${companyName}\n${email}\n${phone}\n\n${details}`,
    });
  } catch (error) {
    console.error("Quote email failed", error);
  }
  return NextResponse.json({ ok: true, message: "Quote request received. The trade desk will reply by email." });
}
