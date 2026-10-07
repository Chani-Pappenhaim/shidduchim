import { Badge } from "@/components/ui/badge";
import { COUPLE_STATE_LABELS, type CoupleState } from "@/lib/engagements";

export function CoupleStateBadge({ state }: { state: CoupleState }) {
  return <Badge tone={state === "married" ? "sand" : "lime"}>{COUPLE_STATE_LABELS[state]}</Badge>;
}

// Whether the matchmaker made this match, or who did
export function MatchSourceBadge({ byMatchmaker, madeBy }: { byMatchmaker: boolean; madeBy: string | null }) {
  if (byMatchmaker) return <Badge tone="ink">★ בזכותי</Badge>;
  return <Badge>{madeBy ? `שודכו ע״י ${madeBy}` : "לא דרכי"}</Badge>;
}
