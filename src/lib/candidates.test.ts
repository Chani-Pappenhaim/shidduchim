import { describe, expect, it } from "vitest";
import { CandidateStatus, Side } from "@/generated/prisma/enums";
import { ageFrom, initials, isTaken, statusLabel } from "./candidates";
import { coupleOf } from "./introductions";
import { reminderTiming } from "./reminders";
import { withQuery } from "./routes";

describe("candidates", () => {
  it("computes age around the birthday", () => {
    const birth = new Date(2000, 5, 15);
    expect(ageFrom(birth, new Date(2026, 5, 14))).toBe(25);
    expect(ageFrom(birth, new Date(2026, 5, 15))).toBe(26);
    expect(ageFrom(null)).toBeNull();
  });

  it("labels statuses by side", () => {
    expect(statusLabel(CandidateStatus.MARRIED, Side.FEMALE)).toBe("נשואה");
    expect(statusLabel(CandidateStatus.ENGAGED, Side.MALE)).toBe("מאורס");
  });

  it("treats engaged and married candidates as taken", () => {
    expect(isTaken(CandidateStatus.ENGAGED)).toBe(true);
    expect(isTaken(CandidateStatus.MARRIED)).toBe(true);
    expect(isTaken(CandidateStatus.IN_PROCESS)).toBe(false);
  });

  it("builds initials", () => {
    expect(initials({ firstName: "רחל", lastName: "לוי" })).toBe("רל");
  });
});

describe("coupleOf", () => {
  it("stores the couple male first whatever side starts", () => {
    expect(coupleOf(Side.MALE, "m", "f")).toEqual({ maleId: "m", femaleId: "f" });
    expect(coupleOf(Side.FEMALE, "f", "m")).toEqual({ maleId: "m", femaleId: "f" });
  });
});

describe("reminderTiming", () => {
  const now = new Date(2026, 9, 7, 23, 30);

  it("compares whole days", () => {
    expect(reminderTiming(new Date("2026-10-06"), now)).toBe("overdue");
    expect(reminderTiming(new Date("2026-10-07"), now)).toBe("today");
    expect(reminderTiming(new Date("2026-10-08"), now)).toBe("upcoming");
  });
});

describe("withQuery", () => {
  it("drops empty params", () => {
    expect(withQuery("/engagements", { state: "married", by: undefined, page: 2 })).toBe("/engagements?state=married&page=2");
    expect(withQuery("/engagements", { by: "" })).toBe("/engagements");
  });
});
