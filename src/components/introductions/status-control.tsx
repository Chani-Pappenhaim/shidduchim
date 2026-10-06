import type { IntroductionStatus } from "@/generated/prisma/enums";
import { changeIntroductionStatusAction } from "@/actions/introductions";
import { cn } from "@/lib/cn";
import { INTRODUCTION_STATUS_LABELS, INTRODUCTION_STATUSES } from "@/lib/introductions";
import { buttonStyles } from "@/components/ui/button-styles";

// One button per stage; the current stage is highlighted
export function StatusControl({ introductionId, status }: { introductionId: string; status: IntroductionStatus }) {
  return (
    <form action={changeIntroductionStatusAction} className="flex flex-wrap gap-2">
      <input type="hidden" name="introductionId" value={introductionId} />
      {INTRODUCTION_STATUSES.map((option) => {
        const current = option === status;
        return (
          <button
            key={option}
            name="status"
            value={option}
            disabled={current}
            aria-pressed={current}
            className={cn(buttonStyles(current ? "accent" : "secondary", "sm"), current && "disabled:opacity-100")}
          >
            {INTRODUCTION_STATUS_LABELS[option]}
          </button>
        );
      })}
    </form>
  );
}
