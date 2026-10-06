"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { emptyFormState } from "@/lib/form-state";
import { TextField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, emptyFormState);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage message={state.error} />
      <TextField label="מייל" name="email" type="email" autoComplete="email" dir="ltr" required error={state.fieldErrors?.email} />
      <TextField label="סיסמה" name="password" type="password" autoComplete="current-password" required error={state.fieldErrors?.password} />
      <SubmitButton size="lg" arrow pendingLabel="נכנסים…">
        כניסה
      </SubmitButton>
    </form>
  );
}
