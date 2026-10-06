"use server";

import { revalidatePath } from "next/cache";
import { parseForm, type FormState } from "@/lib/form-state";
import { reminderDoneSchema, reminderSchema } from "@/lib/validation/reminder";
import { requireMatchmakerId } from "@/server/auth/session";
import { createReminder, deleteReminder, setReminderDone } from "@/server/services/reminder-service";

// Reminders show on the dashboard, the reminders page and candidate and introduction pages
function revalidateReminders() {
  revalidatePath("/", "layout");
}

export async function addReminderAction(_: FormState, formData: FormData): Promise<FormState> {
  const matchmakerId = await requireMatchmakerId();
  const parsed = parseForm(reminderSchema, formData);
  if (!parsed.ok) return parsed.state;
  await createReminder(matchmakerId, parsed.data);
  revalidateReminders();
  return { success: "התזכורת נשמרה" };
}

export async function setReminderDoneAction(formData: FormData) {
  const matchmakerId = await requireMatchmakerId();
  const parsed = reminderDoneSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await setReminderDone(matchmakerId, parsed.data.reminderId, parsed.data.done);
  revalidateReminders();
}

export async function deleteReminderAction(formData: FormData) {
  await deleteReminder(await requireMatchmakerId(), String(formData.get("reminderId")));
  revalidateReminders();
}
