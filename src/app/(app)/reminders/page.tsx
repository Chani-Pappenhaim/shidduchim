import type { Metadata } from "next";
import { ReminderForm } from "@/components/reminders/reminder-form";
import { ReminderList } from "@/components/reminders/reminder-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { reminderTiming, type ReminderTiming } from "@/lib/reminders";
import { requireMatchmakerId } from "@/server/auth/session";
import { listDoneReminders, listOpenReminders } from "@/server/services/reminder-service";

export const metadata: Metadata = { title: "תזכורות" };

const GROUPS: { timing: ReminderTiming; title: string }[] = [
  { timing: "overdue", title: "באיחור" },
  { timing: "today", title: "היום" },
  { timing: "upcoming", title: "בהמשך" },
];

export default async function RemindersPage() {
  const matchmakerId = await requireMatchmakerId();
  const [open, done] = await Promise.all([listOpenReminders(matchmakerId), listDoneReminders(matchmakerId)]);

  return (
    <>
      <PageHeader title="תזכורות" subtitle={open.length > 0 ? `${open.length} פתוחות` : "אין משימות פתוחות"} />
      <div className="flex flex-col gap-12">
        <ReminderForm />
        {open.length === 0 && <EmptyState title="הכל מטופל">תזכורת חדשה אפשר להוסיף כאן או מכרטיס של מועמד או הצעה</EmptyState>}
        {GROUPS.map(({ timing, title }) => {
          const reminders = open.filter((reminder) => reminderTiming(reminder.dueAt) === timing);
          if (reminders.length === 0) return null;
          return (
            <Section key={timing} title={title}>
              <ReminderList reminders={reminders} />
            </Section>
          );
        })}
        {done.length > 0 && (
          <Section title="בוצעו לאחרונה">
            <ReminderList reminders={done} />
          </Section>
        )}
      </div>
    </>
  );
}
