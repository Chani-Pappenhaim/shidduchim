import type { IntroductionStatus } from "@/generated/prisma/enums";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { INTRODUCTION_STATUS_LABELS, INTRODUCTION_STATUSES } from "@/lib/introductions";
import { routes } from "@/lib/routes";

type Props = { active?: IntroductionStatus; counts: Partial<Record<IntroductionStatus, number>>; total: number };

// Filter links over introduction statuses
export function StatusTabs({ active, counts, total }: Props) {
  const tabs = [
    { key: "all", label: "הכל", count: total, href: routes.introductions, selected: !active },
    ...INTRODUCTION_STATUSES.map((status) => ({
      key: status,
      label: INTRODUCTION_STATUS_LABELS[status],
      count: counts[status] ?? 0,
      href: `${routes.introductions}?status=${status}`,
      selected: active === status,
    })),
  ];
  return <FilterTabs label="סטטוס" tabs={tabs} className="mb-6" />;
}
