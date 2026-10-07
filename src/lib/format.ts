const dateFormatter = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" });
// Whole-day dates (e.g. due dates) are stored as UTC midnight
const dayFormatter = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", timeZone: "UTC" });
const dayYearFormatter = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fullDayFormatter = new Intl.DateTimeFormat("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const hebrewDayFormatter = new Intl.DateTimeFormat("he-IL-u-ca-hebrew", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const monthFormatter = new Intl.DateTimeFormat("he-IL", { month: "long", year: "numeric", timeZone: "UTC" });
const dateTimeFormatter = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatDay(date: Date): string {
  return dayFormatter.format(date);
}

export function formatDayYear(date: Date): string {
  return dayYearFormatter.format(date);
}

export function formatFullDay(date: Date): string {
  return fullDayFormatter.format(date);
}

const HEBREW_LETTERS: [number, string][] = [
  [400, "ת"], [300, "ש"], [200, "ר"], [100, "ק"], [90, "צ"], [80, "פ"], [70, "ע"], [60, "ס"], [50, "נ"],
  [40, "מ"], [30, "ל"], [20, "כ"], [10, "י"], [9, "ט"], [8, "ח"], [7, "ז"], [6, "ו"], [5, "ה"], [4, "ד"], [3, "ג"], [2, "ב"], [1, "א"],
];

// Number in Hebrew letters as used in Hebrew dates, e.g. 15 -> ט״ו, 5787 -> תשפ״ז
export function hebrewNumeral(value: number): string {
  let rest = value % 1000;
  let letters = "";
  for (const [amount, letter] of HEBREW_LETTERS) {
    while (rest >= amount) {
      letters += letter;
      rest -= amount;
    }
  }
  // 15 and 16 avoid spelling a divine name
  letters = letters.replace("יה", "טו").replace("יו", "טז");
  return letters.length === 1 ? `${letters}׳` : `${letters.slice(0, -1)}״${letters.slice(-1)}`;
}

// The same whole day in the Hebrew calendar, e.g. for wedding dates: ח׳ בחשוון תשפ״ז
export function formatHebrewDay(date: Date): string {
  const parts = hebrewDayFormatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${hebrewNumeral(Number(part("day")))} ב${part("month")} ${hebrewNumeral(Number(part("year")))}`;
}

export function formatMonth(date: Date): string {
  return monthFormatter.format(date);
}

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

// Value for <input type="date">, in local time
export function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Calendar day of a stored whole-day date, comparable with todayKey()
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayKey(now = new Date()): string {
  return toDateInputValue(now);
}

// Today in the stored whole-day form, for date range queries
export function todayDate(now = new Date()): Date {
  return new Date(todayKey(now));
}

// Whole days from today until a stored whole-day date; negative once it has passed
export function daysUntil(date: Date, now = new Date()): number {
  const DAY_MS = 86_400_000;
  return Math.round((Date.parse(dayKey(date)) - Date.parse(todayKey(now))) / DAY_MS);
}
