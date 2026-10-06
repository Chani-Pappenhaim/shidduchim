import type { IntroductionStatus } from "@/generated/prisma/enums";
import { Badge, type Tone } from "@/components/ui/badge";
import { INTRODUCTION_STATUS_LABELS } from "@/lib/introductions";

const TONES: Record<IntroductionStatus, Tone> = {
  PROPOSED: "sand",
  CHECKING: "sky",
  MEETING: "teal",
  ENGAGED: "lime",
  DECLINED: "mist",
};

export function IntroductionStatusBadge({ status }: { status: IntroductionStatus }) {
  return <Badge tone={TONES[status]}>{INTRODUCTION_STATUS_LABELS[status]}</Badge>;
}
