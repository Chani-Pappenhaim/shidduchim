import type { Metadata } from "next";
import { CandidateCard } from "@/components/candidates/candidate-card";
import { CandidateFilters } from "@/components/candidates/candidate-filters";
import { SideTabs } from "@/components/candidates/side-tabs";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SIDE_LABELS, sideFromSlug } from "@/lib/candidates";
import { routes } from "@/lib/routes";
import { candidateFiltersSchema } from "@/lib/validation/candidate";
import { requireMatchmakerId } from "@/server/auth/session";
import { countCandidatesBySide, listCandidates } from "@/server/services/candidate-service";

export const metadata: Metadata = { title: "מועמדים" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function CandidatesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const side = sideFromSlug(params.side);
  const filters = candidateFiltersSchema.parse(params);
  const matchmakerId = await requireMatchmakerId();
  const [{ items, total, pageCount }, counts] = await Promise.all([
    listCandidates(matchmakerId, side, filters),
    countCandidatesBySide(matchmakerId),
  ]);

  const labels = SIDE_LABELS[side];
  const isFiltered = Boolean(filters.q || filters.status);
  const hrefFor = (page: number) => {
    const query = new URLSearchParams({ side: labels.slug, page: String(page) });
    if (filters.q) query.set("q", filters.q);
    if (filters.status) query.set("status", filters.status);
    return `/candidates?${query}`;
  };

  return (
    <>
      <PageHeader
        title="מועמדים"
        subtitle={isFiltered ? `${total} תוצאות` : undefined}
        actions={
          <LinkButton href={routes.newCandidate(side)} arrow>
            {labels.new}
          </LinkButton>
        }
      />
      <SideTabs active={side} counts={counts} />
      <CandidateFilters side={side} filters={filters} />

      {items.length === 0 ? (
        <EmptyState title={isFiltered ? "לא נמצאו תוצאות" : `עוד אין ${labels.many}`}>
          {isFiltered ? "כדאי לנסות חיפוש אחר" : "מוסיפים כרטיס ראשון ומתחילים לשדך"}
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((candidate, index) => (
            <li key={candidate.id} className="reveal">
              <CandidateCard candidate={candidate} index={index} />
            </li>
          ))}
        </ul>
      )}
      <Pagination page={filters.page} pageCount={pageCount} hrefFor={hrefFor} />
    </>
  );
}
