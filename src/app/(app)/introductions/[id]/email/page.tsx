import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProposalEmailForm } from "@/components/introductions/proposal-email-form";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { PROPOSAL_RECIPIENTS, type ProposalRecipient } from "@/lib/proposal-email";
import { routes } from "@/lib/routes";
import { proposalRecipientSchema } from "@/lib/validation/proposal-email";
import { requireMatchmakerId } from "@/server/auth/session";
import { NotFoundError } from "@/server/services/ownership";
import { getProposalEmail, type ProposalEmail } from "@/server/services/proposal-email-service";

export const metadata: Metadata = { title: "שליחת הצעה במייל" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ to?: string }> };

async function load(matchmakerId: string, introductionId: string, recipient: ProposalRecipient): Promise<ProposalEmail> {
  try {
    return await getProposalEmail(matchmakerId, introductionId, recipient);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}

export default async function ProposalEmailPage({ params, searchParams }: Props) {
  const [{ id }, { to }] = await Promise.all([params, searchParams]);
  const recipient = proposalRecipientSchema.parse(to);
  const matchmakerId = await requireMatchmakerId();
  const current = await load(matchmakerId, id, recipient);
  // The other tab sends to the person this draft is about
  const names = { [recipient]: current.recipient.name, [recipient === "male" ? "female" : "male"]: current.about.name };

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link href={routes.introduction(id)} className="text-sm text-muted hover:text-ink">
        → חזרה להצעה
      </Link>
      <PageHeader title="הצעה במייל" subtitle={`מייל ל${current.recipient.name} עם הפרטים של ${current.about.name}`} />
      <FilterTabs
        label="למי לשלוח"
        tabs={PROPOSAL_RECIPIENTS.map((r) => ({ key: r, label: `ל${names[r]}`, href: routes.proposalEmail(id, r), selected: r === recipient }))}
      />
      {!current.sendingFrom && (
        <p className="bg-mist px-4 py-3 text-sm">
          המייל ייפתח בתוכנת המייל שלך, מוכן לשליחה. כדי לשלוח ישר מכאן אפשר{" "}
          <Link href="/profile" className="underline">
            לחבר את חשבון הג׳ימייל בפרופיל
          </Link>
          .
        </p>
      )}
      <ProposalEmailForm
        key={recipient}
        introductionId={id}
        recipient={recipient}
        to={current.recipient.email}
        subject={current.draft.subject}
        body={current.draft.body}
        sendingFrom={current.sendingFrom}
      />
    </div>
  );
}
