"use client";

import { useActionState } from "react";
import { addNoteAction, deleteNoteAction } from "@/actions/notes";
import { emptyFormState, fieldValue } from "@/lib/form-state";
import { formatDateTime } from "@/lib/format";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { TextAreaField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

type Note = { id: string; body: string; createdAt: Date };

// Private notes visible only to the matchmaker, never to the candidate
export function CandidateNotes({ candidateId, notes }: { candidateId: string; notes: Note[] }) {
  const [state, action] = useActionState(addNoteAction, emptyFormState);
  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="candidateId" value={candidateId} />
        <TextAreaField
          label="הערה חדשה"
          name="body"
          rows={3}
          placeholder="רק את/ה רואה את ההערות האלה"
          defaultValue={fieldValue(state, "body")}
          error={state.fieldErrors?.body}
        />
        <FormMessage message={state.success} tone="success" />
        <div>
          <SubmitButton size="sm">הוספת הערה</SubmitButton>
        </div>
      </form>
      {notes.length > 0 && (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li key={note.id} className="border-r-4 border-lime bg-mist px-4 py-3">
              <p className="whitespace-pre-line">{note.body}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <time dateTime={note.createdAt.toISOString()}>{formatDateTime(note.createdAt)}</time>
                <form action={deleteNoteAction}>
                  <input type="hidden" name="candidateId" value={candidateId} />
                  <input type="hidden" name="noteId" value={note.id} />
                  <ConfirmSubmit message="למחוק את ההערה?" variant="ghost" size="sm" pendingLabel="מוחק…" className="text-xs text-muted">
                    מחיקה
                  </ConfirmSubmit>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
