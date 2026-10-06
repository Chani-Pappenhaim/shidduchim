import { z } from "zod";

// Reusable form field rules with Hebrew messages

const blankToUndefined = (v: string | undefined) => (v ? v : undefined);

export const requiredText = (label: string, max = 120) =>
  z.string().trim().min(1, `נא למלא ${label}`).max(max, `${label} ארוך מדי`);

export const optionalText = (max = 2000) => z.string().trim().max(max, "הטקסט ארוך מדי").optional().transform(blankToUndefined);

export const emailField = z.string().trim().toLowerCase().pipe(z.email("כתובת מייל לא תקינה"));

export const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .optional()
  .transform(blankToUndefined)
  .pipe(z.email("כתובת מייל לא תקינה").optional());

export const optionalPhone = z
  .string()
  .trim()
  .optional()
  .transform(blankToUndefined)
  .pipe(z.string().regex(/^[0-9+\-\s]{7,20}$/, "מספר טלפון לא תקין").optional());

export const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : undefined))
  .pipe(z.date("תאריך לא תקין").optional());

export const requiredDate = (label: string) =>
  z
    .string()
    .min(1, `נא לבחור ${label}`)
    .transform((v) => new Date(v))
    .pipe(z.date("תאריך לא תקין"));

export const optionalInt = (min: number, max: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .pipe(z.number().int("מספר שלם בלבד").min(min, "ערך נמוך מדי").max(max, "ערך גבוה מדי").optional());
