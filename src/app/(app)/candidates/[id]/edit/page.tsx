import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CandidateForm } from "@/components/candidates/candidate-form";
import { PageHeader } from "@/components/ui/page-header";
import { fullName } from "@/lib/candidates";
import { routes } from "@/lib/routes";
import { requireMatchmakerId } from "@/server/auth/session";
import { getCandidate } from "@/server/services/candidate-service";

export const metadata: Metadata = { title: "עריכת כרטיס" };

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const candidate = await getCandidate(await requireMatchmakerId(), (await params).id);
  if (!candidate) notFound();
  return (
    <>
      <PageHeader title={`עריכה: ${fullName(candidate)}`} />
      <CandidateForm side={candidate.side} candidate={candidate} cancelHref={routes.candidate(candidate.id)} />
    </>
  );
}
