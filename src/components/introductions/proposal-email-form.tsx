"use client";

import { useActionState, useRef } from "react";
import { recordProposalEmailOpenedAction, sendProposalEmailAction } from "@/actions/proposal-email";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { emptyFormState, fieldValue } from "@/lib/form-state";
import { mailtoUrl, type ProposalRecipient } from "@/lib/proposal-email";

type Props = {
  introductionId: string;
  recipient: ProposalRecipient;
  to: string;
  subject: string;
  body: string;
  sendingFrom: string | null;
};

// Editable proposal email, sent from the connected mailbox or opened in the matchmaker's own mail program
export function ProposalEmailForm({ introductionId, recipient, to, subject, body, sendingFrom }: Props) {
  const [state, action] = useActionState(sendProposalEmailAction, emptyFormState);
  const formRef = useRef<HTMLFormElement>(null);

  function openInMailProgram() {
    const form = formRef.current;
    if (!form?.reportValidity()) return;
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "");
    window.location.href = mailtoUrl({ to: value("to"), subject: value("subject"), body: value("body") });
    void recordProposalEmailOpenedAction(data);
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      <input type="hidden" name="introductionId" value={introductionId} />
      <input type="hidden" name="recipient" value={recipient} />
      <TextField
        label="אל"
        name="to"
        type="email"
        dir="ltr"
        required
        defaultValue={fieldValue(state, "to", to)}
        error={state.fieldErrors?.to}
        hint={to ? undefined : "אין מייל שמור בכרטיס. אפשר להקליד כאן"}
      />
      <TextField label="נושא" name="subject" required defaultValue={fieldValue(state, "subject", subject)} error={state.fieldErrors?.subject} />
      <TextAreaField label="תוכן המייל" name="body" rows={16} required defaultValue={fieldValue(state, "body", body)} error={state.fieldErrors?.body} />
      <p className="text-sm text-muted">ההערות הפרטיות, הקבצים ופרטי הקשר של המועמדים לא נכנסים למייל.</p>
      <FormMessage message={state.error} />
      <div className="flex flex-wrap gap-3">
        {sendingFrom && (
          <SubmitButton arrow pendingLabel="שולח…">
            שליחה מ-{sendingFrom}
          </SubmitButton>
        )}
        <Button type="button" variant={sendingFrom ? "secondary" : "primary"} arrow={!sendingFrom} onClick={openInMailProgram}>
          פתיחה בתוכנת המייל
        </Button>
      </div>
    </form>
  );
}
