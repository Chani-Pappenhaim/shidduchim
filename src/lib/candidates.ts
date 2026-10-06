import { CandidateStatus, Side } from "@/generated/prisma/enums";

// Hebrew display rules for candidates, shared by server and client components

export const SIDES = [Side.MALE, Side.FEMALE] as const;

export const SIDE_LABELS: Record<Side, { one: string; many: string; new: string; slug: string }> = {
  MALE: { one: "בחור", many: "בחורים", new: "בחור חדש", slug: "male" },
  FEMALE: { one: "בחורה", many: "בחורות", new: "בחורה חדשה", slug: "female" },
};

export function sideFromSlug(slug: string | undefined): Side {
  return slug === SIDE_LABELS.FEMALE.slug ? Side.FEMALE : Side.MALE;
}

export function oppositeSide(side: Side): Side {
  return side === Side.MALE ? Side.FEMALE : Side.MALE;
}

const STATUS_LABELS: Record<CandidateStatus, Record<Side, string>> = {
  AVAILABLE: { MALE: "פנוי", FEMALE: "פנויה" },
  IN_PROCESS: { MALE: "בתהליך", FEMALE: "בתהליך" },
  PAUSED: { MALE: "בהפסקה", FEMALE: "בהפסקה" },
  ENGAGED: { MALE: "מאורס", FEMALE: "מאורסת" },
};

export const CANDIDATE_STATUSES = Object.values(CandidateStatus);

export function statusLabel(status: CandidateStatus, side: Side): string {
  return STATUS_LABELS[status][side];
}

export function fullName(candidate: { firstName: string; lastName: string }): string {
  return `${candidate.firstName} ${candidate.lastName}`;
}

export function ageFrom(birthDate: Date | null | undefined, now = new Date()): number | null {
  if (!birthDate) return null;
  const age = now.getFullYear() - birthDate.getFullYear();
  const hadBirthday =
    now.getMonth() > birthDate.getMonth() || (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());
  return hadBirthday ? age : age - 1;
}

export function ageLabel(candidate: { side: Side; birthDate: Date | null }): string | null {
  const age = ageFrom(candidate.birthDate);
  return age === null ? null : `${candidate.side === Side.MALE ? "בן" : "בת"} ${age}`;
}

export function initials(candidate: { firstName: string; lastName: string }): string {
  return `${candidate.firstName.charAt(0)}${candidate.lastName.charAt(0)}`;
}
