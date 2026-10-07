"use client";

import { useActionState } from "react";
import { createEngagementAction, updateEngagementAction } from "@/actions/engagements";
import { CheckboxField, TextAreaField, TextField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { emptyFormState, fieldValue } from "@/lib/form-state";
import { dayKey, toDateInputValue } from "@/lib/format";

type Saved = {
  id: string;
  partnerName: string | null;
  byMatchmaker: boolean;
  madeBy: string | null;
  engagedAt: Date;
  weddingDate: Date | null;
  weddingVenue: string | null;
  note: string | null;
};

type Props =
  // A new engagement of a candidate to someone outside the database
  | { candidateId: string; partnerLabel: string; engagement?: undefined }
  // Editing an existing engagement; the partner name is editable only for an outside partner
  | { engagement: Saved; partnerLabel?: string; candidateId?: undefined };

export function EngagementForm({ candidateId, partnerLabel, engagement }: Props) {
  const [state, action] = useActionState(engagement ? updateEngagementAction : createEngagementAction, emptyFormState);
  const value = (name: string, saved?: string | null) => fieldValue(state, name, saved);
  const fromIntroduction = engagement && !partnerLabel;
  const byMatchmaker = state.values ? state.values.byMatchmaker === "on" : (engagement?.byMatchmaker ?? false);

  return (
    <form action={action} className="flex flex-col gap-5">
      {candidateId && <input type="hidden" name="candidateId" value={candidateId} />}
      {engagement && <input type="hidden" name="engagementId" value={engagement.id} />}
      {partnerLabel && (
        <TextField
          label={partnerLabel}
          name="partnerName"
          required
          hint="לא חייב להיות רשום/ה אצלך במאגר"
          defaultValue={value("partnerName", engagement?.partnerName)}
          error={state.fieldErrors?.partnerName}
        />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="תאריך אירוסין"
          name="engagedAt"
          type="date"
          required
          defaultValue={value("engagedAt", engagement ? dayKey(engagement.engagedAt) : toDateInputValue(new Date()))}
          error={state.fieldErrors?.engagedAt}
        />
        <TextField
          label="תאריך חתונה"
          name="weddingDate"
          type="date"
          hint="מהיום הזה הם יופיעו כנשואים"
          defaultValue={value("weddingDate", engagement?.weddingDate && dayKey(engagement.weddingDate))}
          error={state.fieldErrors?.weddingDate}
        />
      </div>
      <TextField
        label="מקום החתונה"
        name="weddingVenue"
        placeholder="למשל: אולמי ורסאי, בני ברק"
        defaultValue={value("weddingVenue", engagement?.weddingVenue)}
        error={state.fieldErrors?.weddingVenue}
      />
      {fromIntroduction ? (
        // Couples who got engaged through the matchmaker's own introduction are always credited to them
        <input type="hidden" name="byMatchmaker" value="on" />
      ) : (
        <>
          <CheckboxField label="השידוך נעשה דרכי" name="byMatchmaker" defaultChecked={byMatchmaker} hint="יופיע ב״בזכותי״ ובלוח החתונות" />
          <TextField
            label="מי שידך"
            name="madeBy"
            placeholder="אם לא את/ה - למשל: ר׳ משה כהן"
            defaultValue={value("madeBy", engagement?.madeBy)}
            error={state.fieldErrors?.madeBy}
          />
        </>
      )}
      <TextAreaField label="הערות" name="note" rows={3} defaultValue={value("note", engagement?.note)} error={state.fieldErrors?.note} />
      <FormMessage message={state.error} />
      <FormMessage message={state.success} tone="success" />
      <div>
        <SubmitButton arrow>{engagement ? "שמירה" : "סימון אירוסין"}</SubmitButton>
      </div>
    </form>
  );
}
