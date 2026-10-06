"use client";

import { useActionState } from "react";
import { updateIntroductionDetailsAction } from "@/actions/introductions";
import { emptyFormState, fieldValue } from "@/lib/form-state";
import { TextAreaField, TextField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

type Props = { introductionId: string; proposedBy: string | null; note: string | null };

export function IntroductionDetailsForm({ introductionId, proposedBy, note }: Props) {
  const [state, action] = useActionState(updateIntroductionDetailsAction, emptyFormState);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="introductionId" value={introductionId} />
      <TextField
        label="מי הציע"
        name="proposedBy"
        placeholder="למשל: אני, הדודה של הבחורה, ר׳ משה"
        defaultValue={fieldValue(state, "proposedBy", proposedBy)}
        error={state.fieldErrors?.proposedBy}
      />
      <TextAreaField label="הערות להצעה" name="note" rows={3} defaultValue={fieldValue(state, "note", note)} error={state.fieldErrors?.note} />
      <FormMessage message={state.error} />
      <FormMessage message={state.success} tone="success" />
      <div>
        <SubmitButton size="sm">שמירה</SubmitButton>
      </div>
    </form>
  );
}
