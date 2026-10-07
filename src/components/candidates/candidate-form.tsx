"use client";

import { useActionState, type ReactNode } from "react";
import { saveCandidateAction } from "@/actions/candidates";
import type { Side } from "@/generated/prisma/enums";
import { isTaken, MANUAL_STATUSES, SIDE_LABELS, statusLabel } from "@/lib/candidates";
import { FILE_RULES, formatBytes } from "@/lib/files";
import { emptyFormState, fieldValue } from "@/lib/form-state";
import { toDateInputValue } from "@/lib/format";
import { LinkButton } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import type { EditableCandidate } from "@/server/services/candidate-service";

type Props = {
  side: Side;
  candidate?: EditableCandidate;
  cancelHref: string;
};

function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-5 border-t-2 border-ink pt-6 md:grid-cols-2">
      <legend className="float-right mb-2 w-full font-display text-4xl md:col-span-2">{legend}</legend>
      {children}
    </fieldset>
  );
}

export function CandidateForm({ side, candidate, cancelHref }: Props) {
  const [state, action] = useActionState(saveCandidateAction, emptyFormState);
  const errors = state.fieldErrors;
  const value = (name: keyof EditableCandidate) => fieldValue(state, name, candidate?.[name] as string | number | null | undefined);
  const currentFile = (kind: keyof typeof FILE_RULES) => candidate?.files.find((f) => f.kind === kind);
  const fileHint = (kind: keyof typeof FILE_RULES) => {
    const current = currentFile(kind);
    const limit = `עד ${formatBytes(FILE_RULES[kind].maxBytes)}`;
    return current ? `קיים: ${current.originalName} · בחירת קובץ חדש תחליף אותו · ${limit}` : limit;
  };

  return (
    <form action={action} className="flex flex-col gap-10">
      <input type="hidden" name="side" value={side} />
      {candidate && <input type="hidden" name="candidateId" value={candidate.id} />}
      <FormMessage message={state.error} />

      <Fieldset legend="פרטים אישיים">
        <TextField label="שם פרטי" name="firstName" required defaultValue={value("firstName")} error={errors?.firstName} />
        <TextField label="שם משפחה" name="lastName" required defaultValue={value("lastName")} error={errors?.lastName} />
        <TextField
          label="תאריך לידה"
          name="birthDate"
          type="date"
          defaultValue={state.values?.birthDate ?? toDateInputValue(candidate?.birthDate)}
          error={errors?.birthDate}
        />
        <TextField label="גובה (ס״מ)" name="heightCm" type="number" inputMode="numeric" defaultValue={value("heightCm")} error={errors?.heightCm} />
        <TextField label="עיר" name="city" defaultValue={value("city")} error={errors?.city} />
        <TextField label="קהילה / חוג" name="community" defaultValue={value("community")} error={errors?.community} />
        <TextField label="עיסוק / מקום לימודים" name="occupation" defaultValue={value("occupation")} error={errors?.occupation} />
        {candidate && isTaken(candidate.status) ? (
          <TextField
            label="סטטוס"
            name="statusShown"
            disabled
            value={statusLabel(candidate.status, side)}
            hint="נקבע לפי האירוסין בכרטיס"
          />
        ) : (
          <SelectField label="סטטוס" name="status" defaultValue={value("status") || "AVAILABLE"} error={errors?.status}>
            {MANUAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status, side)}
              </option>
            ))}
          </SelectField>
        )}
      </Fieldset>

      <Fieldset legend="יצירת קשר">
        <TextField label="טלפון" name="phone" type="tel" dir="ltr" defaultValue={value("phone")} error={errors?.phone} />
        <TextField label="מייל" name="email" type="email" dir="ltr" defaultValue={value("email")} error={errors?.email} />
      </Fieldset>

      <Fieldset legend="רקע">
        <TextAreaField
          label={`על ה${SIDE_LABELS[side].one}`}
          name="about"
          defaultValue={value("about")}
          error={errors?.about}
          className="md:col-span-2"
        />
        <TextAreaField label="מה מחפשים" name="lookingFor" defaultValue={value("lookingFor")} error={errors?.lookingFor} />
        <TextAreaField label="פרטי משפחה" name="parentsInfo" defaultValue={value("parentsInfo")} error={errors?.parentsInfo} />
      </Fieldset>

      <Fieldset legend="קבצים">
        <TextField
          label="תמונה לרזומה"
          name="photo"
          type="file"
          accept={FILE_RULES.PHOTO.mimeTypes.join(",")}
          hint={fileHint("PHOTO")}
          error={errors?.photo}
        />
        <TextField
          label="קובץ רזומה"
          name="resume"
          type="file"
          accept={FILE_RULES.RESUME.mimeTypes.join(",")}
          hint={fileHint("RESUME")}
          error={errors?.resume}
        />
      </Fieldset>

      <div className="flex flex-wrap gap-3 border-t-2 border-ink pt-6">
        <SubmitButton size="lg" arrow>
          {candidate ? "שמירת שינויים" : "יצירת כרטיס"}
        </SubmitButton>
        <LinkButton href={cancelHref} variant="secondary" size="lg">
          ביטול
        </LinkButton>
      </div>
    </form>
  );
}
