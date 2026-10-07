import Link from "next/link";
import { cn } from "@/lib/cn";
import { coupleTitle, weddingCalendarUrl, weddingCountdown } from "@/lib/engagements";
import { daysUntil, formatFullDay, formatHebrewDay } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { WeddingItem } from "@/server/services/engagement-service";
import { MatchSourceBadge } from "./couple-badges";

type Props = { engagement: WeddingItem; showSource?: boolean };

// One wedding on the board: the date, how soon it is, the couple and where
export function WeddingRow({ engagement, showSource = true }: Props) {
  const title = coupleTitle(engagement);
  const days = daysUntil(engagement.weddingDate);
  const soon = days <= 7;

  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-4 border-b-2 border-line px-2 py-4 md:grid-cols-[auto_1fr_auto]">
      <div className={cn("flex w-20 flex-col items-center border-2 border-ink py-1", soon ? "bg-lime" : "bg-paper")}>
        <span className="font-display text-5xl leading-none">{engagement.weddingDate.getUTCDate()}</span>
        <span className="text-xs">{weddingCountdown(days)}</span>
      </div>
      <div className="min-w-0">
        <Link href={routes.engagement(engagement.id)} className="font-display text-3xl leading-none hover:underline">
          {title}
        </Link>
        <p className="text-sm text-muted">
          {formatFullDay(engagement.weddingDate)} · {formatHebrewDay(engagement.weddingDate)}
          {engagement.weddingVenue && ` · ${engagement.weddingVenue}`}
        </p>
        {showSource && !engagement.byMatchmaker && (
          <div className="mt-1">
            <MatchSourceBadge byMatchmaker={false} madeBy={engagement.madeBy} />
          </div>
        )}
      </div>
      <a
        href={weddingCalendarUrl(title, engagement.weddingDate, engagement.weddingVenue)}
        target="_blank"
        rel="noreferrer"
        className="col-span-2 text-sm underline underline-offset-4 hover:bg-lime md:col-span-1"
      >
        הוספה ליומן ←
      </a>
    </div>
  );
}
