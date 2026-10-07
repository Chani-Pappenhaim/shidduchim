import { z } from "zod";
import { PROPOSAL_RECIPIENTS } from "@/lib/proposal-email";
import { emailField, requiredText } from "./fields";

export const proposalEmailSchema = z.object({
  introductionId: z.string().min(1),
  recipient: z.enum(PROPOSAL_RECIPIENTS),
  to: emailField,
  subject: requiredText("נושא", 200),
  body: requiredText("תוכן", 10_000),
});

// Recipient chosen in the page URL; anything else falls back to the groom's side
export const proposalRecipientSchema = z.enum(PROPOSAL_RECIPIENTS).catch("male");

export type ProposalEmailInput = z.infer<typeof proposalEmailSchema>;
