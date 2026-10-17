import { NextResponse } from "next/server";
import { clean, isEmail } from "@/lib/auth";
import { updateJson } from "@/lib/db";
import { sendMail } from "@/lib/mail";

type Message = { name: string; email: string; phone: string; message: string; createdAt: string };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || clean(body.company)) {
    return NextResponse.json({ ok: false, message: "We could not read that form." }, { status: 400 });
  }
  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 30);
  const message = clean(body.message, 2000);
  if (!name || !isEmail(email) || message.length < 8) {
    return NextResponse.json({ ok: false, message: "Add your name, a valid email, and a message." }, { status: 400 });
  }
  await updateJson<Message[]>("messages.json", [], (current) => [
    ...current,
    { name, email, phone, message, createdAt: new Date().toISOString() },
  ]);
  try {
    await sendMail({
      subject: `Website message from ${name}`,
      replyTo: email,
      text: `${name}\n${email}\n${phone}\n\n${message}`,
    });
  } catch (error) {
    console.error("Contact email failed", error);
  }
  return NextResponse.json({ ok: true, message: "Message received. We will reply to the email you entered." });
}
