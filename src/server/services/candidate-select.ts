import "server-only";
import type { Prisma } from "@/generated/prisma/client";

// Fields shown wherever a candidate appears as a card, row or avatar
export const candidateSummarySelect = {
  id: true,
  side: true,
  firstName: true,
  lastName: true,
  birthDate: true,
  city: true,
  community: true,
  occupation: true,
  status: true,
  files: { where: { kind: "PHOTO" }, select: { id: true } },
} satisfies Prisma.CandidateSelect;

export type CandidateSummary = Prisma.CandidateGetPayload<{ select: typeof candidateSummarySelect }>;
