import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  // Optional visual next to the title, hidden on small screens
  decoration?: ReactNode;
};

// Large editorial page title with optional actions
export function PageHeader({ title, subtitle, actions, decoration }: Props) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-5">
      <div className="flex items-center gap-5">
        <div>
          <h1 className="font-display text-6xl md:text-7xl">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        </div>
        {decoration && <div className="hidden md:block">{decoration}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
