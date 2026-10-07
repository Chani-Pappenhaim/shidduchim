import { describe, expect, it } from "vitest";
import { coupleNames, coupleState, coupleTitle, groupByMonth, personFromName, weddingCalendarUrl, weddingCountdown } from "./engagements";

const now = new Date(2026, 9, 7, 12);

describe("coupleState", () => {
  it("is engaged without a wedding date or before it", () => {
    expect(coupleState(null, now)).toBe("engaged");
    expect(coupleState(new Date("2026-10-08"), now)).toBe("engaged");
  });

  it("is married from the wedding day on", () => {
    expect(coupleState(new Date("2026-10-07"), now)).toBe("married");
    expect(coupleState(new Date("2025-01-01"), now)).toBe("married");
  });
});

describe("couple names", () => {
  const yosef = { firstName: "יוסף", lastName: "כהן" };
  const rachel = { firstName: "רחל", lastName: "לוי" };

  it("uses both candidates' names", () => {
    expect(coupleNames({ male: yosef, female: rachel, partnerName: null })).toEqual(["יוסף כהן", "רחל לוי"]);
    expect(coupleTitle({ male: yosef, female: rachel, partnerName: null })).toBe("יוסף כהן ורחל לוי");
  });

  it("fills a partner outside the database from the free-text name", () => {
    expect(coupleNames({ male: yosef, female: null, partnerName: "אסתר קליין" })).toEqual(["יוסף כהן", "אסתר קליין"]);
    expect(coupleNames({ male: null, female: rachel, partnerName: "דוד" })).toEqual(["דוד", "רחל לוי"]);
  });

  it("splits a free-text name for initials", () => {
    expect(personFromName("  אסתר  בת שבע קליין ")).toEqual({ firstName: "אסתר", lastName: "בת שבע קליין" });
  });
});

describe("weddingCountdown", () => {
  it.each([
    [0, "היום!"],
    [1, "מחר"],
    [2, "מחרתיים"],
    [12, "בעוד 12 ימים"],
  ])("describes %i days", (days, expected) => {
    expect(weddingCountdown(days)).toBe(expected);
  });
});

describe("groupByMonth", () => {
  it("groups consecutive weddings by calendar month", () => {
    const items = ["2026-10-19", "2026-10-31", "2026-11-01", "2027-01-05"].map((d) => ({ weddingDate: new Date(d) }));
    expect(groupByMonth(items).map((g) => [g.month, g.items.length])).toEqual([
      ["2026-10", 2],
      ["2026-11", 1],
      ["2027-01", 1],
    ]);
  });
});

describe("weddingCalendarUrl", () => {
  it("builds an all-day Google Calendar event", () => {
    const url = new URL(weddingCalendarUrl("יוסף ורחל", new Date("2026-10-31"), "אולמי ורסאי"));
    expect(url.searchParams.get("dates")).toBe("20261031/20261101");
    expect(url.searchParams.get("text")).toBe("חתונת יוסף ורחל");
    expect(url.searchParams.get("location")).toBe("אולמי ורסאי");
  });
});
