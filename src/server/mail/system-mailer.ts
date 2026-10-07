import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/server/env";

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

let transporter: Transporter | undefined;

function smtp(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
  });
  return transporter;
}

// Sends mail from the app's own address; without SMTP settings the message is printed to the server log
export async function sendSystemMail(message: MailMessage): Promise<void> {
  if (!env.SMTP_HOST) {
    console.info(`[mail] to=${message.to} subject=${message.subject}\n${message.text}`);
    return;
  }
  await smtp().sendMail({ from: env.SMTP_FROM, ...message });
}
