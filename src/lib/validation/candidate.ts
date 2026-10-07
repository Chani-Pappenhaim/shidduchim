import { z } from "zod";
import { CandidateStatus, Side } from "@/generated/prisma/enums";
import { MANUAL_STATUSES } from "@/lib/candidates";
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
  status: z.enum(MANUAL_STATUSES).optional(),
});

export const noteSchema = z.object({
  candidateId: z.string().min(1),
  body: requiredText("הערה", 3000),
});

// Query-string filters: anything malformed is dropped instead of failing the page
const filterText = z.string().trim().max(80).optional().transform((v) => v || undefined).catch(undefined);
const filterNumber = (min: number, max: number) =>
  z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().int().min(min).max(max).optional()).catch(undefined);

export const candidateFiltersSchema = z.object({
  q: filterText,
  status: z.enum(CandidateStatus).optional().catch(undefined),
  minAge: filterNumber(16, 99),
  maxAge: filterNumber(16, 99),
  minHeight: filterNumber(120, 230),
  maxHeight: filterNumber(120, 230),
  city: filterText,
  community: filterText,
  occupation: filterText,
  notProposed: z.literal("1").optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1).default(1),
});

export const ADVANCED_FILTER_KEYS = ["minAge", "maxAge", "minHeight", "maxHeight", "city", "community", "occupation", "notProposed"] as const;

// The filters as URL params, for paging links that keep the current search
export function filterParams(filters: CandidateFilters): Record<string, string | number | undefined> {
  return { ...filters, page: undefined };
}

export function hasFilters(filters: CandidateFilters): boolean {
  return Object.values(filterParams(filters)).some((v) => v !== undefined);
}

export type CandidateInput = z.infer<typeof candidateSchema>;
export type CandidateFilters = z.infer<typeof candidateFiltersSchema>;
