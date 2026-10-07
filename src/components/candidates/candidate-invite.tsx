"use client";

import { useActionState, useState } from "react";
import { createInviteAction, revokeInviteAction, type InviteState } from "@/actions/candidate-invites";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";

type Props = { candidateId: string; hasEmail: boolean; invite: { createdAt: Date; expiresAt: Date } | null };

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <input readOnly value={url} dir="ltr" aria-label="קישור ההזמנה" className="w-full border-2 border-ink bg-paper px-2 py-1.5 text-xs" onFocus={(e) => e.target.select()} />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => navigator.clipboard.writeText(url).then(() => setCopied(true))}
      >
        {copied ? "הועתק ✓" : "העתקת הקישור"}
      </Button>
    </div>
  );
}

// Lets the matchmaker invite the candidate to fill in their own details through a personal link
export function CandidateInvite({ candidateId, hasEmail, invite }: Props) {
  const [state, action] = useActionState<InviteState>(createInviteAction.bind(null, candidateId), {});

  if (!hasEmail) return <p className="text-sm text-muted">כדי להזמין את המועמד/ת למלא פרטים בעצמו/ה, צריך להוסיף מייל לכרטיס.</p>;

  return (
    <div className="flex flex-col gap-3 text-sm">
      {invite ? (
        <p>
          נשלחה הזמנה ב-{formatDate(invite.createdAt)}, בתוקף עד {formatDate(invite.expiresAt)}.
        </p>
      ) : (
        <p className="text-muted">קישור אישי במייל, שבו המועמד/ת ממלא/ת פרטים בעצמו/ה. ההערות שלך לא מוצגות שם.</p>
      )}
      <FormMessage message={state.error} />
      {state.url && (
        <>
          <FormMessage message="ההזמנה נשלחה במייל. אפשר גם להעביר את הקישור בעצמך:" tone="success" />
          <CopyLink url={state.url} />
        </>
      )}
      <div className="flex flex-wrap gap-2">
        <form action={action}>
          <SubmitButton variant="secondary" size="sm" pendingLabel="שולח…">
            {invite ? "שליחת הזמנה חדשה" : "הזמנה למילוי פרטים"}
          </SubmitButton>
        </form>
        {invite && (
          <form action={revokeInviteAction.bind(null, candidateId)}>
            <ConfirmSubmit message="לבטל את הקישור? המועמד/ת לא יוכל/תוכל להיכנס איתו." variant="ghost" size="sm" pendingLabel="מבטל…">
              ביטול הקישור
            </ConfirmSubmit>
          </form>
        )}
      </div>
    </div>
  );
}
