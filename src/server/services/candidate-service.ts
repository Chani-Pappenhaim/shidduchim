import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { Side } from "@/generated/prisma/enums";
import type { CandidateFilters, CandidateInput } from "@/lib/validation/candidate";
import { db } from "@/server/db";
import { removeStoredFiles } from "./candidate-file-service";
import { assertCandidateOwner } from "./ownership";

export const CANDIDATES_PAGE_SIZE = 24;

const SEARCH_FIELDS = ["firstName", "lastName", "city", "community", "occupation"] as const;

// Every term must match at least one searchable field, so "משה כהן" finds Moshe Cohen
function searchWhere(q: string | undefined): Prisma.CandidateWhereInput {
  const terms = q?.split(/\s+/).filter(Boolean) ?? [];
  return {
    AND: terms.map((term) => ({
      OR: SEARCH_FIELDS.map((field) => ({ [field]: { contains: term, mode: "insensitive" } })),
    })),
  };
}

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

export async function listCandidates(matchmakerId: string, side: Side, filters: CandidateFilters) {
  const where: Prisma.CandidateWhereInput = { matchmakerId, side, status: filters.status, ...searchWhere(filters.q) };
  const [items, total] = await db.$transaction([
    db.candidate.findMany({
      where,
      select: candidateSummarySelect,
      orderBy: [{ updatedAt: "desc" }],
      skip: (filters.page - 1) * CANDIDATES_PAGE_SIZE,
      take: CANDIDATES_PAGE_SIZE,
    }),
    db.candidate.count({ where }),
  ]);
  return { items, total, pageCount: Math.max(1, Math.ceil(total / CANDIDATES_PAGE_SIZE)) };
}

export async function countCandidatesBySide(matchmakerId: string): Promise<Record<Side, number>> {
  const groups = await db.candidate.groupBy({ by: ["side"], where: { matchmakerId }, _count: true });
  const counts: Record<Side, number> = { MALE: 0, FEMALE: 0 };
  for (const group of groups) counts[group.side] = group._count;
  return counts;
}

export function getCandidateSummary(matchmakerId: string, id: string) {
  return db.candidate.findFirst({ where: { id, matchmakerId }, select: candidateSummarySelect });
}

export function getCandidate(matchmakerId: string, id: string) {
  return db.candidate.findFirst({
    where: { id, matchmakerId },
    include: {
      files: { orderBy: { kind: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
}

export type CandidateDetails = NonNullable<Awaited<ReturnType<typeof getCandidate>>>;

export function createCandidate(matchmakerId: string, input: CandidateInput) {
  return db.candidate.create({ data: { ...input, matchmakerId }, select: { id: true } });
}

export async function updateCandidate(matchmakerId: string, id: string, input: CandidateInput) {
  await assertCandidateOwner(matchmakerId, id);
  return db.candidate.update({ where: { id }, data: input, select: { id: true, side: true } });
}

export async function deleteCandidate(matchmakerId: string, id: string) {
  await assertCandidateOwner(matchmakerId, id);
  const deleted = await db.candidate.delete({ where: { id }, select: { side: true, files: { select: { storageKey: true } } } });
  await removeStoredFiles(deleted.files.map((f) => f.storageKey));
  return deleted;
}
