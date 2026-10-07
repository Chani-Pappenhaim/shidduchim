"use client";

import { useActionState } from "react";
import type { IntroductionStatus } from "@/generated/prisma/enums";
import { changeIntroductionStatusAction } from "@/actions/introductions";
import { buttonStyles } from "@/components/ui/button-styles";
import { FormMessage } from "@/components/ui/form-message";
import { cn } from "@/lib/cn";
import { emptyFormState } from "@/lib/form-state";
import { INTRODUCTION_STATUS_LABELS, INTRODUCTION_STATUSES } from "@/lib/introductions";

// One button per stage; the current stage is highlighted
export function StatusControl({ introductionId, status }: { introductionId: string; status: IntroductionStatus }) {
  const [state, action, pending] = useActionState(changeIntroductionStatusAction, emptyFormState);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="introductionId" value={introductionId} />
      <div className="flex flex-wrap gap-2">
        {INTRODUCTION_STATUSES.map((option) => {
          const current = option === status;
          return (
            <button
              key={option}
              name="status"
              value={option}
              disabled={current || pending}
              aria-pressed={current}
              className={cn(buttonStyles(current ? "accent" : "secondary", "sm"), current && "disabled:opacity-100")}
            >
              {INTRODUCTION_STATUS_LABELS[option]}
            </button>
          );
        })}
      </div>
      <FormMessage message={state.error} />
    </form>
  );
}
