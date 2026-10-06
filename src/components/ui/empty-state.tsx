import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 border-2 border-dashed border-line px-6 py-14 text-center">
      <p className="font-display text-4xl">{title}</p>
      {children && <div className="text-muted">{children}</div>}
    </div>
  );
}
