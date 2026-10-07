import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { Side } from "@/generated/prisma/enums";
import { coupleNames, coupleState } from "@/lib/engagements";
import { formatDayYear } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { EngagementItem } from "@/server/services/engagement-service";
import { CoupleStateBadge } from "./couple-badges";

type Props = { candidateId: string; side: Side; engagement: EngagementItem | null };

// On a candidate's page: who they are engaged or married to, or a way to mark the engagement
export function CandidateEngagement({ candidateId, side, engagement }: Props) {
  if (!engagement) {
    return (
      <LinkButton href={routes.newEngagement(candidateId)} variant="secondary" arrow>
        סימון אירוסין
      </LinkButton>
    );
  }
  const [maleName, femaleName] = coupleNames(engagement);
  const partner = side === Side.MALE ? femaleName : maleName;
  return (
    <Link href={routes.engagement(engagement.id)} className="group flex flex-col gap-1 border-2 border-ink bg-lime p-4 hover:shadow-pop">
      <CoupleStateBadge state={coupleState(engagement.weddingDate)} />
      <span className="font-display text-3xl leading-none group-hover:underline">עם {partner}</span>
      <span className="text-sm">
        {engagement.weddingDate ? `חתונה ב-${formatDayYear(engagement.weddingDate)}` : `התארסו ב-${formatDayYear(engagement.engagedAt)}`}
      </span>
    </Link>
  );
}
