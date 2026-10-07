import { CandidateAvatar } from "@/components/candidates/candidate-avatar";
import { personFromName } from "@/lib/engagements";

type Props = { candidate: { firstName: string; lastName: string; files: { id: string }[] } | null; name: string; className?: string };

// A partner's photo, or initials with a note when the partner is not in the database
export function PartnerAvatar({ candidate, name, className }: Props) {
  if (candidate) return <CandidateAvatar candidate={candidate} photoId={candidate.files[0]?.id} className={className} />;
  return (
    <div className="relative">
      <CandidateAvatar candidate={personFromName(name)} className={className} />
      <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1 text-center text-xs text-paper">לא במאגר שלי</span>
    </div>
  );
}
