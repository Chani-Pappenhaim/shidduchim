"use server";

import { revalidatePath } from "next/cache";
import { parseForm, type FormState } from "@/lib/form-state";
import { profileSchema } from "@/lib/validation/matchmaker";
import { requireMatchmakerId } from "@/server/auth/session";
import { updateMatchmakerProfile } from "@/server/services/matchmaker-service";

export async function updateProfileAction(_: FormState, formData: FormData): Promise<FormState> {
  const matchmakerId = await requireMatchmakerId();
  const parsed = parseForm(profileSchema, formData);
  if (!parsed.ok) return parsed.state;
  await updateMatchmakerProfile(matchmakerId, parsed.data);
  revalidatePath("/", "layout");
  return { success: "הפרופיל נשמר" };
}
