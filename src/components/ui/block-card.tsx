import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  // Background class of the flat color block offset behind the card
  block: string;
  // Position in its list, so cards rise in one after another
  index?: number;
  className?: string;
  children: ReactNode;
};

// Bordered card lifted over a flat color block, which shifts apart on hover
export function BlockCard({ block, index = 0, className, children }: Props) {
  return (
    <div className="rise-in group relative h-full" style={{ "--i": index } as CSSProperties}>
      <div
        aria-hidden
        className={cn("absolute inset-0 translate-x-2 translate-y-2 transition-transform duration-200 group-hover:translate-x-3 group-hover:translate-y-3", block)}
      />
      <div className={cn("relative flex h-full flex-col border-2 border-ink bg-paper transition-transform duration-200 group-hover:-translate-y-1", className)}>
        {children}
      </div>
    </div>
  );
}
