import type { Metadata } from "next";
import { SuccessCard } from "@/components/introductions/success-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireMatchmakerId } from "@/server/auth/session";
import { listSuccesses } from "@/server/services/introduction-service";

export const metadata: Metadata = { title: "הצלחות" };

export default async function SuccessesPage() {
  const successes = await listSuccesses(await requireMatchmakerId());
  const thisYear = new Date().getFullYear();
  const yearCount = successes.filter((s) => s.engagedAt?.getFullYear() === thisYear).length;

  return (
    <>
      <PageHeader
        title="הצלחות"
        subtitle={
          successes.length > 0
            ? `${successes.length === 1 ? "זוג אחד" : `${successes.length} זוגות`} עד היום · ${yearCount} השנה`
            : "כאן יופיעו הזוגות שהתארסו"
        }
      />
      {successes.length === 0 ? (
        <EmptyState title="עוד אין אירוסין">כשמסמנים הצעה כ״מאורסים״ - הזוג יופיע כאן</EmptyState>
      ) : (
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {successes.map((success) => (
            <li key={success.id} className="reveal">
              <SuccessCard success={success} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
