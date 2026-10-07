import type { CandidateStatus, Side } from "@/generated/prisma/enums";
import { Badge, type Tone } from "@/components/ui/badge";
import { statusLabel } from "@/lib/candidates";

const TONES: Record<CandidateStatus, Tone> = {
  AVAILABLE: "teal",
  IN_PROCESS: "sky",
  PAUSED: "mist",
  ENGAGED: "lime",
  MARRIED: "sand",
};

export function StatusBadge({ status, side }: { status: CandidateStatus; side: Side }) {
  return <Badge tone={TONES[status]}>{statusLabel(status, side)}</Badge>;
}
