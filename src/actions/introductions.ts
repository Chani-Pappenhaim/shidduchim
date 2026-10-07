"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseForm, type FormState } from "@/lib/form-state";
import { routes } from "@/lib/routes";
import {
  introductionDetailsSchema,
  introductionStatusSchema,
  meetingSchema,
  proposeSchema,
} from "@/lib/validation/introduction";
import { requireMatchmakerId } from "@/server/auth/session";
import { EngagementRuleError } from "@/server/services/engagement-service";
import {
  addMeeting,
  changeIntroductionStatus,
  deleteIntroduction,
  deleteMeeting,
  IntroductionRuleError,
  proposeIntroduction,
  updateIntroductionDetails,
} from "@/server/services/introduction-service";

// An introduction change can move candidate statuses, so every page that shows them is refreshed
function revalidateMatchmaking() {
  revalidatePath("/", "layout");
}

export async function proposeAction(_: FormState, formData: FormData): Promise<FormState> {
  const matchmakerId = await requireMatchmakerId();
  const parsed = parseForm(proposeSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    await proposeIntroduction(matchmakerId, parsed.data.candidateId, parsed.data.partnerId);
  } catch (error) {
    if (error instanceof IntroductionRuleError) return { error: error.message };
    throw error;
  }
  revalidateMatchmaking();
  return { success: "ההצעה נרשמה" };
}

export async function updateIntroductionDetailsAction(_: FormState, formData: FormData): Promise<FormState> {
  const matchmakerId = await requireMatchmakerId();
  const parsed = parseForm(introductionDetailsSchema, formData);
  if (!parsed.ok) return parsed.state;
  await updateIntroductionDetails(matchmakerId, parsed.data);
  revalidatePath(routes.introduction(parsed.data.introductionId));
  return { success: "הפרטים נשמרו" };
}

export async function changeIntroductionStatusAction(_: FormState, formData: FormData): Promise<FormState> {
  const matchmakerId = await requireMatchmakerId();
  const parsed = parseForm(introductionStatusSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    await changeIntroductionStatus(matchmakerId, parsed.data.introductionId, parsed.data.status);
  } catch (error) {
    if (error instanceof EngagementRuleError) return { error: error.message };
    throw error;
  }
  revalidateMatchmaking();
  return {};
}

export async function addMeetingAction(_: FormState, formData: FormData): Promise<FormState> {
  const matchmakerId = await requireMatchmakerId();
  const parsed = parseForm(meetingSchema, formData);
  if (!parsed.ok) return parsed.state;
  await addMeeting(matchmakerId, parsed.data);
  revalidateMatchmaking();
  return { success: "הפגישה נרשמה" };
}

export async function deleteMeetingAction(formData: FormData) {
  await deleteMeeting(await requireMatchmakerId(), String(formData.get("meetingId")));
  revalidatePath(routes.introduction(String(formData.get("introductionId"))));
}

export async function deleteIntroductionAction(formData: FormData) {
  await deleteIntroduction(await requireMatchmakerId(), String(formData.get("introductionId")));
  revalidateMatchmaking();
  redirect(routes.introductions);
}
