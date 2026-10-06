import type { Metadata } from "next";
import { CoupleRow } from "@/components/introductions/couple-row";
import { StatusTabs } from "@/components/introductions/status-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { routes, withQuery } from "@/lib/routes";
import { introductionFiltersSchema } from "@/lib/validation/introduction";
import { requireMatchmakerId } from "@/server/auth/session";
import { listIntroductions } from "@/server/services/introduction-service";

export const metadata: Metadata = { title: "שידוכים" };

export default async function IntroductionsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const filters = introductionFiltersSchema.parse(await searchParams);
  const { items, counts, pageCount } = await listIntroductions(await requireMatchmakerId(), filters);
  const all = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const hrefFor = (page: number) => withQuery(routes.introductions, { status: filters.status, page });

  return (
    <>
      <PageHeader title="שידוכים" subtitle="כל ההצעות: מי הוצע למי, מי הציע ואיפה זה עומד" />
      <StatusTabs active={filters.status} counts={counts} total={all} />
      {items.length === 0 ? (
        <EmptyState title={all === 0 ? "עוד אין הצעות" : "אין הצעות בסטטוס הזה"}>
          {all === 0 && "פותחים כרטיס של מועמד ולוחצים על ״מציאת התאמה״"}
        </EmptyState>
      ) : (
        <div className="reveal border-t-2 border-ink">
          {items.map((introduction) => (
            <CoupleRow key={introduction.id} introduction={introduction} />
          ))}
        </div>
      )}
      <Pagination page={filters.page} pageCount={pageCount} hrefFor={hrefFor} />
    </>
  );
}
