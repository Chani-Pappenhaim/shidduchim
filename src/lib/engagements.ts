import type { Side } from "@/generated/prisma/enums";
import { fullName } from "./candidates";
import { dayKey, todayKey } from "./format";

// Display and date rules for engaged and married couples, shared by server and client components

export type CoupleState = "engaged" | "married";

export const COUPLE_STATE_LABELS: Record<CoupleState, string> = {
  engaged: "מאורסים",
  married: "נשואים",
};

// A couple counts as married from the wedding day on
export function coupleState(weddingDate: Date | null, now = new Date()): CoupleState {
  return weddingDate && dayKey(weddingDate) <= todayKey(now) ? "married" : "engaged";
}

// Field label for the other partner of a candidate on the given side
export const PARTNER_NAME_LABELS: Record<Side, string> = { MALE: "שם הכלה", FEMALE: "שם החתן" };

type Person = { firstName: string; lastName: string };

type Couple = { male: Person | null; female: Person | null; partnerName: string | null };

// Both partners' names, using the free-text name for a partner outside the database
export function coupleNames({ male, female, partnerName }: Couple): [string, string] {
  const outside = partnerName ?? "";
  return [male ? fullName(male) : outside, female ? fullName(female) : outside];
}

export function coupleTitle(couple: Couple): string {
  const [male, female] = coupleNames(couple);
  return `${male} ו${female}`;
}

// Link that opens a prefilled all-day event in Google Calendar
export function weddingCalendarUrl(title: string, weddingDate: Date, venue?: string | null): string {
  const start = dayKey(weddingDate).replaceAll("-", "");
  const next = new Date(weddingDate.getTime() + 86_400_000);
  const end = dayKey(next).replaceAll("-", "");
  const params = new URLSearchParams({ action: "TEMPLATE", text: `חתונת ${title}`, dates: `${start}/${end}` });
  if (venue) params.set("location", venue);
  return `https://calendar.google.com/calendar/render?${params}`;
}

// First name and surname of a free-text name, so it can show as initials
export function personFromName(name: string): Person {
  const [firstName = "", ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

// How soon a wedding is, in words
export function weddingCountdown(days: number): string {
  if (days === 0) return "היום!";
  if (days === 1) return "מחר";
  if (days === 2) return "מחרתיים";
  return `בעוד ${days} ימים`;
}

// Splits date-ordered weddings into consecutive calendar months
export function groupByMonth<T extends { weddingDate: Date }>(items: T[]): { month: string; items: T[] }[] {
  const groups: { month: string; items: T[] }[] = [];
  for (const item of items) {
    const month = dayKey(item.weddingDate).slice(0, 7);
    const last = groups.at(-1);
    if (last?.month === month) last.items.push(item);
    else groups.push({ month, items: [item] });
  }
  return groups;
}
