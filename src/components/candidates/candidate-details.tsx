import type { Candidate } from "@/generated/prisma/client";
import { ageLabel } from "@/lib/candidates";
import { formatDate } from "@/lib/format";

// Key facts of a candidate as a compact definition list, skipping empty values
export function CandidateDetails({ candidate }: { candidate: Candidate }) {
  const rows: [string, string | null][] = [
    ["גיל", ageLabel(candidate)],
    ["תאריך לידה", candidate.birthDate && formatDate(candidate.birthDate)],
    ["גובה", candidate.heightCm ? `${candidate.heightCm} ס״מ` : null],
    ["עיר", candidate.city],
    ["קהילה", candidate.community],
    ["עיסוק", candidate.occupation],
    ["טלפון", candidate.phone],
    ["מייל", candidate.email],
  ];
  const filled = rows.filter((row): row is [string, string] => Boolean(row[1]));
  if (filled.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 border-r-2 border-t-2 border-ink sm:grid-cols-4">
      {filled.map(([label, value]) => (
        <div key={label} className="border-b-2 border-l-2 border-ink p-3">
          <dt className="text-xs text-muted">{label}</dt>
          <dd className="mt-1 font-medium" dir="auto">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
