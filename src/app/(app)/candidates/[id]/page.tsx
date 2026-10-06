import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { deleteCandidateAction } from "@/actions/candidates";
import { CandidateAvatar } from "@/components/candidates/candidate-avatar";
import { CandidateDetails } from "@/components/candidates/candidate-details";
import { CandidateFiles } from "@/components/candidates/candidate-files";
import { CandidateNotes } from "@/components/candidates/candidate-notes";
import { StatusBadge } from "@/components/candidates/status-badge";
import { CandidateIntroductions } from "@/components/introductions/candidate-introductions";
import { ReminderForm } from "@/components/reminders/reminder-form";
import { ReminderList } from "@/components/reminders/reminder-list";
import { LinkButton } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { Section } from "@/components/ui/section";
import { fullName, SIDE_LABELS } from "@/lib/candidates";
import { routes } from "@/lib/routes";
import { requireMatchmakerId } from "@/server/auth/session";
import { getCandidate } from "@/server/services/candidate-service";
import { introductionsOf } from "@/server/services/introduction-service";
import { listOpenReminders } from "@/server/services/reminder-service";

type Props = { params: Promise<{ id: string }> };

// Shared by the metadata and the page within one request
const loadCandidate = cache(async (id: string) => {
  const candidate = await getCandidate(await requireMatchmakerId(), id);
  if (!candidate) notFound();
  return candidate;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: fullName(await loadCandidate((await params).id)) };
}

function TextBlock({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <div className="reveal">
      <h3 className="mb-2 font-display text-3xl">{title}</h3>
      <p className="whitespace-pre-line leading-relaxed">{text}</p>
    </div>
  );
}

export default async function CandidatePage({ params }: Props) {
  const candidate = await loadCandidate((await params).id);
  const [introductions, reminders] = await Promise.all([
    introductionsOf(candidate.matchmakerId, candidate.id, candidate.side),
    listOpenReminders(candidate.matchmakerId, { candidateId: candidate.id }),
  ]);
  const photo = candidate.files.find((f) => f.kind === "PHOTO");
  const labels = SIDE_LABELS[candidate.side];

  return (
    <article className="grid gap-10 md:grid-cols-[300px_1fr] lg:gap-16">
      <aside className="flex flex-col gap-6">
        <Link href={routes.candidates(candidate.side)} className="text-sm text-muted hover:text-ink">
          → כל ה{labels.many}
        </Link>
        <div className="relative">
          <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 bg-lime" />
          <CandidateAvatar candidate={candidate} photoId={photo?.id} className="relative border-2 border-ink" />
        </div>
        <div className="flex flex-col gap-2">
          <LinkButton href={routes.match(candidate.id)} arrow>
            מציאת התאמה
          </LinkButton>
          <LinkButton href={routes.editCandidate(candidate.id)} variant="secondary" arrow>
            עריכת כרטיס
          </LinkButton>
        </div>
        <Section title="קבצים">
          <CandidateFiles candidateId={candidate.id} files={candidate.files} />
        </Section>
        <form action={deleteCandidateAction.bind(null, candidate.id)} className="mt-auto">
          <ConfirmSubmit
            message={`למחוק את הכרטיס של ${fullName(candidate)}? אי אפשר לבטל את הפעולה.`}
            variant="danger"
            size="sm"
            pendingLabel="מוחק…"
          >
            מחיקת כרטיס
          </ConfirmSubmit>
        </form>
      </aside>

      <div className="flex min-w-0 flex-col gap-10">
        <header className="border-b-2 border-ink pb-5">
          <div className="mb-3 flex items-center gap-2">
            <StatusBadge status={candidate.status} side={candidate.side} />
            <span className="text-sm text-muted">{labels.one}</span>
          </div>
          <h1 className="font-display text-7xl leading-none md:text-8xl">{fullName(candidate)}</h1>
        </header>

        <CandidateDetails candidate={candidate} />

        <Section title="הצעות">
          <CandidateIntroductions introductions={introductions} />
        </Section>
        <Section title="תזכורות">
          <div className="flex flex-col gap-4">
            {reminders.length > 0 && <ReminderList reminders={reminders} showSubject={false} />}
            <ReminderForm candidateId={candidate.id} />
          </div>
        </Section>
        <TextBlock title={`על ה${labels.one}`} text={candidate.about} />
        <TextBlock title="מה מחפשים" text={candidate.lookingFor} />
        <TextBlock title="פרטי משפחה" text={candidate.parentsInfo} />

        <Section title="הערות פרטיות">
          <CandidateNotes candidateId={candidate.id} notes={candidate.notes} />
        </Section>
      </div>
    </article>
  );
}
