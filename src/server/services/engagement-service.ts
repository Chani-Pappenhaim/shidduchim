import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { CandidateStatus, IntroductionStatus, Side } from "@/generated/prisma/enums";
import { fullName } from "@/lib/candidates";
import type { CoupleState } from "@/lib/engagements";
import { todayDate } from "@/lib/format";
import type { EngagementDetailsInput, EngagementFilters, NewEngagementInput } from "@/lib/validation/engagement";
import { db, transaction } from "@/server/db";
import { candidateSummarySelect } from "./candidate-select";
import { syncCandidateStatuses } from "./candidate-status";
import { closeOpenIntroductions, setIntroductionStatus } from "./introduction-transitions";
import { NotFoundError } from "./ownership";

type Tx = Prisma.TransactionClient;

export const ENGAGEMENTS_PAGE_SIZE = 24;

export class EngagementRuleError extends Error {}

const engagementSelect = {
  id: true,
  partnerName: true,
  byMatchmaker: true,
  madeBy: true,
  engagedAt: true,
  weddingDate: true,
  weddingVenue: true,
  note: true,
  introductionId: true,
  male: { select: candidateSummarySelect },
  female: { select: candidateSummarySelect },
} satisfies Prisma.EngagementSelect;

export type EngagementItem = Prisma.EngagementGetPayload<{ select: typeof engagementSelect }>;

export type WeddingItem = EngagementItem & { weddingDate: Date };

// Only rows filtered on a non-null wedding date may be narrowed this way
const asWeddings = (items: EngagementItem[]) => items as WeddingItem[];

function stateWhere(state: CoupleState, today: Date): Prisma.EngagementWhereInput {
  return state === "married" ? { weddingDate: { lte: today } } : { OR: [{ weddingDate: null }, { weddingDate: { gt: today } }] };
}

function partnerOf(candidateId: string): Prisma.EngagementWhereInput {
  return { OR: [{ maleId: candidateId }, { femaleId: candidateId }] };
}

export async function listEngagements(matchmakerId: string, filters: EngagementFilters) {
  const today = todayDate();
  const source: Prisma.EngagementWhereInput = { matchmakerId, ...(filters.by === "me" && { byMatchmaker: true }) };
  const where = { ...source, ...(filters.state && stateWhere(filters.state, today)) };
  const [items, total, engaged, married, everyone, mine] = await Promise.all([
    db.engagement.findMany({
      where,
      select: engagementSelect,
      orderBy: { engagedAt: "desc" },
      skip: (filters.page - 1) * ENGAGEMENTS_PAGE_SIZE,
      take: ENGAGEMENTS_PAGE_SIZE,
    }),
    db.engagement.count({ where }),
    db.engagement.count({ where: { ...source, ...stateWhere("engaged", today) } }),
    db.engagement.count({ where: { ...source, ...stateWhere("married", today) } }),
    db.engagement.count({ where: { matchmakerId } }),
    db.engagement.count({ where: { matchmakerId, byMatchmaker: true } }),
  ]);
  return {
    items,
    total,
    counts: { engaged, married, everyone, mine },
    pageCount: Math.max(1, Math.ceil(total / ENGAGEMENTS_PAGE_SIZE)),
  };
}

export function getEngagement(matchmakerId: string, id: string) {
  return db.engagement.findFirst({ where: { id, matchmakerId }, select: { ...engagementSelect, createdAt: true } });
}

export type EngagementDetails = NonNullable<Awaited<ReturnType<typeof getEngagement>>>;

export function engagementOf(matchmakerId: string, candidateId: string) {
  return db.engagement.findFirst({ where: { matchmakerId, ...partnerOf(candidateId) }, select: engagementSelect });
}

export function engagementOfIntroduction(matchmakerId: string, introductionId: string) {
  return db.engagement.findFirst({ where: { matchmakerId, introductionId }, select: { id: true, weddingDate: true } });
}

// Records that one of the matchmaker's candidates got engaged to someone outside the database
export function createEngagement(matchmakerId: string, input: NewEngagementInput) {
  const { candidateId, ...data } = input;
  return transaction(async (tx) => {
    const candidate = await tx.candidate.findFirst({ where: { id: candidateId, matchmakerId }, select: { id: true, side: true } });
    if (!candidate) throw new NotFoundError();
    if (await tx.engagement.findFirst({ where: partnerOf(candidate.id), select: { id: true } })) {
      throw new EngagementRuleError("כבר רשומים אירוסין בכרטיס הזה");
    }
    const own = candidate.side === Side.MALE ? { maleId: candidate.id } : { femaleId: candidate.id };
    const created = await tx.engagement.create({ data: { matchmakerId, ...own, ...data }, select: { id: true } });
    const touched = await closeOpenIntroductions(tx, [candidate.id]);
    await syncCandidateStatuses(tx, [candidate.id, ...touched]);
    return created;
  });
}

// Engagement of a couple the matchmaker introduced; refuses a partner who is already engaged elsewhere
export async function recordIntroductionEngagement(tx: Tx, matchmakerId: string, introduction: { id: string; maleId: string; femaleId: string }) {
  const taken = await tx.engagement.findFirst({
    where: {
      AND: [
        { OR: [{ maleId: introduction.maleId }, { femaleId: introduction.femaleId }] },
        { OR: [{ introductionId: null }, { introductionId: { not: introduction.id } }] },
      ],
    },
    select: { male: { select: { id: true, firstName: true, lastName: true } }, female: { select: { id: true, firstName: true, lastName: true } } },
  });
  if (taken) {
    const person = taken.male?.id === introduction.maleId ? taken.male : taken.female;
    throw new EngagementRuleError(`${person ? fullName(person) : "אחד מבני הזוג"} כבר רשום/ה כמאורס/ת`);
  }
  await tx.engagement.upsert({
    where: { introductionId: introduction.id },
    create: {
      matchmakerId,
      maleId: introduction.maleId,
      femaleId: introduction.femaleId,
      introductionId: introduction.id,
      byMatchmaker: true,
      engagedAt: todayDate(),
    },
    update: {},
  });
}

