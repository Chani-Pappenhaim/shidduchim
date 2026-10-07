import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { ReminderInput } from "@/lib/validation/reminder";
import { db } from "@/server/db";
import { NotFoundError } from "./ownership";

const personSelect = { firstName: true, lastName: true } as const;

const reminderSelect = {
  id: true,
  title: true,
  dueAt: true,
  doneAt: true,
  candidate: { select: { id: true, ...personSelect } },
  introduction: { select: { id: true, male: { select: personSelect }, female: { select: personSelect } } },
} satisfies Prisma.ReminderSelect;

export type ReminderItem = Prisma.ReminderGetPayload<{ select: typeof reminderSelect }>;

const DONE_REMINDERS_SHOWN = 20;

// Creates a reminder, optionally tied to one of the matchmaker's candidates or introductions
export async function createReminder(matchmakerId: string, input: ReminderInput) {
  const { candidateId, introductionId } = input;
  const [candidate, introduction] = await Promise.all([
    candidateId ? db.candidate.findFirst({ where: { id: candidateId, matchmakerId }, select: { id: true } }) : undefined,
    introductionId ? db.introduction.findFirst({ where: { id: introductionId, matchmakerId }, select: { id: true } }) : undefined,
  ]);
  if (candidate === null || introduction === null) throw new NotFoundError();
  await db.reminder.create({ data: { matchmakerId, ...input } });
}

// Open reminders, soonest first; `until` limits them to those due by that time
export function listOpenReminders(matchmakerId: string, filter: { until?: Date; candidateId?: string; introductionId?: string } = {}) {
  const { until, ...subject } = filter;
  return db.reminder.findMany({
    where: { matchmakerId, doneAt: null, ...subject, ...(until && { dueAt: { lte: until } }) },
    select: reminderSelect,
    orderBy: { dueAt: "asc" },
  });
}

export function listDoneReminders(matchmakerId: string) {
  return db.reminder.findMany({
    where: { matchmakerId, doneAt: { not: null } },
    select: reminderSelect,
    orderBy: { doneAt: "desc" },
    take: DONE_REMINDERS_SHOWN,
  });
}

export function setReminderDone(matchmakerId: string, reminderId: string, done: boolean) {
  return db.reminder.updateMany({ where: { id: reminderId, matchmakerId }, data: { doneAt: done ? new Date() : null } });
}

export function deleteReminder(matchmakerId: string, reminderId: string) {
  return db.reminder.deleteMany({ where: { id: reminderId, matchmakerId } });
}

// Open reminders of every matchmaker that fell due and were not yet sent in a digest
export function listRemindersToNotify(until: Date) {
  return db.reminder.findMany({
    where: { doneAt: null, notifiedAt: null, dueAt: { lte: until } },
    select: { ...reminderSelect, matchmakerId: true },
    orderBy: { dueAt: "asc" },
  });
}

export function markRemindersNotified(ids: string[]) {
  return db.reminder.updateMany({ where: { id: { in: ids } }, data: { notifiedAt: new Date() } });
}
