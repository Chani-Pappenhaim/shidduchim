import Link from "next/link";
import { fullName } from "@/lib/candidates";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { IntroductionSummary } from "@/server/services/introduction-service";
import { CandidateAvatar } from "@/components/candidates/candidate-avatar";
import { IntroductionStatusBadge } from "./introduction-status-badge";

function Person({ candidate }: { candidate: IntroductionSummary["male"] }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <CandidateAvatar candidate={candidate} photoId={candidate.files[0]?.id} className="w-12 shrink-0 border-2 border-ink" />
      <span className="truncate font-display text-3xl leading-none">{fullName(candidate)}</span>
    </span>
  );
}

// One introduction in a list: the couple, its status and when it last moved
export function CoupleRow({ introduction }: { introduction: IntroductionSummary }) {
  return (
    <Link
      href={routes.introduction(introduction.id)}
      className="grid items-center gap-3 border-b-2 border-line px-2 py-4 transition-colors hover:bg-mist md:grid-cols-[1fr_auto_1fr_auto]"
    >
      <Person candidate={introduction.male} />
      <span aria-hidden className="hidden font-display text-3xl text-coral md:block">
        +
      </span>
      <Person candidate={introduction.female} />
      <span className="flex flex-wrap items-center gap-3 text-sm text-muted md:justify-end">
        <IntroductionStatusBadge status={introduction.status} />
        {introduction.proposedBy && <span>הציע/ה: {introduction.proposedBy}</span>}
        <time dateTime={introduction.updatedAt.toISOString()}>{formatDate(introduction.updatedAt)}</time>
      </span>
    </Link>
  );
}
