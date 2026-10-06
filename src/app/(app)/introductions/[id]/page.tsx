import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { deleteIntroductionAction } from "@/actions/introductions";
import { CandidateAvatar } from "@/components/candidates/candidate-avatar";
import { IntroductionDetailsForm } from "@/components/introductions/introduction-details-form";
import { IntroductionStatusBadge } from "@/components/introductions/introduction-status-badge";
import { IntroductionTimeline } from "@/components/introductions/introduction-timeline";
import { Meetings } from "@/components/introductions/meetings";
import { StatusControl } from "@/components/introductions/status-control";
import { ReminderForm } from "@/components/reminders/reminder-form";
import { ReminderList } from "@/components/reminders/reminder-list";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { Section } from "@/components/ui/section";
import { ageLabel, fullName } from "@/lib/candidates";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { requireMatchmakerId } from "@/server/auth/session";
import { getIntroduction, type IntroductionDetails } from "@/server/services/introduction-service";
import { listOpenReminders } from "@/server/services/reminder-service";

type Props = { params: Promise<{ id: string }> };

const loadIntroduction = cache(async (id: string) => {
  const introduction = await getIntroduction(await requireMatchmakerId(), id);
  if (!introduction) notFound();
  return introduction;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { male, female } = await loadIntroduction((await params).id);
  return { title: `${male.firstName} ו${female.firstName}` };
}

function Partner({ candidate, block }: { candidate: IntroductionDetails["male"]; block: string }) {
  return (
    <Link href={routes.candidate(candidate.id)} className="group flex flex-col gap-3">
      <div className="relative">
        <div
          aria-hidden
          className={cn("absolute inset-0 translate-x-2 translate-y-2 transition-transform group-hover:translate-x-3 group-hover:translate-y-3", block)}
        />
        <CandidateAvatar candidate={candidate} photoId={candidate.files[0]?.id} className="relative border-2 border-ink" />
      </div>
      <div>
        <p className="font-display text-4xl leading-none group-hover:underline">{fullName(candidate)}</p>
        <p className="text-sm text-muted">{[ageLabel(candidate), candidate.city, candidate.community].filter(Boolean).join(" · ")}</p>
      </div>
    </Link>
  );
}

export default async function IntroductionPage({ params }: Props) {
  const introduction = await loadIntroduction((await params).id);
  const reminders = await listOpenReminders(await requireMatchmakerId(), { introductionId: introduction.id });

  return (
    <article className="flex flex-col gap-12">
      <header className="flex flex-col gap-6 border-b-2 border-ink pb-8">
        <Link href={routes.introductions} className="text-sm text-muted hover:text-ink">
          → כל השידוכים
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <IntroductionStatusBadge status={introduction.status} />
          <span className="text-sm text-muted">
            הוצע ב-{formatDate(introduction.createdAt)}
            {introduction.proposedBy && ` · הציע/ה: ${introduction.proposedBy}`}
          </span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:max-w-2xl md:gap-8">
          <Partner candidate={introduction.male} block="bg-teal" />
          <span aria-hidden className="font-display text-7xl text-coral">
            +
          </span>
          <Partner candidate={introduction.female} block="bg-coral" />
        </div>
        <StatusControl introductionId={introduction.id} status={introduction.status} />
      </header>

      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-12">
          <Section title="פגישות">
            <Meetings introductionId={introduction.id} meetings={introduction.meetings} />
          </Section>
          <Section title="פרטי ההצעה">
            <IntroductionDetailsForm introductionId={introduction.id} proposedBy={introduction.proposedBy} note={introduction.note} />
          </Section>
        </div>
        <aside className="flex flex-col gap-8">
          <Section title="תזכורות">
            <div className="flex flex-col gap-4">
              {reminders.length > 0 && <ReminderList reminders={reminders} showSubject={false} />}
              <ReminderForm introductionId={introduction.id} placeholder="למשל: לשאול איך הייתה הפגישה" />
            </div>
          </Section>
          <Section title="מה היה עד עכשיו">
            <IntroductionTimeline events={introduction.events} />
          </Section>
          <form action={deleteIntroductionAction}>
            <input type="hidden" name="introductionId" value={introduction.id} />
            <ConfirmSubmit message="למחוק את ההצעה וכל הפגישות שלה?" variant="danger" size="sm" pendingLabel="מוחק…">
              מחיקת ההצעה
            </ConfirmSubmit>
          </form>
        </aside>
      </div>
    </article>
  );
}
