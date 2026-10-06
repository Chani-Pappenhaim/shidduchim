import { z } from "zod";
import { requiredDate, requiredText } from "./fields";

const optionalId = z
  .string()
  .optional()
  .transform((v) => v || undefined);

export const reminderSchema = z.object({
  title: requiredText("מה צריך לעשות", 200),
  dueAt: requiredDate("תאריך"),
  candidateId: optionalId,
  introductionId: optionalId,
});

export const reminderDoneSchema = z.object({
  reminderId: z.string().min(1),
  done: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export type ReminderInput = z.infer<typeof reminderSchema>;
