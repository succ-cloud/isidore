import nodemailer from "nodemailer";

type MailInput = {
  subject: string;
  text: string;
  replyTo?: string;
  to?: string;
};

export async function sendMail(input: MailInput) {
  const host = process.env.SMTP_HOST;
  if (!host) return { sent: false as const, reason: "smtp-not-configured" as const };

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: input.to || process.env.STORE_EMAIL || "hello@isdoresolar.example",
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
  });

  return { sent: true as const };
}
