"use server";

import { redirect } from "next/navigation";
import { parseForm, type FormState } from "@/lib/form-state";
import { MAX_CODE_ATTEMPTS } from "@/lib/portal";
import { routes } from "@/lib/routes";
import { portalCodeSchema, portalProfileSchema } from "@/lib/validation/portal";
import { endPortalSession, getPortalInviteId, startPortalSession } from "@/server/auth/portal-session";
import { sendPortalCode, updatePortalProfile, verifyPortalCode, type CodeVerification } from "@/server/services/portal-service";

const INVALID_LINK = "הקישור כבר לא בתוקף. אפשר לבקש קישור חדש מהשדכן/ית";

const CODE_REQUEST_MESSAGES = {
  sent: { success: "שלחנו קוד למייל שלך" },
  wait: { success: "כבר שלחנו קוד. אפשר לבקש קוד חדש בעוד דקה" },
  invalid: { error: INVALID_LINK },
} satisfies Record<string, FormState>;

export async function requestPortalCodeAction(token: string): Promise<FormState> {
  return CODE_REQUEST_MESSAGES[await sendPortalCode(token)];
}

function verificationError({ result, attemptsLeft }: CodeVerification): string {
  switch (result) {
    case "wrong":
      return attemptsLeft ? `הקוד שגוי. נשארו ${attemptsLeft} ניסיונות` : "הקוד שגוי. יש לבקש קוד חדש";
    case "locked":
      return `היו ${MAX_CODE_ATTEMPTS} ניסיונות שגויים. יש לבקש קוד חדש`;
    case "expired":
      return "תוקף הקוד פג. יש לבקש קוד חדש";
    default:
      return INVALID_LINK;
  }
}

export async function verifyPortalCodeAction(token: string, _: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseForm(portalCodeSchema, formData);
  if (!parsed.ok) return parsed.state;
  const verification = await verifyPortalCode(token, parsed.data.code);
  if (!verification.inviteId) return { error: verificationError(verification) };
  await startPortalSession(verification.inviteId);
  redirect(routes.portal(token));
}

export async function savePortalProfileAction(_: FormState, formData: FormData): Promise<FormState> {
  const inviteId = await getPortalInviteId();
  if (!inviteId) return { error: "תם זמן הכניסה. יש לרענן את הדף ולהיכנס שוב עם קוד" };
  const parsed = parseForm(portalProfileSchema, formData);
  if (!parsed.ok) return parsed.state;
  if (!(await updatePortalProfile(inviteId, parsed.data))) return { error: INVALID_LINK };
  return { success: "הפרטים נשמרו ועברו לשדכן/ית. תודה!" };
}

export async function portalSignOutAction(token: string) {
  await endPortalSession();
  redirect(routes.portal(token));
}