export async function removeIntroductionEngagement(tx: Tx, introductionId: string) {
  await tx.engagement.deleteMany({ where: { introductionId } });
}

function stripUndefined<T extends object>(data: T): Partial<T> {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export function updateEngagement(matchmakerId: string, input: EngagementDetailsInput) {
  const { engagementId, partnerName, ...data } = input;
  return transaction(async (tx) => {
    const found = await tx.engagement.findFirst({ where: { id: engagementId, matchmakerId }, select: { maleId: true, femaleId: true } });
    if (!found) throw new NotFoundError();
    const hasOutsidePartner = !found.maleId || !found.femaleId;
    // Blank optional fields clear the saved value
    const cleared = { weddingDate: null, weddingVenue: null, madeBy: null, note: null };
    await tx.engagement.update({
      where: { id: engagementId },
      data: { ...cleared, ...stripUndefined(data), ...(hasOutsidePartner && partnerName && { partnerName }) },
    });
    await syncCandidateStatuses(tx, [found.maleId, found.femaleId]);
  });
}

// Removes a broken-off engagement; the introduction it came from is marked as declined
export function cancelEngagement(matchmakerId: string, engagementId: string) {
  return transaction(async (tx) => {
    const found = await tx.engagement.findFirst({
      where: { id: engagementId, matchmakerId },
      select: { maleId: true, femaleId: true, introductionId: true },
    });
    if (!found) throw new NotFoundError();
    await tx.engagement.delete({ where: { id: engagementId } });
    if (found.introductionId) await setIntroductionStatus(tx, found.introductionId, IntroductionStatus.DECLINED, "האירוסין בוטלו");
    await syncCandidateStatuses(tx, [found.maleId, found.femaleId]);
  });
}

// Keeps a couple's record when one partner's card is deleted, by remembering that partner's name
export async function releaseCandidateEngagement(tx: Tx, candidateId: string) {
  const found = await tx.engagement.findFirst({
    where: partnerOf(candidateId),
    select: { id: true, maleId: true, femaleId: true, male: { select: { firstName: true, lastName: true } }, female: { select: { firstName: true, lastName: true } } },
  });
  if (!found) return;
  const leaving = found.maleId === candidateId ? found.male : found.female;
  const staying = found.maleId === candidateId ? found.femaleId : found.maleId;
  if (!staying) await tx.engagement.delete({ where: { id: found.id } });
  else if (leaving) await tx.engagement.update({ where: { id: found.id }, data: { partnerName: fullName(leaving) } });
}

// Wedding board: upcoming weddings by date, and engaged couples still without a date
export async function listWeddings(matchmakerId: string, { onlyMine }: { onlyMine: boolean }) {
  const where: Prisma.EngagementWhereInput = { matchmakerId, ...(onlyMine && { byMatchmaker: true }) };
  const [upcoming, undated] = await Promise.all([
    db.engagement.findMany({ where: { ...where, weddingDate: { gte: todayDate() } }, select: engagementSelect, orderBy: { weddingDate: "asc" } }),
    db.engagement.findMany({ where: { ...where, weddingDate: null }, select: engagementSelect, orderBy: { engagedAt: "desc" } }),
  ]);
  return { upcoming: asWeddings(upcoming), undated };
}

export async function listUpcomingWeddings(matchmakerId: string, take: number) {
  const items = await db.engagement.findMany({
    where: { matchmakerId, byMatchmaker: true, weddingDate: { gte: todayDate() } },
    select: engagementSelect,
    orderBy: { weddingDate: "asc" },
    take,
  });
  return asWeddings(items);
}

// Weddings of the matchmakers' own matches falling on any of the given days, across all matchmakers
export async function listWeddingsOn(days: Date[]) {
  const items = await db.engagement.findMany({
    where: { byMatchmaker: true, weddingDate: { in: days } },
    select: { ...engagementSelect, matchmakerId: true },
    orderBy: { weddingDate: "asc" },
  });
  return items as (WeddingItem & { matchmakerId: string })[];
}

export function engagementsThisYear(matchmakerId: string) {
  const startOfYear = new Date(Date.UTC(new Date().getFullYear(), 0, 1));
  return db.engagement.count({ where: { matchmakerId, byMatchmaker: true, engagedAt: { gte: startOfYear } } });
}

// Turns engaged candidates into married ones once their wedding day arrives; run daily
export async function promoteDueWeddings() {
  const due = await db.engagement.findMany({
    where: { weddingDate: { lte: todayDate() }, OR: [{ male: { status: CandidateStatus.ENGAGED } }, { female: { status: CandidateStatus.ENGAGED } }] },
    select: { maleId: true, femaleId: true },
  });
  const ids = due.flatMap((e) => [e.maleId, e.femaleId]).filter((id): id is string => !!id);
  const { count } = await db.candidate.updateMany({ where: { id: { in: ids }, status: CandidateStatus.ENGAGED }, data: { status: CandidateStatus.MARRIED } });
  return count;
}
