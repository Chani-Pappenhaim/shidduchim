import { describe, expect, it } from "vitest";
import { buildDigest } from "./digest";
import { escapeHtml } from "./mail-content";

const now = new Date(2026, 9, 7, 6);
const APP = "https://app.example";

const wedding = {
  id: "w1",
  weddingDate: new Date("2026-10-08"),
  weddingVenue: "אולמי <ורסאי>",
  male: { firstName: "יוסף", lastName: "כהן" },
  female: null,
  partnerName: "רחל לוי",
};

const reminder = (title: string, dueAt: string) => ({ title, dueAt: new Date(dueAt), candidate: { id: "c1", firstName: "רחל", lastName: "לוי" }, introduction: null });

describe("buildDigest", () => {
  it("is empty when nothing is due", () => {
    expect(buildDigest({ name: "חנה", reminders: [], weddings: [] }, APP, now)).toBeNull();
  });

  it("lists due reminders with links and marks late ones", () => {
    const digest = buildDigest({ name: "חנה", reminders: [reminder("לחזור", "2026-10-07"), reminder("להתקשר", "2026-10-03")], weddings: [] }, APP, now)!;
    expect(digest.subject).toBe("שדכונס: 2 תזכורות");
    expect(digest.text).toContain("- לחזור – רחל לוי (https://app.example/candidates/c1)");
    expect(digest.text).toContain("להתקשר – רחל לוי (באיחור, מ-3 באוקטובר)");
    expect(digest.text).not.toContain("לחזור – רחל לוי (באיחור");
  });

  it("announces upcoming weddings with escaped HTML", () => {
    const digest = buildDigest({ name: "חנה", reminders: [], weddings: [wedding] }, APP, now)!;
    expect(digest.subject).toBe("שדכונס: 1 חתונות קרובות");
    expect(digest.text).toContain("יוסף כהן ורחל לוי – מחר");
    expect(digest.html).toContain("אולמי &#60;ורסאי&#62;");
    expect(digest.html).toContain('href="https://app.example/engagements/w1"');
    expect(digest.html).toContain('dir="rtl"');
  });
});

describe("escapeHtml", () => {
  it("escapes markup characters", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&#60;a href=&#34;x&#34;&#62;&#39;&#38;&#39;&#60;/a&#62;");
  });
});
