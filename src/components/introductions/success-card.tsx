import Link from "next/link";
import { CandidateAvatar } from "@/components/candidates/candidate-avatar";
import { fullName } from "@/lib/candidates";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { Success } from "@/server/services/introduction-service";

// An engaged couple, celebrated with both photos side by side
export function SuccessCard({ success }: { success: Success }) {
  const { male, female } = success;

  return (
    <Link href={routes.introduction(success.id)} className="group relative block">
      <div aria-hidden className="absolute inset-0 translate-x-2 translate-y-2 bg-lime transition-transform duration-200 group-hover:translate-x-3 group-hover:translate-y-3" />
      <article className="relative flex h-full flex-col border-2 border-ink bg-paper transition-transform duration-200 group-hover:-translate-y-1">
        <div className="grid grid-cols-2 border-b-2 border-ink">
          <CandidateAvatar candidate={male} photoId={male.files[0]?.id} className="border-l-2 border-ink" />
          <CandidateAvatar candidate={female} photoId={female.files[0]?.id} />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-sm font-bold">מזל טוב!</p>
          <h3 className="font-display text-3xl leading-none">
            {fullName(male)} ו{fullName(female)}
          </h3>
          <p className="mt-auto text-sm text-muted">
            {success.engagedAt && <>התארסו ב-{formatDate(success.engagedAt)}</>}
            {success.proposedBy && <> · הציע/ה: {success.proposedBy}</>}
          </p>
        </div>
      </article>
    </Link>
  );
}
