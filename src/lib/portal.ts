// Rules for the candidate portal: invite links and one-time sign-in codes

export const INVITE_TTL_DAYS = 14;
export const CODE_LENGTH = 6;
export const CODE_TTL_MINUTES = 10;
export const CODE_RESEND_SECONDS = 60;
export const MAX_CODE_ATTEMPTS = 5;

const MINUTE = 60_000;

export type StoredCode = { otpHash: string | null; otpExpiresAt: Date | null; otpAttempts: number };

export type CodeCheck = "ok" | "wrong" | "expired" | "locked";

export function inviteExpiry(now: Date): Date {
  return new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * MINUTE);
}

export function codeExpiry(now: Date): Date {
  return new Date(now.getTime() + CODE_TTL_MINUTES * MINUTE);
}

// A new code may be requested once the previous one is a minute old
export function canResendCode(otpExpiresAt: Date | null, now: Date): boolean {
  if (!otpExpiresAt) return true;
  const issuedAt = otpExpiresAt.getTime() - CODE_TTL_MINUTES * MINUTE;
  return now.getTime() - issuedAt >= CODE_RESEND_SECONDS * 1000;
}

// Compares a submitted code (already hashed) with the stored one
export function checkCode(stored: StoredCode, submittedHash: string, now: Date): CodeCheck {
  if (!stored.otpHash || !stored.otpExpiresAt || stored.otpExpiresAt <= now) return "expired";
  if (stored.otpAttempts >= MAX_CODE_ATTEMPTS) return "locked";
  return stored.otpHash === submittedHash ? "ok" : "wrong";
}

// Shows enough of an address to recognise it without exposing it, e.g. "ra•••@example.com"
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "•••";
  return `${local.slice(0, Math.min(2, Math.max(1, local.length - 1)))}•••@${domain}`;
}
