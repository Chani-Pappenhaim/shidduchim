"use client";

import { useActionState } from "react";
import { addReminderAction } from "@/actions/reminders";
import { TextField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { emptyFormState, fieldValue } from "@/lib/form-state";
import { toDateInputValue } from "@/lib/format";

type Props = { candidateId?: string; introductionId?: string; placeholder?: string };

// Quick reminder form, optionally tied to a candidate or an introduction
export function ReminderForm({ candidateId, introductionId, placeholder = "למשל: לחזור להורים" }: Props) {
  const [state, action] = useActionState(addReminderAction, emptyFormState);

  return (
    <div className="@container">
      <form action={action} className="grid gap-3 bg-mist p-4 @lg:grid-cols-[1fr_auto_auto] @lg:items-end">
        {candidateId && <input type="hidden" name="candidateId" value={candidateId} />}
        {introductionId && <input type="hidden" name="introductionId" value={introductionId} />}
        <TextField
          label="תזכורת חדשה"
          name="title"
          required
          placeholder={placeholder}
          defaultValue={fieldValue(state, "title")}
          error={state.fieldErrors?.title}
        />
        <TextField
          label="מתי"
          name="dueAt"
          type="date"
          required
          defaultValue={fieldValue(state, "dueAt", toDateInputValue(new Date()))}
          error={state.fieldErrors?.dueAt}
        />
        <SubmitButton size="md">הוספה</SubmitButton>
        <div className="@lg:col-span-3">
          <FormMessage message={state.success} tone="success" />
        </div>
      </form>
    </div>
  );
}
