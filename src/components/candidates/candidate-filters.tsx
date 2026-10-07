import Link from "next/link";
import type { Side } from "@/generated/prisma/enums";
import { CANDIDATE_STATUSES, SIDE_LABELS, statusLabel } from "@/lib/candidates";
import { buttonStyles } from "@/components/ui/button-styles";
import { ADVANCED_FILTER_KEYS, type CandidateFilters as Filters, hasFilters } from "@/lib/validation/candidate";

const control = "h-11 border-2 border-ink bg-paper px-3 focus:outline-none focus:shadow-[4px_4px_0_0_var(--color-lime)]";

type Props = {
  side: Side;
  filters: Filters;
  clearHref: string;
  // Offered when searching partners for one candidate
  canHideProposed?: boolean;
};

function Range({ label, name, filters, min, max }: { label: string; name: "Age" | "Height"; filters: Filters; min: number; max: number }) {
  const from = `min${name}` as const;
  const to = `max${name}` as const;
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex items-center gap-2">
        <input type="number" name={from} min={min} max={max} defaultValue={filters[from]} placeholder="מ-" aria-label={`${label} מ`} className={`${control} w-24`} />
        <span aria-hidden>–</span>
        <input type="number" name={to} min={min} max={max} defaultValue={filters[to]} placeholder="עד" aria-label={`${label} עד`} className={`${control} w-24`} />
      </div>
    </fieldset>
  );
}

function TextFilter({ label, name, filters }: { label: string; name: "city" | "community" | "occupation"; filters: Filters }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <input name={name} defaultValue={filters[name]} className={`${control} w-full font-normal`} />
    </label>
  );
}

// Plain GET form so filters live in the URL and survive refresh and sharing
export function CandidateFilters({ side, filters, clearHref, canHideProposed = false }: Props) {
  const advancedOpen = ADVANCED_FILTER_KEYS.some((key) => filters[key] !== undefined);
  return (
    <form role="search" className="mb-8 flex flex-col gap-3">
      <input type="hidden" name="side" value={SIDE_LABELS[side].slug} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="חיפוש לפי שם, עיר, קהילה או עיסוק"
          aria-label="חיפוש"
          className={`${control} min-w-0 flex-1 basis-64`}
        />
        <select name="status" defaultValue={filters.status ?? ""} aria-label="סטטוס" className={control}>
          <option value="">כל הסטטוסים</option>
          {CANDIDATE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status, side)}
            </option>
          ))}
        </select>
        <button className={buttonStyles("primary", "md")}>חיפוש</button>
        {hasFilters(filters) && (
          <Link href={clearHref} className="px-2 text-sm underline">
            ניקוי
          </Link>
        )}
      </div>

      <details open={advancedOpen} className="group border-2 border-ink bg-mist">
        <summary className="cursor-pointer select-none px-4 py-3 font-medium marker:content-none">
          <span className="inline-block transition-transform group-open:rotate-90">◂</span> סינון מתקדם: גיל, גובה, עיר, עיסוק
        </summary>
        <div className="grid gap-4 border-t-2 border-ink p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Range label="גיל" name="Age" filters={filters} min={16} max={99} />
          <Range label="גובה (ס״מ)" name="Height" filters={filters} min={120} max={230} />
          <TextFilter label="עיר" name="city" filters={filters} />
          <TextFilter label="קהילה / חוג" name="community" filters={filters} />
          <TextFilter label="עיסוק / מקום לימודים" name="occupation" filters={filters} />
          {canHideProposed && (
            <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium">
              <input type="checkbox" name="notProposed" value="1" defaultChecked={!!filters.notProposed} className="size-5 accent-ink" />
              רק מי שעוד לא הוצעו
            </label>
          )}
          <div className="flex items-end sm:col-span-2 lg:col-span-1 lg:col-start-4">
            <button className={buttonStyles("primary", "md", "w-full")}>סינון</button>
          </div>
        </div>
      </details>
    </form>
  );
}
