"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseForm, type FormState } from "@/lib/form-state";
import { routes } from "@/lib/routes";
import { engagementDetailsSchema, newEngagementSchema } from "@/lib/validation/engagement";
import { requireMatchmakerId } from "@/server/auth/session";
import { cancelEngagement, createEngagement, EngagementRuleError, updateEngagement } from "@/server/services/engagement-service";

// Engagements change candidate and introduction statuses, so every page that shows them is refreshed
function revalidateCouples() {
  revalidatePath("/", "layout");
}

export async function createEngagementAction(_: FormState, formData: FormData): Promise<FormState> {
  const matchmakerId = await requireMatchmakerId();
  const parsed = parseForm(newEngagementSchema, formData);
  if (!parsed.ok) return parsed.state;
  let engagementId: string;
  try {
    ({ id: engagementId } = await createEngagement(matchmakerId, parsed.data));
  } catch (error) {
    if (error instanceof EngagementRuleError) return { error: error.message };
    throw error;
  }
  revalidateCouples();
  redirect(routes.engagement(engagementId));
}

export async function updateEngagementAction(_: FormState, formData: FormData): Promise<FormState> {
  const matchmakerId = await requireMatchmakerId();
  const parsed = parseForm(engagementDetailsSchema, formData);
  if (!parsed.ok) return parsed.state;
  await updateEngagement(matchmakerId, parsed.data);
  revalidateCouples();
  return { success: "הפרטים נשמרו" };
}

export async function cancelEngagementAction(formData: FormData) {
  await cancelEngagement(await requireMatchmakerId(), String(formData.get("engagementId")));
  revalidateCouples();
  redirect(routes.engagements);
}
