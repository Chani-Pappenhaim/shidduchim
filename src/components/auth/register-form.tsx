"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import { emptyFormState } from "@/lib/form-state";
import { TextField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, emptyFormState);
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormMessage message={state.error} />
      <TextField label="שם מלא" name="name" autoComplete="name" required error={state.fieldErrors?.name} />
      <TextField label="מייל" name="email" type="email" autoComplete="email" dir="ltr" required error={state.fieldErrors?.email} />
      <TextField
        label="סיסמה"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="8 תווים לפחות"
        error={state.fieldErrors?.password}
      />
      <SubmitButton size="lg" arrow pendingLabel="יוצרים חשבון…">
        פתיחת חשבון
      </SubmitButton>
    </form>
  );
}
