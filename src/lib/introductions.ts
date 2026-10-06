import { IntroductionStatus, Side } from "@/generated/prisma/enums";

// Hebrew display rules for introductions, shared by server and client components

export const INTRODUCTION_STATUSES = [
  IntroductionStatus.PROPOSED,
  IntroductionStatus.CHECKING,
  IntroductionStatus.MEETING,
  IntroductionStatus.ENGAGED,
  IntroductionStatus.DECLINED,
] as const;

export const INTRODUCTION_STATUS_LABELS: Record<IntroductionStatus, string> = {
  PROPOSED: "הוצע",
  CHECKING: "בבירורים",
  MEETING: "נפגשים",
  ENGAGED: "מאורסים",
  DECLINED: "ירד מהפרק",
};

// Statuses of an introduction that is still being worked on
export const OPEN_INTRODUCTION_STATUSES: IntroductionStatus[] = [
  IntroductionStatus.PROPOSED,
  IntroductionStatus.CHECKING,
  IntroductionStatus.MEETING,
];

// Orders a candidate and a partner from the other side into the stored couple shape
export function coupleOf(side: Side, candidateId: string, partnerId: string) {
  return side === Side.MALE ? { maleId: candidateId, femaleId: partnerId } : { maleId: partnerId, femaleId: candidateId };
}
