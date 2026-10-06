"use server";

import { redirect } from "next/navigation";
import { parseForm, type FormState } from "@/lib/form-state";
import { loginSchema, registerSchema } from "@/lib/validation/matchmaker";
import { endSession, startSession } from "@/server/auth/session";
import { authenticateMatchmaker, EmailTakenError, registerMatchmaker } from "@/server/services/matchmaker-service";

// Accepts only same-site relative paths to avoid open redirects
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseForm(registerSchema, formData);
  if (!parsed.ok) return parsed.state;
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
  const id = await authenticateMatchmaker(parsed.data.email, parsed.data.password);
  if (!id) return { error: "המייל או הסיסמה לא נכונים" };
  await startSession(id);
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}
