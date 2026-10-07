import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EngagementForm } from "@/components/engagements/engagement-form";
import { PageHeader } from "@/components/ui/page-header";
import { fullName } from "@/lib/candidates";
import { PARTNER_NAME_LABELS } from "@/lib/engagements";
import { routes } from "@/lib/routes";
import { requireMatchmakerId } from "@/server/auth/session";
import { getCandidateSummary } from "@/server/services/candidate-service";
import { engagementOf } from "@/server/services/engagement-service";

export const metadata: Metadata = { title: "סימון אירוסין" };

// Marks a candidate as engaged to someone who is not in the matchmaker's database
export default async function NewEngagementPage({ searchParams }: { searchParams: Promise<{ candidateId?: string }> }) {
  const { candidateId } = await searchParams;
  const matchmakerId = await requireMatchmakerId();
  const candidate = candidateId ? await getCandidateSummary(matchmakerId, candidateId) : null;
  if (!candidate) notFound();
  const existing = await engagementOf(matchmakerId, candidate.id);
  if (existing) redirect(routes.engagement(existing.id));

  return (
    <div className="max-w-2xl">
      <Link href={routes.candidate(candidate.id)} className="text-sm text-muted hover:text-ink">
        → חזרה לכרטיס
      </Link>
      <PageHeader
        title={`מזל טוב ל${candidate.firstName}!`}
        subtitle={`סימון האירוסין של ${fullName(candidate)}. אם בן/בת הזוג במאגר שלך - עדיף לסמן ״אירוסין״ בהצעה עצמה.`}
      />
      <EngagementForm candidateId={candidate.id} partnerLabel={PARTNER_NAME_LABELS[candidate.side]} />
    </div>
  );
}
