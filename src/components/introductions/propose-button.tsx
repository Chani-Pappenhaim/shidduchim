"use client";

import { useActionState } from "react";
import { proposeAction } from "@/actions/introductions";
import { emptyFormState } from "@/lib/form-state";
import { SubmitButton } from "@/components/ui/submit-button";

// Records an introduction between the candidate and the partner shown on the card
export function ProposeButton({ candidateId, partnerId }: { candidateId: string; partnerId: string }) {
  const [state, action] = useActionState(proposeAction, emptyFormState);
  return (
    <form action={action} className="flex flex-col gap-1">
      <input type="hidden" name="candidateId" value={candidateId} />
      <input type="hidden" name="partnerId" value={partnerId} />
      <SubmitButton size="sm" variant="accent" arrow pendingLabel="מציע…" className="w-full">
        להציע
      </SubmitButton>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
