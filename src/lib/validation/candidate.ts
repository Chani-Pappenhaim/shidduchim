import { z } from "zod";
import { CandidateStatus, Side } from "@/generated/prisma/enums";
import { optionalDate, optionalEmail, optionalInt, optionalPhone, optionalText, requiredText } from "./fields";

export const candidateSchema = z.object({
  side: z.enum(Side),
  firstName: requiredText("שם פרטי", 60),
  lastName: requiredText("שם משפחה", 60),
  birthDate: optionalDate,
  city: optionalText(80),
  community: optionalText(80),
  occupation: optionalText(120),
  heightCm: optionalInt(120, 230),
  phone: optionalPhone,
  email: optionalEmail,
  parentsInfo: optionalText(1000),
  about: optionalText(3000),
  lookingFor: optionalText(2000),
  status: z.enum(CandidateStatus).default(CandidateStatus.AVAILABLE),
});

export const noteSchema = z.object({
  candidateId: z.string().min(1),
  body: requiredText("הערה", 3000),
});

export const candidateFiltersSchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  status: z.enum(CandidateStatus).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1).default(1),
});

export type CandidateInput = z.infer<typeof candidateSchema>;
export type CandidateFilters = z.infer<typeof candidateFiltersSchema>;
