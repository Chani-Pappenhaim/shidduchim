import Link from "next/link";
import { cn } from "@/lib/cn";

export type FilterTab = { key: string; label: string; count?: number; href: string; selected: boolean };

// Row of filter links kept in the URL, each with an optional count
export function FilterTabs({ label, tabs, className }: { label: string; tabs: FilterTab[]; className?: string }) {
  return (
    <nav aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
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
          {tab.count !== undefined && <span className={cn("text-sm", tab.selected ? "text-lime" : "text-muted")}>{tab.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
