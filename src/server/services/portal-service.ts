import "server-only";
import { codeMail, inviteMail } from "@/lib/portal-mail";
import { canResendCode, checkCode, CODE_LENGTH, codeExpiry, inviteExpiry, maskEmail, MAX_CODE_ATTEMPTS, MAX_CODE_SENDS, type CodeCheck } from "@/lib/portal";
import { routes } from "@/lib/routes";
import { blanksToNull } from "@/lib/validation/fields";
import type { PortalProfileInput } from "@/lib/validation/portal";
import { randomDigits, randomToken, sha256 } from "@/server/crypto";
import { db, transaction } from "@/server/db";
import { env } from "@/server/env";
import { sendSystemMail } from "@/server/mail/system-mailer";
import { assertCandidateOwner } from "./ownership";

export class InviteEmailMissingError extends Error {}

const codeHash = (inviteId: string, code: string) => sha256(`${inviteId}:${code}`);

const activeInviteWhere = (token: string, now: Date) => ({ tokenHash: sha256(token), expiresAt: { gt: now } });

// Creates a personal link for the candidate, replacing any earlier one, and mails it to them
export async function createInvite(matchmakerId: string, candidateId: string, now = new Date()) {
  await assertCandidateOwner(matchmakerId, candidateId);
  const candidate = await db.candidate.findUniqueOrThrow({
    where: { id: candidateId },
    select: { firstName: true, email: true, matchmaker: { select: { name: true, email: true } } },
  });
  if (!candidate.email) throw new InviteEmailMissingError();

  const token = randomToken();
  const expiresAt = inviteExpiry(now);
  await transaction(async (tx) => {
    await tx.candidateInvite.deleteMany({ where: { candidateId } });
    await tx.candidateInvite.create({ data: { candidateId, tokenHash: sha256(token), expiresAt } });
  });

  const url = `${env.APP_URL}${routes.portal(token)}`;
  await sendSystemMail({
    to: candidate.email,
    replyTo: candidate.matchmaker.email,
    ...inviteMail(candidate.firstName, candidate.matchmaker.name, url, expiresAt),
  });
  return { url, expiresAt };
}

export function getInviteStatus(matchmakerId: string, candidateId: string, now = new Date()) {
  return db.candidateInvite.findFirst({
    where: { candidateId, candidate: { matchmakerId }, expiresAt: { gt: now } },
    select: { createdAt: true, expiresAt: true },
  });
}

export async function revokeInvites(matchmakerId: string, candidateId: string) {
  await assertCandidateOwner(matchmakerId, candidateId);
  await db.candidateInvite.deleteMany({ where: { candidateId } });
}

// What the portal may show before sign-in: no details beyond a first name and a masked address
export async function findActiveInvite(token: string, now = new Date()) {
  const invite = await db.candidateInvite.findFirst({
    where: activeInviteWhere(token, now),
    select: { id: true, candidate: { select: { firstName: true, email: true, matchmaker: { select: { name: true } } } } },
  });
  if (!invite?.candidate.email) return null;
  return {
    id: invite.id,
    firstName: invite.candidate.firstName,
    matchmakerName: invite.candidate.matchmaker.name,
    emailHint: maskEmail(invite.candidate.email),
  };
}

export type CodeRequest = "sent" | "wait" | "exhausted" | "invalid";

export async function sendPortalCode(token: string, now = new Date()): Promise<CodeRequest> {
  const invite = await db.candidateInvite.findFirst({
    where: activeInviteWhere(token, now),
    select: { id: true, otpExpiresAt: true, otpSends: true, candidate: { select: { firstName: true, email: true } } },
  });
  if (!invite?.candidate.email) return "invalid";
  if (invite.otpSends >= MAX_CODE_SENDS) return "exhausted";
  if (!canResendCode(invite.otpExpiresAt, now)) return "wait";

  // Counted atomically, so the total number of guesses over the invite's life stays bounded
  const code = randomDigits(CODE_LENGTH);
  const { count } = await db.candidateInvite.updateMany({
    where: { id: invite.id, otpSends: { lt: MAX_CODE_SENDS } },
    data: { otpHash: codeHash(invite.id, code), otpExpiresAt: codeExpiry(now), otpAttempts: 0, otpSends: { increment: 1 } },
  });
  if (count === 0) return "exhausted";
  await sendSystemMail({ to: invite.candidate.email, ...codeMail(invite.candidate.firstName, code) });
  return "sent";
}

export type CodeVerification = { result: CodeCheck | "invalid"; inviteId?: string; attemptsLeft?: number };

// Checks a sign-in code; every attempt counts, and a correct code can be used once
export async function verifyPortalCode(token: string, code: string, now = new Date()): Promise<CodeVerification> {
  const invite = await db.candidateInvite.findFirst({
    where: activeInviteWhere(token, now),
    select: { id: true, otpHash: true, otpExpiresAt: true, otpAttempts: true },
  });
  if (!invite) return { result: "invalid" };

  const result = checkCode(invite, codeHash(invite.id, code), now);
  if (result === "expired" || result === "locked") return { result };

  // Counted atomically so parallel guesses cannot exceed the limit
  const { count } = await db.candidateInvite.updateMany({
    where: { id: invite.id, otpAttempts: { lt: MAX_CODE_ATTEMPTS } },
    data: { otpAttempts: { increment: 1 } },
  });
  if (count === 0) return { result: "locked" };
  if (result === "wrong") return { result, attemptsLeft: MAX_CODE_ATTEMPTS - invite.otpAttempts - 1 };

  await db.candidateInvite.update({ where: { id: invite.id }, data: { otpHash: null, otpExpiresAt: null } });
  return { result, inviteId: invite.id };
}

const portalProfileSelect = {
  id: true,
  side: true,
  firstName: true,
  birthDate: true,
  city: true,
  community: true,
  occupation: true,
  heightCm: true,
  phone: true,
  parentsInfo: true,
  about: true,
  lookingFor: true,
} as const;

// The candidate's own details, for a signed-in portal session on a still valid invite
export async function getPortalProfile(inviteId: string, now = new Date()) {
  const invite = await db.candidateInvite.findFirst({
    where: { id: inviteId, expiresAt: { gt: now } },
    select: { candidate: { select: portalProfileSelect } },
  });
  return invite?.candidate ?? null;
}

export type PortalProfile = NonNullable<Awaited<ReturnType<typeof getPortalProfile>>>;

export async function updatePortalProfile(inviteId: string, input: PortalProfileInput, now = new Date()): Promise<boolean> {
  const invite = await db.candidateInvite.findFirst({ where: { id: inviteId, expiresAt: { gt: now } }, select: { candidateId: true } });
  if (!invite) return false;
  await db.candidate.update({ where: { id: invite.candidateId }, data: blanksToNull(input) });
  return true;
}
