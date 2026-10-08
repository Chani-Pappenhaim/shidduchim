import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { IntroductionEventType, IntroductionStatus, Side } from "@/generated/prisma/enums";
import { isTaken } from "@/lib/candidates";
import { coupleOf, OPEN_INTRODUCTION_STATUSES } from "@/lib/introductions";
import type { IntroductionDetailsInput, IntroductionFilters, MeetingInput } from "@/lib/validation/introduction";
import { db, transaction } from "@/server/db";
import { candidateSummarySelect } from "./candidate-select";
import { syncCandidateStatuses } from "./candidate-status";
import { recordIntroductionEngagement, removeIntroductionEngagement } from "./engagement-service";
import { closeOpenIntroductions, setIntroductionStatus } from "./introduction-transitions";
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

// Creates an introduction between a candidate and a partner from the other side
export async function proposeIntroduction(matchmakerId: string, candidateId: string, partnerId: string) {
  const candidates = await db.candidate.findMany({
    where: { id: { in: [candidateId, partnerId] }, matchmakerId },
    select: { id: true, side: true, status: true },
  });
  const candidate = candidates.find((c) => c.id === candidateId);
  const partner = candidates.find((c) => c.id === partnerId);
  if (!candidate || !partner) throw new NotFoundError();
  if (candidate.side === partner.side) throw new IntroductionRuleError("אפשר להציע רק בחור ובחורה");
  if (isTaken(candidate.status) || isTaken(partner.status)) throw new IntroductionRuleError("אי אפשר להציע למי שכבר מאורס/ת או נשוי/אה");

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
  const [items, total, groups] = await Promise.all([
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

// Open introductions that moved most recently
export function listActiveIntroductions(matchmakerId: string, take: number) {
  return db.introduction.findMany({
    where: { matchmakerId, status: { in: OPEN_INTRODUCTION_STATUSES } },
    select: introductionSummarySelect,
    orderBy: { updatedAt: "desc" },
    take,
  });
}

export function countOpenIntroductions(matchmakerId: string) {
  return db.introduction.count({ where: { matchmakerId, status: { in: OPEN_INTRODUCTION_STATUSES } } });
}

export function getIntroduction(matchmakerId: string, id: string) {
  return db.introduction.findFirst({
    where: { id, matchmakerId },
    select: {
      ...introductionSummarySelect,
      note: true,
      engagement: { select: { id: true, weddingDate: true } },
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
// an engagement records the couple and closes their other open introductions
export function changeIntroductionStatus(matchmakerId: string, introductionId: string, status: IntroductionStatus) {
  return transaction(async (tx) => {
    const introduction = await assertIntroductionOwner(tx, matchmakerId, introductionId);
    if (introduction.status === status) return;
    const engaged = status === IntroductionStatus.ENGAGED;
    if (engaged) await recordIntroductionEngagement(tx, matchmakerId, introduction);
    else if (introduction.status === IntroductionStatus.ENGAGED) await removeIntroductionEngagement(tx, introductionId);
    await setIntroductionStatus(tx, introductionId, status);

    const couple = [introduction.maleId, introduction.femaleId];
    const closed = engaged ? await closeOpenIntroductions(tx, couple, introductionId) : [];
    await syncCandidateStatuses(tx, [...couple, ...closed]);
  });
}

// Records a meeting; a first meeting moves an early-stage introduction to "meeting"
export function addMeeting(matchmakerId: string, input: MeetingInput) {
  const { introductionId, ...meeting } = input;
  return transaction(async (tx) => {
    const introduction = await assertIntroductionOwner(tx, matchmakerId, introductionId);
    await tx.meeting.create({ data: { introductionId, ...meeting } });
    await tx.introductionEvent.create({ data: { introductionId, type: IntroductionEventType.MEETING_ADDED, message: meeting.location } });
    const early: IntroductionStatus[] = [IntroductionStatus.PROPOSED, IntroductionStatus.CHECKING];
    if (early.includes(introduction.status)) {
      await setIntroductionStatus(tx, introductionId, IntroductionStatus.MEETING);
      await syncCandidateStatuses(tx, [introduction.maleId, introduction.femaleId]);
    }
  });
}

export function deleteMeeting(matchmakerId: string, meetingId: string) {
  return db.meeting.deleteMany({ where: { id: meetingId, introduction: { matchmakerId } } });
}

export function deleteIntroduction(matchmakerId: string, introductionId: string) {
  return transaction(async (tx) => {
    const introduction = await assertIntroductionOwner(tx, matchmakerId, introductionId);
    await removeIntroductionEngagement(tx, introductionId);
    await tx.introduction.delete({ where: { id: introductionId } });
    await syncCandidateStatuses(tx, [introduction.maleId, introduction.femaleId]);
  });
}
