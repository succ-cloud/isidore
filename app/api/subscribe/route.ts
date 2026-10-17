import { NextResponse } from "next/server";
import { clean, isEmail } from "@/lib/auth";
import { updateJson } from "@/lib/db";
import { sendMail } from "@/lib/mail";

type Subscriber = {
  name: string;
  surname: string;
  phone: string;
  email: string;
  createdAt: string;
  emailed: boolean;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || clean(body.company)) {
    return NextResponse.json({ ok: false, message: "We could not read that form." }, { status: 400 });
  }

  const name = clean(body.name, 80);
  const surname = clean(body.surname, 80);
  const phone = clean(body.phone, 30);
  const email = clean(body.email, 120).toLowerCase();

  if (!name || !surname || phone.replace(/\D/g, "").length < 10 || !isEmail(email)) {
    return NextResponse.json(
      { ok: false, message: "Add a name, surname, cellphone, and a valid email address." },
      { status: 400 },
    );
  }

  let duplicate = false;
  await updateJson<Subscriber[]>("subscribers.json", [], (current) => {
    if (current.some((entry) => entry.email === email)) {
      duplicate = true;
      return current;
    }
    return [...current, { name, surname, phone, email, createdAt: new Date().toISOString(), emailed: false }];
  });

  if (duplicate) {
    return NextResponse.json({ ok: true, message: "That email is already on the list." });
  }

  let emailed = false;
  try {
    const result = await sendMail({
      subject: `New mailing list signup: ${email}`,
      replyTo: email,
      text: `${name} ${surname}\n${phone}\n${email}\nJoined the Isdore Solar mailing list.`,
    });
    emailed = result.sent;
    if (emailed) {
      await sendMail({
        to: email,
        subject: "You are on the Isdore Solar list",
        text: `Hi ${name},\n\nYou are subscribed to Isdore Solar trade offers and updates. Reply to this email if you want to be removed.\n`,
      });
    }
  } catch (error) {
    console.error("Newsletter email failed", error);
  }

  if (emailed) {
    await updateJson<Subscriber[]>("subscribers.json", [], (current) =>
      current.map((entry) => (entry.email === email ? { ...entry, emailed: true } : entry)),
    );
  }

  return NextResponse.json({
    ok: true,
    message: "You're on the list. Watch your inbox for trade offers and updates.",
  });
}
