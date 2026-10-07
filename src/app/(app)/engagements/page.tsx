import type { Metadata } from "next";
import { CoupleCard } from "@/components/engagements/couple-card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { routes, withQuery } from "@/lib/routes";
import { engagementFiltersSchema, type EngagementFilters } from "@/lib/validation/engagement";
import { requireMatchmakerId } from "@/server/auth/session";
import { listEngagements } from "@/server/services/engagement-service";

export const metadata: Metadata = { title: "מאורסים/נשואים" };

type Query = Partial<Pick<EngagementFilters, "state" | "by">> & { page?: number };

const href = (query: Query) => withQuery(routes.engagements, query);

export default async function EngagementsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const filters = engagementFiltersSchema.parse(await searchParams);
  const { items, counts, pageCount } = await listEngagements(await requireMatchmakerId(), filters);
  const { state, by } = filters;

  return (
    <>
      <PageHeader
        title="מאורסים/נשואים"
        subtitle="כל מי שמהמאגר שלך התארס או התחתן - ומי מהם בזכותך"
        actions={
          <LinkButton href={routes.weddings} variant="secondary" size="sm" arrow>
            לוח חתונות
          </LinkButton>
        }
      />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <FilterTabs
          label="מצב"
          tabs={[
            { key: "all", label: "הכל", count: counts.engaged + counts.married, href: href({ by }), selected: !state },
            { key: "engaged", label: "מאורסים", count: counts.engaged, href: href({ state: "engaged", by }), selected: state === "engaged" },
            { key: "married", label: "נשואים", count: counts.married, href: href({ state: "married", by }), selected: state === "married" },
          ]}
        />
        <FilterTabs
          label="מי שידך"
          tabs={[
            { key: "everyone", label: "כולם", count: counts.everyone, href: href({ state }), selected: !by },
            { key: "me", label: "★ בזכותי", count: counts.mine, href: href({ state, by: "me" }), selected: by === "me" },
          ]}
        />
      </div>
      {items.length === 0 ? (
        <EmptyState title={counts.everyone === 0 ? "עוד אין מאורסים" : "אין זוגות בסינון הזה"}>
          {counts.everyone === 0 && "כשהצעה מגיעה ל״אירוסין״ - הזוג יופיע כאן. אפשר גם לסמן אירוסין מתוך כרטיס של מועמד."}
        </EmptyState>
      ) : (
        <div className="reveal grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((engagement) => (
            <CoupleCard key={engagement.id} engagement={engagement} />
          ))}
        </div>
      )}
      <Pagination page={filters.page} pageCount={pageCount} hrefFor={(page) => href({ state, by, page })} />
    </>
  );
}
