import { disconnectMailAction } from "@/actions/mail-connection";
import { buttonStyles } from "@/components/ui/button-styles";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { FormMessage } from "@/components/ui/form-message";

type Props = { connectedEmail: string | null; available: boolean; result?: string };

const RESULTS: Record<string, { text: string; tone: "error" | "success" }> = {
  connected: { text: "חשבון הג׳ימייל חובר. מעכשיו הצעות יישלחו ממנו", tone: "success" },
  error: { text: "החיבור לא הושלם. אפשר לנסות שוב", tone: "error" },
  unavailable: { text: "החיבור לג׳ימייל עדיין לא הוגדר במערכת", tone: "error" },
};

// Connects the matchmaker's Gmail so proposals go out from their own address
export function MailConnectionPanel({ connectedEmail, available, result }: Props) {
  const message = result ? RESULTS[result] : undefined;
  return (
    <div className="flex max-w-2xl flex-col gap-4 bg-mist p-5">
      {message && <FormMessage message={message.text} tone={message.tone} />}
      {connectedEmail ? (
        <>
          <p>
            הצעות במייל נשלחות מהכתובת <strong dir="ltr">{connectedEmail}</strong>
          </p>
          <form action={disconnectMailAction}>
            <ConfirmSubmit message="לנתק את חשבון המייל?" variant="secondary" size="sm" pendingLabel="מנתק…">
              ניתוק
            </ConfirmSubmit>
          </form>
        </>
      ) : (
        <>
          <p>
            בלי חיבור, הצעות נפתחות בתוכנת המייל שלך ונשלחות משם. עם חיבור לג׳ימייל אפשר לשלוח ישר מהמערכת, מהכתובת שלך.
          </p>
          {available && (
            // A plain link: the OAuth route redirects to Google, which client-side navigation cannot follow
            <a href="/api/oauth/google/start" className={buttonStyles("primary", "md", "self-start")}>
              חיבור חשבון ג׳ימייל
              <span aria-hidden>←</span>
            </a>
          )}
        </>
      )}
    </div>
  );
}
