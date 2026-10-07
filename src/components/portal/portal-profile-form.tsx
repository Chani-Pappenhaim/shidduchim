"use client";

import { useActionState } from "react";
import { savePortalProfileAction } from "@/actions/portal";
import { emptyFormState, fieldValue } from "@/lib/form-state";
import { toDateInputValue } from "@/lib/format";
import { TextAreaField, TextField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import type { PortalProfile } from "@/server/services/portal-service";

// The candidate's own details; name, status and the matchmaker's notes are not part of it
export function PortalProfileForm({ profile }: { profile: PortalProfile }) {
  const [state, action] = useActionState(savePortalProfileAction, emptyFormState);
  const errors = state.fieldErrors;
  const value = (name: keyof PortalProfile) => fieldValue(state, name, profile[name] as string | number | null);

  return (
    <form action={action} className="flex flex-col gap-8">
      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="תאריך לידה"
          name="birthDate"
          type="date"
          defaultValue={state.values?.birthDate ?? toDateInputValue(profile.birthDate)}
          error={errors?.birthDate}
        />
        <TextField label="גובה (ס״מ)" name="heightCm" type="number" inputMode="numeric" defaultValue={value("heightCm")} error={errors?.heightCm} />
        <TextField label="עיר" name="city" defaultValue={value("city")} error={errors?.city} />
        <TextField label="קהילה / חוג" name="community" defaultValue={value("community")} error={errors?.community} />
        <TextField label="עיסוק / מקום לימודים" name="occupation" defaultValue={value("occupation")} error={errors?.occupation} />
        <TextField label="טלפון" name="phone" type="tel" dir="ltr" defaultValue={value("phone")} error={errors?.phone} />
        <TextAreaField label="קצת עליי" name="about" defaultValue={value("about")} error={errors?.about} className="md:col-span-2" />
        <TextAreaField label="מה אני מחפש/ת" name="lookingFor" defaultValue={value("lookingFor")} error={errors?.lookingFor} />
        <TextAreaField label="פרטי משפחה" name="parentsInfo" defaultValue={value("parentsInfo")} error={errors?.parentsInfo} />
      </div>
      <FormMessage message={state.error} />
      <FormMessage message={state.success} tone="success" />
      <div>
        <SubmitButton size="lg" arrow>
          שמירה
        </SubmitButton>
      </div>
    </form>
  );
}
