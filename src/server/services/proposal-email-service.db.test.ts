import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { IntroductionEventType, Side } from "@/generated/prisma/enums";
import { candidateSchema } from "@/lib/validation/candidate";
import { db } from "@/server/db";
import { createCandidate } from "./candidate-service";
import { proposeIntroduction } from "./introduction-service";
import { NoMailConnectionError } from "./mail-connection-service";
import { NotFoundError } from "./ownership";
import { getProposalEmail, recordProposalEmailOpened, sendProposalEmail } from "./proposal-email-service";

const RUN = Date.now().toString(36);
let matchmakerId: string;
let introductionId: string;

beforeAll(async () => {
  ({ id: matchmakerId } = await db.matchmaker.create({
    data: { email: `proposal-${RUN}@engagement.test`, name: "חנה", phone: "050-1111111", passwordHash: "-" },
  }));
  const person = (side: Side, firstName: string, extra: Record<string, string>) =>
    createCandidate(matchmakerId, candidateSchema.parse({ side, firstName, lastName: RUN, ...extra }));
  const male = await person(Side.MALE, "יוסף", { email: "yosef@example.com", phone: "052-2222222", city: "בני ברק" });
  const female = await person(Side.FEMALE, "רחל", { phone: "053-3333333", about: "שמחה" });
  await db.privateNote.create({ data: { candidateId: female.id, body: "סוד של השדכנית" } });
  ({ id: introductionId } = await proposeIntroduction(matchmakerId, male.id, female.id));
});

afterAll(async () => {
  await db.matchmaker.delete({ where: { id: matchmakerId } });
  await db.$disconnect();
});

describe("proposal email", () => {
  it("drafts a mail to the recipient about the other side without private details", async () => {
    const email = await getProposalEmail(matchmakerId, introductionId, "male");
    expect(email.recipient).toMatchObject({ name: `יוסף ${RUN}`, email: "yosef@example.com" });
    expect(email.draft.subject).toBe(`הצעת שידוך: רחל ${RUN}`);
    expect(email.draft.body).toContain("קצת עליה: שמחה");
    expect(email.draft.body).not.toContain("סוד");
    expect(email.draft.body).not.toContain("053-3333333");
    expect(email.draft.body).toContain("050-1111111");
    expect(email.sendingFrom).toBeNull();
  });

  it("cannot be sent without a connected mailbox, but can be recorded as opened", async () => {
    const input = { introductionId, recipient: "female" as const, to: "rachel@example.com", subject: "s", body: "b" };
    await expect(sendProposalEmail(matchmakerId, input)).rejects.toThrow(NoMailConnectionError);
    await recordProposalEmailOpened(matchmakerId, input);
    const events = await db.introductionEvent.findMany({ where: { introductionId, type: IntroductionEventType.EMAIL_SENT } });
    expect(events).toHaveLength(1);
    expect(events[0].message).toBe(`לרחל ${RUN} (rachel@example.com) · דרך תוכנת המייל`);
  });

  it("is not available for another matchmaker's introduction", async () => {
    await expect(getProposalEmail("someone-else", introductionId, "male")).rejects.toThrow(NotFoundError);
  });
});
