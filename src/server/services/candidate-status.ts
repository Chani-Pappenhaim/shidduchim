import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { CandidateStatus, IntroductionStatus } from "@/generated/prisma/enums";
import { coupleState } from "@/lib/engagements";

type Tx = Prisma.TransactionClient;

// Derives each candidate's status from their engagement and introductions after any change to them
export async function syncCandidateStatuses(tx: Tx, candidateIds: Iterable<string | null>) {
  for (const id of new Set(candidateIds)) {
    if (!id) continue;
    const [candidate, introductions, engagement] = await Promise.all([
      tx.candidate.findUniqueOrThrow({ where: { id }, select: { status: true } }),
      tx.introduction.findMany({ where: { OR: [{ maleId: id }, { femaleId: id }] }, select: { status: true } }),
      tx.engagement.findFirst({ where: { OR: [{ maleId: id }, { femaleId: id }] }, select: { weddingDate: true } }),
    ]);
    const meeting = introductions.some((i) => i.status === IntroductionStatus.MEETING);
    const released: CandidateStatus[] = [CandidateStatus.ENGAGED, CandidateStatus.MARRIED, CandidateStatus.IN_PROCESS];
    let next = candidate.status;
    if (engagement) next = coupleState(engagement.weddingDate) === "married" ? CandidateStatus.MARRIED : CandidateStatus.ENGAGED;
    else if (meeting) next = CandidateStatus.IN_PROCESS;
    else if (released.includes(candidate.status)) next = CandidateStatus.AVAILABLE;
    if (next !== candidate.status) await tx.candidate.update({ where: { id }, data: { status: next } });
  }
}
