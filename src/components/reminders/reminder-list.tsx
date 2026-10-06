import Link from "next/link";
import { deleteReminderAction, setReminderDoneAction } from "@/actions/reminders";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { cn } from "@/lib/cn";
import { formatDay } from "@/lib/format";
import { reminderSubject, reminderTiming } from "@/lib/reminders";
import type { ReminderItem } from "@/server/services/reminder-service";

function DueBadge({ dueAt }: { dueAt: Date }) {
  const timing = reminderTiming(dueAt);
  if (timing === "today") return <Badge tone="lime">היום</Badge>;
  if (timing === "overdue") return <Badge tone="coral">באיחור · {formatDay(dueAt)}</Badge>;
  return <Badge>{formatDay(dueAt)}</Badge>;
}

function ReminderRow({ reminder, showSubject }: { reminder: ReminderItem; showSubject: boolean }) {
  const done = reminder.doneAt !== null;
  const subject = showSubject ? reminderSubject(reminder) : null;

  return (
    <li className="flex items-start gap-3 border-b-2 border-line py-3">
      <form action={setReminderDoneAction}>
        <input type="hidden" name="reminderId" value={reminder.id} />
        <input type="hidden" name="done" value={String(!done)} />
        <button
          type="submit"
          aria-label={done ? "החזרה לרשימה" : "סימון כבוצע"}
          className={cn(
            "grid size-7 place-items-center border-2 border-ink text-sm font-bold transition-colors hover:bg-lime",
            done && "bg-lime",
          )}
        >
          {done && "✓"}
        </button>
      </form>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className={cn("font-medium", done && "text-muted line-through")}>{reminder.title}</p>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          {!done && <DueBadge dueAt={reminder.dueAt} />}
          {subject && (
            <Link href={subject.href} className="hover:text-ink hover:underline">
              {subject.label}
            </Link>
          )}
        </div>
      </div>
      <form action={deleteReminderAction}>
        <input type="hidden" name="reminderId" value={reminder.id} />
        <ConfirmSubmit message="למחוק את התזכורת?" variant="ghost" size="sm" pendingLabel="מוחק…" className="text-xs text-muted">
          מחיקה
        </ConfirmSubmit>
      </form>
    </li>
  );
}

// Reminders with a done toggle; the subject link is hidden where the page already shows it
export function ReminderList({ reminders, showSubject = true }: { reminders: ReminderItem[]; showSubject?: boolean }) {
  return (
    <ul className="flex flex-col">
      {reminders.map((reminder) => (
        <ReminderRow key={reminder.id} reminder={reminder} showSubject={showSubject} />
      ))}
    </ul>
  );
}
