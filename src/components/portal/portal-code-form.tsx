"use client";

import { useActionState } from "react";
import { requestPortalCodeAction, verifyPortalCodeAction } from "@/actions/portal";
import { emptyFormState } from "@/lib/form-state";
import { CODE_LENGTH } from "@/lib/portal";
import { TextField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

// Two steps on one screen: send a code to the candidate's email, then type it in
export function PortalCodeForm({ token, emailHint }: { token: string; emailHint: string }) {
  const [requested, requestCode] = useActionState(requestPortalCodeAction.bind(null, token), emptyFormState);
  const [verified, verifyCode] = useActionState(verifyPortalCodeAction.bind(null, token), emptyFormState);
  const codeSent = !!requested.success || verified !== emptyFormState;

  return (
    <div className="flex flex-col gap-6">
      <form action={requestCode} className="flex flex-col gap-3">
        <p>
          לכניסה נשלח קוד חד-פעמי לכתובת <strong dir="ltr">{emailHint}</strong>
        </p>
        <FormMessage message={requested.error} />
        <FormMessage message={requested.success} tone="success" />
        <div>
          <SubmitButton variant={codeSent ? "secondary" : "primary"} size={codeSent ? "sm" : "lg"} arrow={!codeSent} pendingLabel="שולח…">
            {codeSent ? "שליחת קוד חדש" : "שליחת קוד"}
          </SubmitButton>
        </div>
      </form>

      {codeSent && (
        <form action={verifyCode} className="flex flex-col gap-3 border-t-2 border-ink pt-6">
          <FormMessage message={verified.error} />
          <TextField
            label="הקוד מהמייל"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            dir="ltr"
            required
            autoFocus
            className="max-w-48"
            error={verified.fieldErrors?.code}
          />
          <div>
            <SubmitButton size="lg" arrow pendingLabel="בודק…">
              כניסה
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}
