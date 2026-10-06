import { z } from "zod";
import { IntroductionStatus } from "@/generated/prisma/enums";
import { optionalText, requiredDate } from "./fields";

const id = z.string().min(1);

export const proposeSchema = z.object({
  candidateId: id,
  partnerId: id,
});

export const introductionDetailsSchema = z.object({
  introductionId: id,
  proposedBy: optionalText(120),
  note: optionalText(2000),
});

export const introductionStatusSchema = z.object({
  introductionId: id,
  status: z.enum(IntroductionStatus),
});

export const meetingSchema = z.object({
  introductionId: id,
  date: requiredDate("תאריך"),
  location: optionalText(120),
  summary: optionalText(2000),
});

export const introductionFiltersSchema = z.object({
  status: z.enum(IntroductionStatus).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1).default(1),
});

export type IntroductionDetailsInput = z.infer<typeof introductionDetailsSchema>;
export type MeetingInput = z.infer<typeof meetingSchema>;
export type IntroductionFilters = z.infer<typeof introductionFiltersSchema>;
