import { z } from "zod";
import { optionalDate, optionalText, requiredDate, requiredText } from "./fields";

const id = z.string().min(1);

const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on");

const weddingFields = {
  engagedAt: requiredDate("תאריך אירוסין"),
  weddingDate: optionalDate,
  weddingVenue: optionalText(160),
  byMatchmaker: checkbox,
  madeBy: optionalText(120),
  note: optionalText(2000),
};

// A candidate who got engaged to someone outside the matchmaker's database
export const newEngagementSchema = z.object({
  candidateId: id,
  partnerName: requiredText("שם בן/בת הזוג", 120),
  ...weddingFields,
});

export const engagementDetailsSchema = z.object({
  engagementId: id,
  partnerName: optionalText(120),
  ...weddingFields,
});

export const engagementFiltersSchema = z.object({
  state: z.enum(["engaged", "married"]).optional().catch(undefined),
  by: z.enum(["me"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1).default(1),
});

export const weddingFiltersSchema = z.object({
  by: z.enum(["all"]).optional().catch(undefined),
});

export type NewEngagementInput = z.infer<typeof newEngagementSchema>;
export type EngagementDetailsInput = z.infer<typeof engagementDetailsSchema>;
export type EngagementFilters = z.infer<typeof engagementFiltersSchema>;
