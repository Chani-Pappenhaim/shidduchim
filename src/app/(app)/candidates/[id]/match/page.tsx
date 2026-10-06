import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CandidateCard } from "@/components/candidates/candidate-card";
import { CandidateFilters } from "@/components/candidates/candidate-filters";
import { IntroductionStatusBadge } from "@/components/introductions/introduction-status-badge";
import { ProposeButton } from "@/components/introductions/propose-button";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { fullName, oppositeSide, SIDE_LABELS } from "@/lib/candidates";
import { routes, withQuery } from "@/lib/routes";
import { candidateFiltersSchema } from "@/lib/validation/candidate";
import { requireMatchmakerId } from "@/server/auth/session";
import { getCandidateSummary, listCandidates } from "@/server/services/candidate-service";
import { introductionsOf } from "@/server/services/introduction-service";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };

const loadCandidate = cache(async (id: string) => {
  const candidate = await getCandidateSummary(await requireMatchmakerId(), id);
  if (!candidate) notFound();
  return candidate;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `התאמות ל${fullName(await loadCandidate((await params).id))}` };
}

// The other side's candidates, each marked with its relation to this candidate
export default async function MatchPage({ params, searchParams }: Props) {
  const candidate = await loadCandidate((await params).id);
  const filters = candidateFiltersSchema.parse(await searchParams);
  const matchmakerId = await requireMatchmakerId();
  const partnerSide = oppositeSide(candidate.side);
  const [{ items, total, pageCount }, introductions] = await Promise.all([
    listCandidates(matchmakerId, partnerSide, filters),
    introductionsOf(matchmakerId, candidate.id, candidate.side),
  ]);
  const byPartner = new Map(introductions.map((introduction) => [introduction.partner.id, introduction]));
  const partners = SIDE_LABELS[partnerSide];
  const hrefFor = (page: number) => withQuery(routes.match(candidate.id), { q: filters.q, status: filters.status, page });

  return (
    <>
      <PageHeader
        title={`התאמות ל${fullName(candidate)}`}
        subtitle={`${total} ${partners.many} · ${introductions.length} כבר הוצעו`}
        actions={
          <LinkButton href={routes.candidate(candidate.id)} variant="secondary">
            חזרה לכרטיס
          </LinkButton>
        }
      />
      <CandidateFilters side={partnerSide} filters={filters} />

      {items.length === 0 ? (
        <EmptyState title={`לא נמצאו ${partners.many}`}>
          <Link href={routes.newCandidate(partnerSide)} className="underline">
            {partners.new}
          </Link>
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((partner, index) => {
            const introduction = byPartner.get(partner.id);
            return (
              <li key={partner.id} className="reveal">
                <CandidateCard
                  candidate={partner}
                  index={index}
                  footer={
                    introduction ? (
                      <Link
                        href={routes.introduction(introduction.id)}
                        className="flex items-center justify-between gap-2 text-sm hover:underline"
                      >
                        <IntroductionStatusBadge status={introduction.status} />
                        לשידוך ←
                      </Link>
                    ) : (
                      <ProposeButton candidateId={candidate.id} partnerId={partner.id} />
                    )
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
      <Pagination page={filters.page} pageCount={pageCount} hrefFor={hrefFor} />
    </>
  );
}
