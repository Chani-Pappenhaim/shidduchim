import "server-only";
import { IntroductionEventType } from "@/generated/prisma/enums";
import { fullName } from "@/lib/candidates";
import { proposalDraft, type ProposalRecipient } from "@/lib/proposal-email";
import type { ProposalEmailInput } from "@/lib/validation/proposal-email";
import { db } from "@/server/db";
import { getMailConnection, sendAsMatchmaker } from "./mail-connection-service";
import { NotFoundError } from "./ownership";

const proposalCandidateSelect = {
  id: true,
  side: true,
  firstName: true,
  lastName: true,
  email: true,
  birthDate: true,
  city: true,
  community: true,
  occupation: true,
  heightCm: true,
  parentsInfo: true,
  about: true,
  lookingFor: true,
} as const;

const OTHER: Record<ProposalRecipient, ProposalRecipient> = { male: "female", female: "male" };

async function loadCouple(matchmakerId: string, introductionId: string) {
  const introduction = await db.introduction.findFirst({
    where: { id: introductionId, matchmakerId },
    select: { id: true, male: { select: proposalCandidateSelect }, female: { select: proposalCandidateSelect } },
  });
  if (!introduction) throw new NotFoundError();
  return introduction;
}

// Everything the proposal email page needs: who receives it, a draft about the other side and how it can be sent
export async function getProposalEmail(matchmakerId: string, introductionId: string, recipient: ProposalRecipient) {
  const introduction = await loadCouple(matchmakerId, introductionId);
  const [sender, connection] = await Promise.all([
    db.matchmaker.findUniqueOrThrow({ where: { id: matchmakerId }, select: { name: true, phone: true, emailSignature: true } }),
    getMailConnection(matchmakerId),
  ]);
  const to = introduction[recipient];
  const about = introduction[OTHER[recipient]];
  return {
    introductionId: introduction.id,
    recipient: { id: to.id, name: fullName(to), email: to.email ?? "" },
    about: { id: about.id, name: fullName(about) },
    draft: proposalDraft(about, to.firstName, sender),
    sendingFrom: connection?.email ?? null,
  };
}

export type ProposalEmail = Awaited<ReturnType<typeof getProposalEmail>>;

async function recordEmailSent(introductionId: string, message: string) {
  await db.introductionEvent.create({ data: { introductionId, type: IntroductionEventType.EMAIL_SENT, message } });
}

// Sends the proposal from the matchmaker's connected mailbox and records it on the introduction
export async function sendProposalEmail(matchmakerId: string, input: ProposalEmailInput) {
  const introduction = await loadCouple(matchmakerId, input.introductionId);
  const from = await sendAsMatchmaker(matchmakerId, { to: input.to, subject: input.subject, text: input.body });
  await recordEmailSent(introduction.id, `ל${fullName(introduction[input.recipient])} (${input.to}) · נשלח מ-${from}`);
}

// Records a proposal the matchmaker sent from their own mail program
export async function recordProposalEmailOpened(matchmakerId: string, input: Pick<ProposalEmailInput, "introductionId" | "recipient" | "to">) {
  const introduction = await loadCouple(matchmakerId, input.introductionId);
  await recordEmailSent(introduction.id, `ל${fullName(introduction[input.recipient])} (${input.to}) · דרך תוכנת המייל`);
}
