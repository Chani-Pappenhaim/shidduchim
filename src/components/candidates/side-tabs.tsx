import Link from "next/link";
import type { Side } from "@/generated/prisma/enums";
import { SIDE_LABELS, SIDES } from "@/lib/candidates";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

export function SideTabs({ active, counts }: { active: Side; counts: Record<Side, number> }) {
  return (
    <nav aria-label="צד" className="mb-6 flex gap-2">
      {SIDES.map((side) => {
        const selected = side === active;
        return (
          <Link
            key={side}
            href={routes.candidates(side)}
            aria-current={selected ? "page" : undefined}
            className={cn(
              "flex items-baseline gap-2 border-2 border-ink px-5 py-2 transition-colors",
              selected ? "bg-ink text-paper" : "bg-paper hover:bg-lime",
            )}
          >
            <span className="font-display text-3xl">{SIDE_LABELS[side].many}</span>
            <span className={cn("text-sm", selected ? "text-lime" : "text-muted")}>{counts[side]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
