import type { ReactNode } from "react";

export function Section({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="reveal">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-4xl">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
