import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Side } from "@/generated/prisma/enums";
import { MAX_CODE_ATTEMPTS } from "@/lib/portal";
import { candidateSchema } from "@/lib/validation/candidate";
import { portalProfileSchema } from "@/lib/validation/portal";
import { db } from "@/server/db";
import { sendSystemMail } from "@/server/mail/system-mailer";
import { createCandidate } from "./candidate-service";
import { NotFoundError } from "./ownership";
import {
  createInvite,
  findActiveInvite,
  getPortalProfile,
  InviteEmailMissingError,
  sendPortalCode,
  updatePortalProfile,
  verifyPortalCode,
} from "./portal-service";

vi.mock("@/server/mail/system-mailer", () => ({ sendSystemMail: vi.fn() }));

const RUN = Date.now().toString(36);
const now = new Date();
let matchmakerId: string;
let candidateId: string;

const tokenFrom = (url: string) => url.split("/portal/")[1];

// The code is only ever sent by mail, so the test reads it from the last mocked message
function lastCode(): string {
  const message = vi.mocked(sendSystemMail).mock.lastCall![0];
  return message.subject.match(/\d+/)![0];
}

beforeAll(async () => {
  ({ id: matchmakerId } = await db.matchmaker.create({
    data: { email: `portal-${RUN}@engagement.test`, name: "חנה", passwordHash: "-" },
  }));
  ({ id: candidateId } = await createCandidate(
    matchmakerId,
    candidateSchema.parse({ side: Side.FEMALE, firstName: "רחל", lastName: RUN, email: "rachel@example.com", city: "צפת" }),
  ));
  await db.privateNote.create({ data: { candidateId, body: "סוד של השדכנית" } });
});

afterAll(async () => {
  await db.matchmaker.delete({ where: { id: matchmakerId } });
  await db.$disconnect();
});

describe("candidate portal", () => {
  it("invites only the matchmaker's own candidates who have an email", async () => {
    await expect(createInvite("someone-else", candidateId, now)).rejects.toThrow(NotFoundError);
    const { id } = await createCandidate(matchmakerId, candidateSchema.parse({ side: Side.MALE, firstName: "משה", lastName: RUN }));
    await expect(createInvite(matchmakerId, id, now)).rejects.toThrow(InviteEmailMissingError);
  });

  it("signs in with an emailed code and lets the candidate edit only their own details", async () => {
    const token = tokenFrom((await createInvite(matchmakerId, candidateId, now)).url);
    expect(await findActiveInvite(token, now)).toMatchObject({ firstName: "רחל", matchmakerName: "חנה", emailHint: "ra•••@example.com" });

    expect(await sendPortalCode(token, now)).toBe("sent");
    expect(await sendPortalCode(token, now)).toBe("wait");
    const { inviteId } = await verifyPortalCode(token, lastCode(), now);
    expect(inviteId).toBeTruthy();
    expect((await verifyPortalCode(token, lastCode(), now)).result).toBe("expired");

    const profile = await getPortalProfile(inviteId!, now);
    expect(profile).toMatchObject({ firstName: "רחל", city: "צפת" });
    expect(Object.keys(profile!)).not.toContain("notes");
    expect(Object.keys(profile!)).not.toContain("lastName");

    await updatePortalProfile(inviteId!, portalProfileSchema.parse({ city: "", about: "אוהבת לטייל" }), now);
    const saved = await db.candidate.findUniqueOrThrow({ where: { id: candidateId } });
    expect(saved).toMatchObject({ city: null, about: "אוהבת לטייל", firstName: "רחל", status: "AVAILABLE" });
  });

  it("locks the code after too many wrong attempts", async () => {
    const token = tokenFrom((await createInvite(matchmakerId, candidateId, now)).url);
    await sendPortalCode(token, now);
    const code = lastCode();
    const wrong = code === "000000" ? "111111" : "000000";
    for (let i = 1; i < MAX_CODE_ATTEMPTS; i++) expect(await verifyPortalCode(token, wrong, now)).toMatchObject({ result: "wrong" });
    expect(await verifyPortalCode(token, wrong, now)).toMatchObject({ result: "wrong", attemptsLeft: 0 });
    expect((await verifyPortalCode(token, code, now)).result).toBe("locked");
  });

  it("stops the old link once a new invite is sent, and every link expires", async () => {
    const first = tokenFrom((await createInvite(matchmakerId, candidateId, now)).url);
    const second = tokenFrom((await createInvite(matchmakerId, candidateId, now)).url);
    expect(await findActiveInvite(first, now)).toBeNull();
    expect(await findActiveInvite(second, now)).not.toBeNull();
    expect(await findActiveInvite(second, new Date(now.getTime() + 15 * 24 * 3600_000))).toBeNull();
  });
});
