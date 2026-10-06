"use client";

import { useActionState } from "react";
import { addMeetingAction, deleteMeetingAction } from "@/actions/introductions";
import { emptyFormState, fieldValue } from "@/lib/form-state";
import { formatDate, toDateInputValue } from "@/lib/format";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { TextAreaField, TextField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

type Meeting = { id: string; date: Date; location: string | null; summary: string | null };

// Meetings of the couple: a short form to log one, and the list so far
export function Meetings({ introductionId, meetings }: { introductionId: string; meetings: Meeting[] }) {
  const [state, action] = useActionState(addMeetingAction, emptyFormState);
  return (
    <div className="flex flex-col gap-6">
      {meetings.length > 0 && (
        <ol className="flex flex-col gap-3">
          {meetings.map((meeting, index) => (
            <li key={meeting.id} className="flex gap-4 border-2 border-ink p-4">
              <span className="font-display text-5xl leading-none text-coral">{meetings.length - index}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="font-medium">
                  {formatDate(meeting.date)}
                  {meeting.location && <span className="text-muted"> · {meeting.location}</span>}
                </p>
                {meeting.summary && <p className="whitespace-pre-line text-sm">{meeting.summary}</p>}
              </div>
              <form action={deleteMeetingAction}>
                <input type="hidden" name="introductionId" value={introductionId} />
                <input type="hidden" name="meetingId" value={meeting.id} />
                <ConfirmSubmit message="למחוק את הפגישה?" variant="ghost" size="sm" pendingLabel="מוחק…" className="text-xs text-muted">
                  מחיקה
                </ConfirmSubmit>
              </form>
            </li>
          ))}
        </ol>
      )}

      <form action={action} className="grid gap-4 bg-mist p-4 md:grid-cols-2">
        <input type="hidden" name="introductionId" value={introductionId} />
        <TextField
          label="תאריך הפגישה"
          name="date"
          type="date"
          required
          defaultValue={fieldValue(state, "date", toDateInputValue(new Date()))}
          error={state.fieldErrors?.date}
        />
        <TextField label="מקום" name="location" defaultValue={fieldValue(state, "location")} error={state.fieldErrors?.location} />
        <TextAreaField
          label="איך היה"
          name="summary"
          rows={2}
          className="md:col-span-2"
          defaultValue={fieldValue(state, "summary")}
          error={state.fieldErrors?.summary}
        />
        <FormMessage message={state.error} />
        <FormMessage message={state.success} tone="success" />
        <div className="md:col-span-2">
          <SubmitButton size="sm">רישום פגישה</SubmitButton>
        </div>
      </form>
    </div>
  );
}
