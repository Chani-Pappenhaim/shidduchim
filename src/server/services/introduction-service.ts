import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { CandidateStatus, IntroductionEventType, IntroductionStatus, Side } from "@/generated/prisma/enums";
import { coupleOf, OPEN_INTRODUCTION_STATUSES } from "@/lib/introductions";
import type { IntroductionDetailsInput, IntroductionFilters, MeetingInput } from "@/lib/validation/introduction";
import { db } from "@/server/db";
import { candidateSummarySelect } from "./candidate-service";
import { NotFoundError } from "./ownership";

type Tx = Prisma.TransactionClient;

export const INTRODUCTIONS_PAGE_SIZE = 30;

export class IntroductionRuleError extends Error {}

const introductionSummarySelect = {
  id: true,
  status: true,
  proposedBy: true,
  createdAt: true,
  updatedAt: true,
  male: { select: candidateSummarySelect },
  female: { select: candidateSummarySelect },
} satisfies Prisma.IntroductionSelect;

export type IntroductionSummary = Prisma.IntroductionGetPayload<{ select: typeof introductionSummarySelect }>;

async function assertIntroductionOwner(tx: Tx, matchmakerId: string, id: string) {
  const found = await tx.introduction.findFirst({ where: { id, matchmakerId }, select: { id: true, status: true, maleId: true, femaleId: true } });
  if (!found) throw new NotFoundError();
  return found;
}

// Derives a candidate's status from their introductions after any introduction change
async function syncCandidateStatuses(tx: Tx, candidateIds: string[]) {
  for (const id of candidateIds) {
    const [candidate, introductions] = await Promise.all([
      tx.candidate.findUniqueOrThrow({ where: { id }, select: { status: true } }),
      tx.introduction.findMany({ where: { OR: [{ maleId: id }, { femaleId: id }] }, select: { status: true } }),
    ]);
    const statuses = new Set(introductions.map((i) => i.status));
    let next = candidate.status;
    if (statuses.has(IntroductionStatus.ENGAGED)) next = CandidateStatus.ENGAGED;
    else if (statuses.has(IntroductionStatus.MEETING)) next = CandidateStatus.IN_PROCESS;
    else if (candidate.status === CandidateStatus.ENGAGED || candidate.status === CandidateStatus.IN_PROCESS) next = CandidateStatus.AVAILABLE;
    if (next !== candidate.status) await tx.candidate.update({ where: { id }, data: { status: next } });
  }
}

async function setStatus(tx: Tx, introductionId: string, status: IntroductionStatus, message?: string) {
  await tx.introduction.update({
    where: { id: introductionId },
    data: {
      status,
      engagedAt: status === IntroductionStatus.ENGAGED ? new Date() : null,
      events: { create: { type: IntroductionEventType.STATUS_CHANGED, status, message } },
    },
  });
}

