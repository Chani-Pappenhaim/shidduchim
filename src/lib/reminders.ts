import { fullName } from "./candidates";
import { toDateInputValue } from "./format";
import { routes } from "./routes";

export type ReminderTiming = "overdue" | "today" | "upcoming";

type Person = { firstName: string; lastName: string };

type Subject = {
  candidate: ({ id: string } & Person) | null;
  introduction: { id: string; male: Person; female: Person } | null;
};

// Due dates are whole days, stored as UTC midnight, so they are compared as calendar dates
export function reminderTiming(dueAt: Date, now = new Date()): ReminderTiming {
  const due = dueAt.toISOString().slice(0, 10);
  const today = toDateInputValue(now);
  if (due < today) return "overdue";
  return due === today ? "today" : "upcoming";
}

// Today's date in the same form as a stored due date, to fetch everything due by today
export function todayAsDueDate(now = new Date()): Date {
  return new Date(toDateInputValue(now));
}

// The candidate or couple a reminder is about, as a link target
export function reminderSubject({ candidate, introduction }: Subject): { href: string; label: string } | null {
  if (introduction) {
    return { href: routes.introduction(introduction.id), label: `${fullName(introduction.male)} ו${fullName(introduction.female)}` };
  }
  if (candidate) return { href: routes.candidate(candidate.id), label: fullName(candidate) };
  return null;
}
