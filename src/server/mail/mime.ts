import "server-only";
import nodemailer from "nodemailer";
import type { MailMessage } from "./system-mailer";

const composer = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: "unix" });

// Encodes a message as a raw RFC 822 email, as mail APIs expect
export async function buildMime(message: MailMessage & { from: { name: string; address: string } }): Promise<Buffer> {
  const info = await composer.sendMail(message);
  return info.message as Buffer;
}
