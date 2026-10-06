import { IntroductionEventType, type IntroductionStatus } from "@/generated/prisma/enums";
import { INTRODUCTION_STATUS_LABELS } from "@/lib/introductions";
import { formatDateTime } from "@/lib/format";

type Event = { id: string; type: IntroductionEventType; status: IntroductionStatus | null; message: string | null; createdAt: Date };

function describe(event: Event): string {
  switch (event.type) {
    case IntroductionEventType.CREATED:
      return "ההצעה נרשמה";
    case IntroductionEventType.STATUS_CHANGED:
      return event.status ? `הסטטוס עודכן ל"${INTRODUCTION_STATUS_LABELS[event.status]}"` : "הסטטוס עודכן";
    case IntroductionEventType.MEETING_ADDED:
      return "נרשמה פגישה";
    case IntroductionEventType.EMAIL_SENT:
      return "נשלח מייל";
  }
}

// Everything that happened in the introduction, newest first
export function IntroductionTimeline({ events }: { events: Event[] }) {
  return (
    <ol className="relative flex flex-col gap-4 border-r-2 border-ink pr-5">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span aria-hidden className="absolute -right-[27px] top-1.5 size-3 border-2 border-ink bg-lime" />
          <p className="font-medium">{describe(event)}</p>
          {event.message && <p className="text-sm">{event.message}</p>}
          <time dateTime={event.createdAt.toISOString()} className="text-xs text-muted">
            {formatDateTime(event.createdAt)}
          </time>
        </li>
      ))}
    </ol>
  );
}
