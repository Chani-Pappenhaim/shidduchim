import { describe, expect, it } from "vitest";
import { dayKey, daysUntil, formatHebrewDay, hebrewNumeral, todayDate, todayKey, toDateInputValue } from "./format";

const noon = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

describe("hebrewNumeral", () => {
  it.each([
    [1, "א׳"],
    [10, "י׳"],
    [11, "י״א"],
    [15, "ט״ו"],
    [16, "ט״ז"],
    [20, "כ׳"],
    [29, "כ״ט"],
    [5787, "תשפ״ז"],
    [5800, "ת״ת"],
  ])("writes %i as %s", (value, expected) => {
    expect(hebrewNumeral(value)).toBe(expected);
  });
});

describe("formatHebrewDay", () => {
  it("formats a stored whole day in the Hebrew calendar", () => {
    expect(formatHebrewDay(new Date("2026-10-19"))).toBe("ח׳ בחשוון תשפ״ז");
  });
});

describe("whole-day dates", () => {
  it("compares a stored day with the local today", () => {
    expect(dayKey(new Date("2026-10-07"))).toBe(todayKey(noon(2026, 10, 7)));
    expect(todayDate(noon(2026, 10, 7)).toISOString()).toBe("2026-10-07T00:00:00.000Z");
  });

  it("counts whole days until a date", () => {
    const now = noon(2026, 10, 7);
    expect(daysUntil(new Date("2026-10-07"), now)).toBe(0);
    expect(daysUntil(new Date("2026-10-19"), now)).toBe(12);
    expect(daysUntil(new Date("2026-10-01"), now)).toBe(-6);
  });

  it("counts across a daylight saving change", () => {
    expect(daysUntil(new Date("2026-11-01"), noon(2026, 10, 20))).toBe(12);
  });

  it("pads date input values", () => {
    expect(toDateInputValue(noon(2026, 3, 5))).toBe("2026-03-05");
    expect(toDateInputValue(null)).toBe("");
  });
});
