import Link from "next/link";
import type { IntroductionStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/cn";
import { INTRODUCTION_STATUS_LABELS, INTRODUCTION_STATUSES } from "@/lib/introductions";
import { routes } from "@/lib/routes";

type Props = { active?: IntroductionStatus; counts: Partial<Record<IntroductionStatus, number>>; total: number };

// Filter links over introduction statuses, kept in the URL
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
  return (
    <nav aria-label="סטטוס" className="mb-6 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.selected ? "page" : undefined}
          className={cn(
            "flex items-baseline gap-2 border-2 border-ink px-4 py-1.5 transition-colors",
            tab.selected ? "bg-ink text-paper" : "bg-paper hover:bg-lime",
          )}
        >
          <span className="font-display text-2xl">{tab.label}</span>
          <span className={cn("text-sm", tab.selected ? "text-lime" : "text-muted")}>{tab.count}</span>
        </Link>
      ))}
    </nav>
  );
}
