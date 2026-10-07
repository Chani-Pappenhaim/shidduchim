"use server";

import { redirect } from "next/navigation";
import { parseForm, type FormState } from "@/lib/form-state";
import { safeRedirectPath } from "@/lib/routes";
import { loginSchema, registerSchema } from "@/lib/validation/matchmaker";
import { endSession, startSession } from "@/server/auth/session";
import { consumeAll, RATE_LIMITED_MESSAGE, RATE_RULES } from "@/server/rate-limit";
import { clientIp } from "@/server/request-ip";
import { authenticateMatchmaker, EmailTakenError, registerMatchmaker } from "@/server/services/matchmaker-service";

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseForm(registerSchema, formData);
  if (!parsed.ok) return parsed.state;
  if (!(await consumeAll([[`register:ip:${await clientIp()}`, RATE_RULES.registerPerIp]]))) return { error: RATE_LIMITED_MESSAGE };
  try {
    const { id } = await registerMatchmaker(parsed.data);
    await startSession(id);
  } catch (error) {
    if (error instanceof EmailTakenError) return { fieldErrors: { email: ["כבר קיים חשבון עם המייל הזה"] } };
    throw error;
  }
  redirect("/dashboard");
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseForm(loginSchema, formData);
  if (!parsed.ok) return parsed.state;
  const allowed = await consumeAll([
    [`login:email:${parsed.data.email}`, RATE_RULES.loginPerEmail],
    [`login:ip:${await clientIp()}`, RATE_RULES.loginPerIp],
  ]);
  if (!allowed) return { error: RATE_LIMITED_MESSAGE };
  const id = await authenticateMatchmaker(parsed.data.email, parsed.data.password);
  if (!id) return { error: "המייל או הסיסמה לא נכונים" };
  await startSession(id);
  redirect(safeRedirectPath(formData.get("next"), "/dashboard"));
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}
