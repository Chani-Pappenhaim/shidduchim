import type { Metadata } from "next";
import { WeddingRow } from "@/components/engagements/wedding-row";
import { CoupleCard } from "@/components/engagements/couple-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { groupByMonth } from "@/lib/engagements";
import { formatMonth } from "@/lib/format";
import { routes } from "@/lib/routes";
import { weddingFiltersSchema } from "@/lib/validation/engagement";
import { requireMatchmakerId } from "@/server/auth/session";
import { listWeddings } from "@/server/services/engagement-service";

export const metadata: Metadata = { title: "לוח חתונות" };

export default async function WeddingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { by } = weddingFiltersSchema.parse(await searchParams);
  const onlyMine = by !== "all";
  const { upcoming, undated } = await listWeddings(await requireMatchmakerId(), { onlyMine });
  const months = groupByMonth(upcoming);

  return (
    <>
      <PageHeader
        title="לוח חתונות"
        subtitle={onlyMine ? "החתונות של הזוגות ששידכת - כדי לא לפספס אף אחת" : "כל החתונות של מועמדים מהמאגר שלך"}
      />
      <FilterTabs
        label="אילו חתונות"
        className="mb-8"
        tabs={[
          { key: "mine", label: "★ ששידכתי", href: routes.weddings, selected: onlyMine },
          { key: "all", label: "כל המאגר", href: `${routes.weddings}?by=all`, selected: !onlyMine },
        ]}
      />
      <div className="flex flex-col gap-12">
        {months.length === 0 && (
          <EmptyState title="אין חתונות קרובות">מכניסים תאריך חתונה בכרטיס של הזוג במסך ״מאורסים/נשואים״</EmptyState>
        )}
        {months.map(({ month, items }) => (
          <Section key={month} title={formatMonth(items[0].weddingDate)}>
            <div className="border-t-2 border-ink">
              {items.map((engagement) => (
                <WeddingRow key={engagement.id} engagement={engagement} showSource={!onlyMine} />
              ))}
            </div>
          </Section>
        ))}
        {undated.length > 0 && (
          <Section title="עוד בלי תאריך">
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {undated.map((engagement) => (
                <CoupleCard key={engagement.id} engagement={engagement} />
              ))}
            </div>
          </Section>
        )}
      </div>
    </>
  );
}
