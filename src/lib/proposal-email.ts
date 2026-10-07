import { Side } from "@/generated/prisma/enums";
import { ageFrom, fullName } from "./candidates";

// Draft of a match proposal email. Only details meant for the other family are included:
// never private notes, files or the candidate's own contact details.

export type ProposalCandidate = {
  side: Side;
  firstName: string;
  lastName: string;
  birthDate: Date | null;
  city: string | null;
  community: string | null;
  occupation: string | null;
  heightCm: number | null;
  parentsInfo: string | null;
  about: string | null;
  lookingFor: string | null;
};

export type ProposalSender = { name: string; phone: string | null; emailSignature: string | null };

export type ProposalRecipient = "male" | "female";

export const PROPOSAL_RECIPIENTS: ProposalRecipient[] = ["male", "female"];

export function recipientSide(recipient: ProposalRecipient): Side {
  return recipient === "male" ? Side.MALE : Side.FEMALE;
}

function profileLines(candidate: ProposalCandidate, now: Date): string[] {
  const he = candidate.side === Side.MALE;
  const age = ageFrom(candidate.birthDate, now);
  const rows: [string, string | number | null][] = [
    ["גיל", age],
    ["עיר", candidate.city],
    ["קהילה", candidate.community],
    ["עיסוק", candidate.occupation],
    ["גובה", candidate.heightCm && `${candidate.heightCm} ס״מ`],
    ["משפחה", candidate.parentsInfo],
    [he ? "קצת עליו" : "קצת עליה", candidate.about],
    [he ? "מה הוא מחפש" : "מה היא מחפשת", candidate.lookingFor],
  ];
  return rows.filter(([, value]) => value !== null && value !== "").map(([label, value]) => `${label}: ${value}`);
}

function signature(sender: ProposalSender): string {
  return sender.emailSignature?.trim() || [sender.name, sender.phone].filter(Boolean).join("\n");
}

export function proposalDraft(about: ProposalCandidate, recipientFirstName: string, sender: ProposalSender, now = new Date()) {
  const name = fullName(about);
  const body = [
    `שלום ${recipientFirstName},`,
    "",
    `רציתי להציע לך שידוך עם ${name}.`,
    "",
    ...profileLines(about, now),
    "",
    "אשמח לשמוע מה דעתך.",
    "",
    signature(sender),
  ].join("\n");
  return { subject: `הצעת שידוך: ${name}`, body };
}

export function mailtoUrl({ to, subject, body }: { to: string; subject: string; body: string }): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