// Creates an introduction between a candidate and a partner from the other side
export async function proposeIntroduction(matchmakerId: string, candidateId: string, partnerId: string) {
  const candidates = await db.candidate.findMany({ where: { id: { in: [candidateId, partnerId] }, matchmakerId }, select: { id: true, side: true } });
  const candidate = candidates.find((c) => c.id === candidateId);
  const partner = candidates.find((c) => c.id === partnerId);
  if (!candidate || !partner) throw new NotFoundError();
  if (candidate.side === partner.side) throw new IntroductionRuleError("אפשר להציע רק בחור ובחורה");

  try {
    return await db.introduction.create({
      data: {
        matchmakerId,
        ...coupleOf(candidate.side, candidate.id, partner.id),
        events: { create: { type: IntroductionEventType.CREATED, status: IntroductionStatus.PROPOSED } },
      },
      select: { id: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new IntroductionRuleError("ההצעה הזאת כבר קיימת");
    }
    throw error;
  }
}

export async function listIntroductions(matchmakerId: string, filters: IntroductionFilters) {
  const where: Prisma.IntroductionWhereInput = { matchmakerId, status: filters.status };
  const [items, total, groups] = await db.$transaction([
    db.introduction.findMany({
      where,
      select: introductionSummarySelect,
      orderBy: { updatedAt: "desc" },
      skip: (filters.page - 1) * INTRODUCTIONS_PAGE_SIZE,
      take: INTRODUCTIONS_PAGE_SIZE,
    }),
    db.introduction.count({ where }),
    db.introduction.groupBy({ by: ["status"], where: { matchmakerId }, orderBy: { status: "asc" }, _count: true }),
  ]);
  const counts = Object.fromEntries(groups.map((g) => [g.status, g._count])) as Partial<Record<IntroductionStatus, number>>;
  return { items, total, counts, pageCount: Math.max(1, Math.ceil(total / INTRODUCTIONS_PAGE_SIZE)) };
}

export function listSuccesses(matchmakerId: string) {
  return db.introduction.findMany({
    where: { matchmakerId, status: IntroductionStatus.ENGAGED },
    select: { ...introductionSummarySelect, engagedAt: true },
    orderBy: { engagedAt: "desc" },
  });
}

export type Success = Awaited<ReturnType<typeof listSuccesses>>[number];

// Open introductions that moved most recently
export function listActiveIntroductions(matchmakerId: string, take: number) {
  return db.introduction.findMany({
    where: { matchmakerId, status: { in: OPEN_INTRODUCTION_STATUSES } },
    select: introductionSummarySelect,
    orderBy: { updatedAt: "desc" },
    take,
  });
}

export async function introductionStats(matchmakerId: string) {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const [open, engagedThisYear] = await Promise.all([
    db.introduction.count({ where: { matchmakerId, status: { in: OPEN_INTRODUCTION_STATUSES } } }),
    db.introduction.count({ where: { matchmakerId, status: IntroductionStatus.ENGAGED, engagedAt: { gte: startOfYear } } }),
  ]);
  return { open, engagedThisYear };
}

export function getIntroduction(matchmakerId: string, id: string) {
  return db.introduction.findFirst({
    where: { id, matchmakerId },
    select: {
      ...introductionSummarySelect,
      note: true,
      engagedAt: true,
      meetings: { orderBy: { date: "desc" } },
      events: { orderBy: { createdAt: "desc" } },
    },
  });
}

export type IntroductionDetails = NonNullable<Awaited<ReturnType<typeof getIntroduction>>>;

// The candidate's introductions, each with the partner from the other side
export async function introductionsOf(matchmakerId: string, candidateId: string, side: Side) {
  const own = side === Side.MALE ? { maleId: candidateId } : { femaleId: candidateId };
  const rows = await db.introduction.findMany({
    where: { matchmakerId, ...own },
    select: introductionSummarySelect,
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(({ male, female, ...introduction }) => ({ ...introduction, partner: side === Side.MALE ? female : male }));
}

export type CandidateIntroduction = Awaited<ReturnType<typeof introductionsOf>>[number];

export async function updateIntroductionDetails(matchmakerId: string, input: IntroductionDetailsInput) {
  const { introductionId, ...data } = input;
  await assertIntroductionOwner(db, matchmakerId, introductionId);
  await db.introduction.update({ where: { id: introductionId }, data });
}

// Moves an introduction to a new status and keeps both candidates' statuses in line;
// an engagement closes the couple's other open introductions
export function changeIntroductionStatus(matchmakerId: string, introductionId: string, status: IntroductionStatus) {
  return db.$transaction(async (tx) => {
    const introduction = await assertIntroductionOwner(tx, matchmakerId, introductionId);
    if (introduction.status === status) return;
    await setStatus(tx, introductionId, status);

    const touched = new Set([introduction.maleId, introduction.femaleId]);
    if (status === IntroductionStatus.ENGAGED) {
      const others = await tx.introduction.findMany({
        where: {
          id: { not: introductionId },
          status: { in: OPEN_INTRODUCTION_STATUSES },
          OR: [{ maleId: introduction.maleId }, { femaleId: introduction.femaleId }],
        },
        select: { id: true, maleId: true, femaleId: true },
      });
      for (const other of others) {
        await setStatus(tx, other.id, IntroductionStatus.DECLINED, "נסגר בעקבות אירוסין");
        touched.add(other.maleId).add(other.femaleId);
      }
    }
    await syncCandidateStatuses(tx, [...touched]);
  });
}

// Records a meeting; a first meeting moves an early-stage introduction to "meeting"
export function addMeeting(matchmakerId: string, input: MeetingInput) {
  const { introductionId, ...meeting } = input;
  return db.$transaction(async (tx) => {
    const introduction = await assertIntroductionOwner(tx, matchmakerId, introductionId);
    await tx.meeting.create({ data: { introductionId, ...meeting } });
    await tx.introductionEvent.create({ data: { introductionId, type: IntroductionEventType.MEETING_ADDED, message: meeting.location } });
    const early: IntroductionStatus[] = [IntroductionStatus.PROPOSED, IntroductionStatus.CHECKING];
    if (early.includes(introduction.status)) {
      await setStatus(tx, introductionId, IntroductionStatus.MEETING);
      await syncCandidateStatuses(tx, [introduction.maleId, introduction.femaleId]);
    }
  });
}

export function deleteMeeting(matchmakerId: string, meetingId: string) {
  return db.meeting.deleteMany({ where: { id: meetingId, introduction: { matchmakerId } } });
}

export function deleteIntroduction(matchmakerId: string, introductionId: string) {
  return db.$transaction(async (tx) => {
    const introduction = await assertIntroductionOwner(tx, matchmakerId, introductionId);
    await tx.introduction.delete({ where: { id: introductionId } });
    await syncCandidateStatuses(tx, [introduction.maleId, introduction.femaleId]);
  });
}
