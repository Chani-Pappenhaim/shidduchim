import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { cancelEngagementAction } from "@/actions/engagements";
import { CoupleStateBadge, MatchSourceBadge } from "@/components/engagements/couple-badges";
import { EngagementForm } from "@/components/engagements/engagement-form";
import { PartnerAvatar } from "@/components/engagements/partner-avatar";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { Section } from "@/components/ui/section";
import { Side } from "@/generated/prisma/enums";
import { cn } from "@/lib/cn";
import { coupleNames, coupleState, coupleTitle, PARTNER_NAME_LABELS, weddingCalendarUrl, weddingCountdown } from "@/lib/engagements";
import { daysUntil, formatDayYear, formatFullDay, formatHebrewDay } from "@/lib/format";
import { routes } from "@/lib/routes";
import { requireMatchmakerId } from "@/server/auth/session";
import { getEngagement, type EngagementDetails } from "@/server/services/engagement-service";

type Props = { params: Promise<{ id: string }> };

const loadEngagement = cache(async (id: string) => {
  const engagement = await getEngagement(await requireMatchmakerId(), id);
  if (!engagement) notFound();
  return engagement;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: coupleTitle(await loadEngagement((await params).id)) };
}

function Partner({ candidate, name, block }: { candidate: EngagementDetails["male"]; name: string; block: string }) {
  const avatar = (
    <div className="relative">
      <div aria-hidden className={cn("absolute inset-0 translate-x-2 translate-y-2", block)} />
      <PartnerAvatar candidate={candidate} name={name} className="relative border-2 border-ink" />
    </div>
  );
  if (!candidate) {
    return (
      <div className="flex flex-col gap-3">
        {avatar}
        <p className="font-display text-4xl leading-none">{name}</p>
      </div>
    );
  }
  return (
    <Link href={routes.candidate(candidate.id)} className="group flex flex-col gap-3">
      {avatar}
      <p className="font-display text-4xl leading-none group-hover:underline">{name}</p>
    </Link>
  );
}

// The side of the partner who is outside the database, if any
function outsideSide(engagement: EngagementDetails): Side | null {
  if (!engagement.female) return Side.MALE;
  if (!engagement.male) return Side.FEMALE;
  return null;
}

export default async function EngagementPage({ params }: Props) {
  const engagement = await loadEngagement((await params).id);
  const [maleName, femaleName] = coupleNames(engagement);
  const state = coupleState(engagement.weddingDate);
  const withOutsider = outsideSide(engagement);
  const { weddingDate } = engagement;

  return (
    <article className="flex flex-col gap-12">
      <header className="flex flex-col gap-6 border-b-2 border-ink pb-8">
        <Link href={routes.engagements} className="text-sm text-muted hover:text-ink">
          → כל המאורסים והנשואים
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <CoupleStateBadge state={state} />
          <MatchSourceBadge byMatchmaker={engagement.byMatchmaker} madeBy={engagement.madeBy} />
          <span className="text-sm text-muted">התארסו ב-{formatDayYear(engagement.engagedAt)}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:max-w-2xl md:gap-8">
          <Partner candidate={engagement.male} name={maleName} block="bg-teal" />
          <span aria-hidden className="font-display text-7xl text-coral">
            ♥
          </span>
          <Partner candidate={engagement.female} name={femaleName} block="bg-coral" />
        </div>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        <Section title="פרטים">
          <EngagementForm engagement={engagement} partnerLabel={withOutsider ? PARTNER_NAME_LABELS[withOutsider] : undefined} />
        </Section>
        <aside className="flex flex-col gap-8">
          <Section title="החתונה">
            {weddingDate ? (
              <div className="flex flex-col gap-2 bg-lime p-5">
                <p className="font-display text-4xl leading-none">{formatFullDay(weddingDate)}</p>
                <p>{formatHebrewDay(weddingDate)}</p>
                {engagement.weddingVenue && <p>{engagement.weddingVenue}</p>}
                <p className="font-medium">{state === "married" ? "מזל טוב, הם כבר נשואים" : weddingCountdown(daysUntil(weddingDate))}</p>
                {state === "engaged" && (
                  <a
                    href={weddingCalendarUrl(coupleTitle(engagement), weddingDate, engagement.weddingVenue)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline underline-offset-4"
                  >
                    הוספה ליומן ←
                  </a>
                )}
              </div>
            ) : (
              <p className="border-2 border-dashed border-line px-4 py-6 text-center text-muted">עוד אין תאריך. כשיהיה - מכניסים אותו בפרטים.</p>
            )}
          </Section>
          {engagement.introductionId && (
            <Link href={routes.introduction(engagement.introductionId)} className="text-sm underline underline-offset-4 hover:bg-lime">
              ההצעה שממנה זה התחיל ←
            </Link>
          )}
          <form action={cancelEngagementAction}>
            <input type="hidden" name="engagementId" value={engagement.id} />
            <ConfirmSubmit message="לבטל את האירוסין? המועמדים יחזרו להיות פנויים." variant="danger" size="sm" pendingLabel="מבטל…">
              ביטול אירוסין
            </ConfirmSubmit>
          </form>
        </aside>
      </div>
    </article>
  );
}
