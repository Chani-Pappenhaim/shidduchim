import { coupleTitle, weddingCountdown } from "./engagements";
import { daysUntil, formatDay, formatHebrewDay } from "./format";
import { type MailBody, type MailSection, renderMail } from "./mail-content";
import { reminderSubject, reminderTiming } from "./reminders";
import { routes } from "./routes";

type Person = { firstName: string; lastName: string };

export type DigestReminder = Parameters<typeof reminderSubject>[0] & { title: string; dueAt: Date };

export type DigestWedding = {
  id: string;
  weddingDate: Date;
  weddingVenue: string | null;
  male: Person | null;
  female: Person | null;
  partnerName: string | null;
};

export type DigestInput = { name: string; reminders: DigestReminder[]; weddings: DigestWedding[] };

// Days before a wedding on which the daily digest mentions it
export const WEDDING_NOTICE_DAYS = [1, 7];

// The matchmaker's daily summary email, or null when there is nothing to tell
export function buildDigest({ name, reminders, weddings }: DigestInput, appUrl: string, now = new Date()): (MailBody & { subject: string }) | null {
  if (reminders.length === 0 && weddings.length === 0) return null;
  const link = (path: string) => new URL(path, appUrl).toString();
  const sections: MailSection[] = [];

  if (reminders.length > 0) {
    sections.push({
      title: "תזכורות להיום",
      lines: reminders.map((r) => {
        const subject = reminderSubject(r);
        const late = reminderTiming(r.dueAt, now) === "overdue" ? ` (באיחור, מ-${formatDay(r.dueAt)})` : "";
        return { text: `${r.title}${subject ? ` – ${subject.label}` : ""}${late}`, href: link(subject?.href ?? routes.reminders) };
      }),
    });
  }

  if (weddings.length > 0) {
    sections.push({
      title: "חתונות מתקרבות",
      lines: weddings.map((w) => {
        const when = `${weddingCountdown(daysUntil(w.weddingDate, now))}, ${formatDay(w.weddingDate)} (${formatHebrewDay(w.weddingDate)})`;
        return { text: `${coupleTitle(w)} – ${when}${w.weddingVenue ? `, ${w.weddingVenue}` : ""}`, href: link(routes.engagement(w.id)) };
      }),
    });
  }

  const subject = [reminders.length > 0 && `${reminders.length} תזכורות`, weddings.length > 0 && `${weddings.length} חתונות קרובות`]
    .filter(Boolean)
    .join(" · ");
  return { subject: `שדכונס: ${subject}`, ...renderMail(`שלום ${name},`, sections, { text: "ללוח העבודה", href: link("/dashboard") }) };
}
