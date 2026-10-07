import type { Metadata } from "next";
import Link from "next/link";
import { WeddingRow } from "@/components/engagements/wedding-row";
import { CoupleRow } from "@/components/introductions/couple-row";
import { ReminderForm } from "@/components/reminders/reminder-form";
import { ReminderList } from "@/components/reminders/reminder-list";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Side } from "@/generated/prisma/enums";
import { cn } from "@/lib/cn";
import { formatDate, todayDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { requireMatchmakerId } from "@/server/auth/session";
import { countCandidatesBySide } from "@/server/services/candidate-service";
import { engagementsThisYear, listUpcomingWeddings } from "@/server/services/engagement-service";
import { countOpenIntroductions, listActiveIntroductions } from "@/server/services/introduction-service";
import { getMatchmakerProfile } from "@/server/services/matchmaker-service";
import { listOpenReminders } from "@/server/services/reminder-service";

export const metadata: Metadata = { title: "היום שלי" };

const ACTIVE_INTRODUCTIONS_SHOWN = 6;
const UPCOMING_WEDDINGS_SHOWN = 3;

function Stat({ label, value, href, block }: { label: string; value: number; href: string; block: string }) {
  return (
    <Link href={href} className="group relative block">
      <div aria-hidden className={cn("absolute inset-0 translate-x-2 translate-y-2 transition-transform group-hover:translate-x-3 group-hover:translate-y-3", block)} />
      <div className="relative flex flex-col gap-1 border-2 border-ink bg-paper p-4 transition-transform group-hover:-translate-y-1">
        <span className="font-display text-7xl leading-none">{value}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const matchmakerId = await requireMatchmakerId();
  const [profile, sides, openCount, engagedThisYear, dueReminders, active, weddings] = await Promise.all([
    getMatchmakerProfile(matchmakerId),
    countCandidatesBySide(matchmakerId),
    countOpenIntroductions(matchmakerId),
    engagementsThisYear(matchmakerId),
    listOpenReminders(matchmakerId, { until: todayDate() }),
    listActiveIntroductions(matchmakerId, ACTIVE_INTRODUCTIONS_SHOWN),
    listUpcomingWeddings(matchmakerId, UPCOMING_WEDDINGS_SHOWN),
  ]);

  return (
    <>
      <PageHeader
        title="היום שלי"
        subtitle={`שלום ${profile.name} · ${formatDate(new Date())}`}
        actions={
          <>
            <LinkButton href={routes.newCandidate(Side.MALE)} variant="secondary" size="sm">
              + בחור
            </LinkButton>
            <LinkButton href={routes.newCandidate(Side.FEMALE)} variant="secondary" size="sm">
              + בחורה
            </LinkButton>
          </>
        }
      />

      <div className="reveal mb-14 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
        <Stat label="בחורים" value={sides.MALE} href={routes.candidates(Side.MALE)} block="bg-teal" />
        <Stat label="בחורות" value={sides.FEMALE} href={routes.candidates(Side.FEMALE)} block="bg-coral" />
        <Stat label="הצעות פתוחות" value={openCount} href={routes.introductions} block="bg-sky" />
        <Stat label="אירוסין השנה" value={engagedThisYear} href={`${routes.engagements}?by=me`} block="bg-lime" />
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <Section
          title="הצעות בתנועה"
          actions={
            <Link href={routes.introductions} className="text-sm text-muted hover:text-ink">
              לכל השידוכים ←
            </Link>
          }
        >
          {active.length === 0 ? (
            <EmptyState title="אין הצעות פתוחות">פותחים כרטיס של מועמד ולוחצים על ״מציאת התאמה״</EmptyState>
          ) : (
            <div className="border-t-2 border-ink">
              {active.map((introduction) => (
                <CoupleRow key={introduction.id} introduction={introduction} />
              ))}
            </div>
          )}
        </Section>

        <Section
          title="לטיפול היום"
          actions={
            <Link href={routes.reminders} className="text-sm text-muted hover:text-ink">
              כל התזכורות ←
            </Link>
          }
        >
          <div className="flex flex-col gap-4">
            {dueReminders.length > 0 ? (
              <ReminderList reminders={dueReminders} />
            ) : (
              <p className="border-2 border-dashed border-line px-4 py-6 text-center text-muted">אין משימות להיום</p>
            )}
            <ReminderForm />
          </div>
        </Section>
      </div>

      {weddings.length > 0 && (
        <div className="mt-14">
          <Section
            title="חתונות קרובות"
            actions={
              <Link href={routes.weddings} className="text-sm text-muted hover:text-ink">
                ללוח החתונות ←
              </Link>
            }
          >
            <div className="border-t-2 border-ink">
              {weddings.map((engagement) => (
                <WeddingRow key={engagement.id} engagement={engagement} showSource={false} />
              ))}
            </div>
          </Section>
        </div>
      )}
    </>
  );
}
