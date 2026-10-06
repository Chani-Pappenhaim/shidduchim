"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/actions/profile";
import { emptyFormState } from "@/lib/form-state";
import { TextAreaField, TextField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

type Profile = { name: string; phone: string | null; city: string | null; about: string | null; emailSignature: string | null };

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(updateProfileAction, emptyFormState);
  const errors = state.fieldErrors;
  return (
    <form action={action} className="grid gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <FormMessage message={state.error} />
        <FormMessage message={state.success} tone="success" />
      </div>
      <TextField label="שם" name="name" defaultValue={profile.name} required error={errors?.name} />
      <TextField label="טלפון" name="phone" type="tel" dir="ltr" defaultValue={profile.phone ?? ""} error={errors?.phone} />
      <TextField label="עיר" name="city" defaultValue={profile.city ?? ""} error={errors?.city} />
      <div className="hidden md:block" />
      <TextAreaField label="קצת עליי" name="about" defaultValue={profile.about ?? ""} error={errors?.about} />
      <TextAreaField
        label="חתימה למיילים"
        name="emailSignature"
        defaultValue={profile.emailSignature ?? ""}
        hint="תתווסף בסוף כל הצעה שנשלחת מהמערכת"
        error={errors?.emailSignature}
      />
      <div>
        <SubmitButton arrow>שמירה</SubmitButton>
      </div>
    </form>
  );
}
