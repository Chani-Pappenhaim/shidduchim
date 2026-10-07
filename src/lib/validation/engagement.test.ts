import { describe, expect, it } from "vitest";
import { parseForm } from "@/lib/form-state";
import { engagementDetailsSchema, engagementFiltersSchema, newEngagementSchema } from "./engagement";

function form(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

describe("newEngagementSchema", () => {
  it("requires the partner's name and engagement date, keeping what was typed", () => {
    const result = parseForm(newEngagementSchema, form({ candidateId: "c1", partnerName: " ", engagedAt: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.state.fieldErrors?.partnerName).toBeDefined();
      expect(result.state.fieldErrors?.engagedAt).toBeDefined();
      expect(result.state.values?.candidateId).toBe("c1");
    }
  });

  it("parses dates and the checkbox", () => {
    const result = parseForm(
      newEngagementSchema,
      form({ candidateId: "c1", partnerName: "אסתר", engagedAt: "2026-10-01", weddingDate: "2026-12-01", byMatchmaker: "on" }),
    );
    expect(result).toMatchObject({ ok: true, data: { byMatchmaker: true, weddingDate: new Date("2026-12-01"), engagedAt: new Date("2026-10-01") } });
  });
});

describe("engagementDetailsSchema", () => {
  it("leaves blank optional fields out", () => {
    const result = engagementDetailsSchema.parse({ engagementId: "e1", engagedAt: "2026-10-01", weddingDate: "", weddingVenue: "" });
    expect(result.weddingDate).toBeUndefined();
    expect(result.weddingVenue).toBeUndefined();
    expect(result.byMatchmaker).toBe(false);
  });
});

describe("engagementFiltersSchema", () => {
  it("ignores unknown filter values", () => {
    expect(engagementFiltersSchema.parse({ state: "divorced", by: "x", page: "-3" })).toEqual({ state: undefined, by: undefined, page: 1 });
    expect(engagementFiltersSchema.parse({ state: "married", by: "me", page: "2" })).toEqual({ state: "married", by: "me", page: 2 });
  });
});
