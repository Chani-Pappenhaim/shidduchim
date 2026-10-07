import Link from "next/link";
import type { ReactNode } from "react";
import { ageLabel, fullName } from "@/lib/candidates";
import { routes } from "@/lib/routes";
import { BlockCard } from "@/components/ui/block-card";
import type { CandidateSummary } from "@/server/services/candidate-service";
import { CandidateAvatar } from "./candidate-avatar";
import { StatusBadge } from "./status-badge";

const BLOCKS = ["bg-teal", "bg-coral", "bg-sky", "bg-sand"];

type Props = {
  candidate: CandidateSummary;
  index?: number;
  href?: string;
  // Extra content under the details, e.g. the relation to another candidate
  footer?: ReactNode;
};

// Editorial card with a flat color block offset behind it
export function CandidateCard({ candidate, index = 0, href = routes.candidate(candidate.id), footer }: Props) {
  const meta = [ageLabel(candidate), candidate.city, candidate.community].filter(Boolean).join(" · ");

  return (
    <BlockCard block={BLOCKS[index % BLOCKS.length]} index={index}>
      <article className="flex flex-1 flex-col">
        <Link href={href} className="flex flex-1 flex-col focus-visible:outline-none">
          <CandidateAvatar candidate={candidate} photoId={candidate.files[0]?.id} className="border-b-2 border-ink" />
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-3xl leading-none">{fullName(candidate)}</h3>
              <StatusBadge status={candidate.status} side={candidate.side} />
            </div>
            {meta && <p className="text-sm text-muted">{meta}</p>}
            {candidate.occupation && <p className="line-clamp-1 text-sm">{candidate.occupation}</p>}
          </div>
        </Link>
        {footer && <div className="border-t-2 border-ink p-3">{footer}</div>}
      </article>
    </BlockCard>
  );
}
