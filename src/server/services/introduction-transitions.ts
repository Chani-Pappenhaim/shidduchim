import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { IntroductionEventType, IntroductionStatus } from "@/generated/prisma/enums";
import { OPEN_INTRODUCTION_STATUSES } from "@/lib/introductions";

type Tx = Prisma.TransactionClient;

// Status changes shared by the introduction and engagement services; callers sync candidate statuses

export async function setIntroductionStatus(tx: Tx, introductionId: string, status: IntroductionStatus, message?: string) {
  await tx.introduction.update({
    where: { id: introductionId },
    data: { status, events: { create: { type: IntroductionEventType.STATUS_CHANGED, status, message } } },
  });
}

// Declines the open introductions of candidates who just got engaged; returns every candidate involved
export async function closeOpenIntroductions(tx: Tx, candidateIds: (string | null)[], exceptIntroductionId?: string) {
  const ids = candidateIds.filter((id): id is string => !!id);
  const open = await tx.introduction.findMany({
    where: {
      id: exceptIntroductionId ? { not: exceptIntroductionId } : undefined,
      status: { in: OPEN_INTRODUCTION_STATUSES },
      OR: [{ maleId: { in: ids } }, { femaleId: { in: ids } }],
    },
    select: { id: true, maleId: true, femaleId: true },
  });
  for (const introduction of open) await setIntroductionStatus(tx, introduction.id, IntroductionStatus.DECLINED, "נסגר בעקבות אירוסין");
  return open.flatMap((i) => [i.maleId, i.femaleId]);
}
