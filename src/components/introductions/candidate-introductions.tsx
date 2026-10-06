import Link from "next/link";
import { ageLabel, fullName } from "@/lib/candidates";
import { routes } from "@/lib/routes";
import type { CandidateIntroduction } from "@/server/services/introduction-service";
import { CandidateAvatar } from "@/components/candidates/candidate-avatar";
import { IntroductionStatusBadge } from "./introduction-status-badge";

// Who this candidate was already proposed to, newest activity first
export function CandidateIntroductions({ introductions }: { introductions: CandidateIntroduction[] }) {
  if (introductions.length === 0) return <p className="text-muted">עוד לא הוצעו הצעות.</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {introductions.map(({ id, status, proposedBy, partner }) => (
        <li key={id}>
          <Link href={routes.introduction(id)} className="flex items-center gap-3 border-2 border-ink p-2 transition-colors hover:bg-mist">
            <CandidateAvatar candidate={partner} photoId={partner.files[0]?.id} className="w-14 shrink-0" />
            <span className="flex min-w-0 flex-col gap-1">
              <span className="truncate font-display text-2xl leading-none">{fullName(partner)}</span>
              <span className="truncate text-xs text-muted">
                {[ageLabel(partner), partner.city, proposedBy && `הציע/ה: ${proposedBy}`].filter(Boolean).join(" · ")}
              </span>
              <span>
                <IntroductionStatusBadge status={status} />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
