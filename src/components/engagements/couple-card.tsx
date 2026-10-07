import Link from "next/link";
import { cn } from "@/lib/cn";
import { coupleNames, coupleState } from "@/lib/engagements";
import { formatDay, formatDayYear } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { EngagementItem } from "@/server/services/engagement-service";
import { CoupleStateBadge, MatchSourceBadge } from "./couple-badges";
import { PartnerAvatar } from "./partner-avatar";

// An engaged or married couple: both photos, names, and the dates that matter
export function CoupleCard({ engagement }: { engagement: EngagementItem }) {
  const [maleName, femaleName] = coupleNames(engagement);
  const state = coupleState(engagement.weddingDate);

  return (
    <Link href={routes.engagement(engagement.id)} className="group relative block h-full">
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 translate-x-2 translate-y-2 transition-transform duration-200 group-hover:translate-x-3 group-hover:translate-y-3",
          engagement.byMatchmaker ? "bg-lime" : "bg-sky",
        )}
      />
      <article className="relative flex h-full flex-col border-2 border-ink bg-paper transition-transform duration-200 group-hover:-translate-y-1">
        <div className="grid grid-cols-2 border-b-2 border-ink">
          <PartnerAvatar candidate={engagement.male} name={maleName} className="border-l-2 border-ink" />
          <PartnerAvatar candidate={engagement.female} name={femaleName} />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap gap-2">
            <CoupleStateBadge state={state} />
            <MatchSourceBadge byMatchmaker={engagement.byMatchmaker} madeBy={engagement.madeBy} />
          </div>
          <h3 className="font-display text-3xl leading-none">
            {maleName} ו{femaleName}
          </h3>
          <p className="mt-auto text-sm text-muted">
            התארסו ב-{formatDayYear(engagement.engagedAt)}
            {engagement.weddingDate && (
              <>
                {" · "}
                {state === "married" ? "התחתנו" : "חתונה"} ב-{formatDay(engagement.weddingDate)}
              </>
            )}
          </p>
        </div>
      </article>
    </Link>
  );
}
