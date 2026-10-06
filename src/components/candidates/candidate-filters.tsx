import type { Side } from "@/generated/prisma/enums";
import { CANDIDATE_STATUSES, SIDE_LABELS, statusLabel } from "@/lib/candidates";
import { buttonStyles } from "@/components/ui/button-styles";
import type { CandidateFilters as Filters } from "@/lib/validation/candidate";

const control = "h-11 border-2 border-ink bg-paper px-3 focus:outline-none focus:shadow-[4px_4px_0_0_var(--color-lime)]";

// Plain GET form so filters live in the URL and survive refresh and sharing
export function CandidateFilters({ side, filters }: { side: Side; filters: Filters }) {
  return (
    <form role="search" className="mb-8 flex flex-wrap items-center gap-2">
      <input type="hidden" name="side" value={SIDE_LABELS[side].slug} />
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
    </form>
  );
}
