"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formValues, parseForm, type FormState } from "@/lib/form-state";
import { routes } from "@/lib/routes";
import { proposalEmailSchema } from "@/lib/validation/proposal-email";
import { requireMatchmakerId } from "@/server/auth/session";
import { MailGrantRevokedError, NoMailConnectionError } from "@/server/services/mail-connection-service";
import { recordProposalEmailOpened, sendProposalEmail } from "@/server/services/proposal-email-service";

function sendError(error: unknown): string {
  if (error instanceof NoMailConnectionError) return "אין חשבון מייל מחובר. אפשר לחבר אותו בעמוד הפרופיל";
  if (error instanceof MailGrantRevokedError) return "החיבור לחשבון המייל פג. צריך לחבר אותו מחדש בעמוד הפרופיל";
  console.error("[proposal-email] send failed", error);
  return "השליחה נכשלה. אפשר לנסות שוב או לשלוח דרך תוכנת המייל";
}

export async function sendProposalEmailAction(_: FormState, formData: FormData): Promise<FormState> {
  const matchmakerId = await requireMatchmakerId();
  const parsed = parseForm(proposalEmailSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    await sendProposalEmail(matchmakerId, parsed.data);
  } catch (error) {
    return { error: sendError(error), values: formValues(formData) };
  }
  revalidatePath(routes.introduction(parsed.data.introductionId));
  redirect(routes.introduction(parsed.data.introductionId));
}

// Called when the matchmaker opens the draft in their own mail program, so the introduction shows it was sent
export async function recordProposalEmailOpenedAction(formData: FormData) {
  const matchmakerId = await requireMatchmakerId();
  const parsed = proposalEmailSchema.pick({ introductionId: true, recipient: true, to: true }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await recordProposalEmailOpened(matchmakerId, parsed.data);
  revalidatePath(routes.introduction(parsed.data.introductionId));
}
