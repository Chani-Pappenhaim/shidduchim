import "server-only";
import { decrypt, encrypt } from "@/server/crypto";
import { db } from "@/server/db";
import { GOOGLE_PROVIDER, MailGrantRevokedError, sendWithGmail } from "@/server/mail/google";
import { buildMime } from "@/server/mail/mime";
import type { MailMessage } from "@/server/mail/system-mailer";

export { MailGrantRevokedError };

export class NoMailConnectionError extends Error {}

export function getMailConnection(matchmakerId: string) {
  return db.mailConnection.findUnique({ where: { matchmakerId }, select: { provider: true, email: true } });
}

export async function saveGoogleConnection(matchmakerId: string, { email, refreshToken }: { email: string; refreshToken: string }) {
  const data = { provider: GOOGLE_PROVIDER, email, encryptedRefreshToken: encrypt(refreshToken) };
  await db.mailConnection.upsert({ where: { matchmakerId }, create: { matchmakerId, ...data }, update: data });
}

export async function deleteMailConnection(matchmakerId: string) {
  await db.mailConnection.deleteMany({ where: { matchmakerId } });
}

// Sends from the matchmaker's connected mailbox; a revoked grant is dropped so the matchmaker can reconnect
export async function sendAsMatchmaker(matchmakerId: string, message: MailMessage) {
  const connection = await db.mailConnection.findUnique({
    where: { matchmakerId },
    select: { email: true, encryptedRefreshToken: true, matchmaker: { select: { name: true } } },
  });
  if (!connection) throw new NoMailConnectionError();
  const mime = await buildMime({ ...message, from: { name: connection.matchmaker.name, address: connection.email } });
  try {
    await sendWithGmail(decrypt(connection.encryptedRefreshToken), mime);
  } catch (error) {
    if (error instanceof MailGrantRevokedError) await deleteMailConnection(matchmakerId);
    throw error;
  }
  return connection.email;
}
