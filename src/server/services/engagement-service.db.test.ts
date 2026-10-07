import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CandidateStatus, IntroductionStatus, Side } from "@/generated/prisma/enums";
import { todayDate } from "@/lib/format";
import { candidateSchema } from "@/lib/validation/candidate";
import { db } from "@/server/db";
import { createCandidate, deleteCandidate } from "./candidate-service";
import {
  cancelEngagement,
  createEngagement,
  EngagementRuleError,
  engagementOf,
  getEngagement,
  listEngagements,
  listWeddings,
  promoteDueWeddings,
  updateEngagement,
} from "./engagement-service";
import { changeIntroductionStatus, IntroductionRuleError, proposeIntroduction } from "./introduction-service";

const RUN = Date.now().toString(36);
let matchmakerId: string;
let otherMatchmakerId: string;

function day(offset: number): Date {
  const today = todayDate();
  return new Date(today.getTime() + offset * 86_400_000);
}

async function newMatchmaker(label: string) {
  const { id } = await db.matchmaker.create({ data: { email: `${label}-${RUN}@engagement.test`, name: label, passwordHash: "-" } });
  return id;
}

async function person(side: Side, firstName: string) {
  const { id } = await createCandidate(matchmakerId, candidateSchema.parse({ side, firstName, lastName: RUN }));
  return id;
}

async function statusOf(...ids: string[]) {
  const rows = await db.candidate.findMany({ where: { id: { in: ids } }, select: { id: true, status: true } });
  return ids.map((id) => rows.find((r) => r.id === id)?.status);
}

const BLANK = { weddingVenue: undefined, madeBy: undefined, note: undefined };

function details(engagementId: string, overrides: { weddingDate?: Date; weddingVenue?: string } = {}) {
  return { engagementId, engagedAt: day(-5), byMatchmaker: true, partnerName: undefined, ...BLANK, ...overrides };
}

function engage(matchmaker: string, input: Pick<Parameters<typeof createEngagement>[1], "candidateId" | "partnerName" | "byMatchmaker"> & { madeBy?: string }) {
  return createEngagement(matchmaker, { engagedAt: day(-2), ...BLANK, ...input });
}

beforeAll(async () => {
  matchmakerId = await newMatchmaker("main");
  otherMatchmakerId = await newMatchmaker("other");
});

afterAll(async () => {
  await db.matchmaker.deleteMany({ where: { id: { in: [matchmakerId, otherMatchmakerId] } } });
  await db.$disconnect();
});

describe("engagement through an introduction", () => {
  it("records the couple, closes their other open introductions and blocks new ones", async () => {
    const [yosef, rachel, sarah] = [await person(Side.MALE, "יוסף"), await person(Side.FEMALE, "רחל"), await person(Side.FEMALE, "שרה")];
    const couple = await proposeIntroduction(matchmakerId, yosef, rachel);
    const other = await proposeIntroduction(matchmakerId, yosef, sarah);

    await changeIntroductionStatus(matchmakerId, couple.id, IntroductionStatus.ENGAGED);

    const engagement = await engagementOf(matchmakerId, yosef);
    expect(engagement).toMatchObject({ byMatchmaker: true, introductionId: couple.id, female: { id: rachel } });
    expect(await statusOf(yosef, rachel, sarah)).toEqual([CandidateStatus.ENGAGED, CandidateStatus.ENGAGED, CandidateStatus.AVAILABLE]);
    const closed = await db.introduction.findUniqueOrThrow({ where: { id: other.id } });
    expect(closed.status).toBe(IntroductionStatus.DECLINED);
    await expect(proposeIntroduction(matchmakerId, sarah, yosef)).rejects.toThrow(IntroductionRuleError);
  });

  it("refuses to engage someone who is already engaged", async () => {
    const [moshe, leah, chana] = [await person(Side.MALE, "משה"), await person(Side.FEMALE, "לאה"), await person(Side.FEMALE, "חנה")];
    const first = await proposeIntroduction(matchmakerId, moshe, leah);
    const second = await proposeIntroduction(matchmakerId, moshe, chana);
    await changeIntroductionStatus(matchmakerId, first.id, IntroductionStatus.ENGAGED);
    // The second introduction was declined by the engagement; reopening it and engaging must fail
    await changeIntroductionStatus(matchmakerId, second.id, IntroductionStatus.PROPOSED);
    await expect(changeIntroductionStatus(matchmakerId, second.id, IntroductionStatus.ENGAGED)).rejects.toThrow(EngagementRuleError);
  });

  it("removes the engagement when the introduction moves back", async () => {
    const [david, miriam] = [await person(Side.MALE, "דוד"), await person(Side.FEMALE, "מרים")];
    const { id } = await proposeIntroduction(matchmakerId, david, miriam);
    await changeIntroductionStatus(matchmakerId, id, IntroductionStatus.ENGAGED);
    await changeIntroductionStatus(matchmakerId, id, IntroductionStatus.MEETING);
    expect(await engagementOf(matchmakerId, david)).toBeNull();
    expect(await statusOf(david, miriam)).toEqual([CandidateStatus.IN_PROCESS, CandidateStatus.IN_PROCESS]);
  });
});

describe("wedding date", () => {
  it("turns the couple married on the wedding day and back when the date is cleared", async () => {
    const [aharon, esther] = [await person(Side.MALE, "אהרון"), await person(Side.FEMALE, "אסתר")];
    const { id } = await proposeIntroduction(matchmakerId, aharon, esther);
    await changeIntroductionStatus(matchmakerId, id, IntroductionStatus.ENGAGED);
    const engagement = (await engagementOf(matchmakerId, aharon))!;

    await updateEngagement(matchmakerId, details(engagement.id, { weddingDate: day(10), weddingVenue: "אולם" }));
    expect(await statusOf(aharon, esther)).toEqual([CandidateStatus.ENGAGED, CandidateStatus.ENGAGED]);
    const { upcoming } = await listWeddings(matchmakerId, { onlyMine: true });
    expect(upcoming.map((w) => w.id)).toContain(engagement.id);

    await updateEngagement(matchmakerId, details(engagement.id, { weddingDate: day(0) }));
    expect(await statusOf(aharon, esther)).toEqual([CandidateStatus.MARRIED, CandidateStatus.MARRIED]);
    expect((await getEngagement(matchmakerId, engagement.id))?.weddingVenue).toBeNull();

    await updateEngagement(matchmakerId, details(engagement.id));
    expect(await statusOf(aharon, esther)).toEqual([CandidateStatus.ENGAGED, CandidateStatus.ENGAGED]);
  });

  it("promotes couples whose wedding day arrived", async () => {
    const shmuel = await person(Side.MALE, "שמואל");
    const { id } = await engage(matchmakerId, { candidateId: shmuel, partnerName: "בתיה", byMatchmaker: false });
    await db.engagement.update({ where: { id }, data: { weddingDate: day(-1) } });
    expect(await promoteDueWeddings()).toBeGreaterThanOrEqual(1);
    expect(await statusOf(shmuel)).toEqual([CandidateStatus.MARRIED]);
  });
});

describe("engagement to someone outside the database", () => {
  it("is listed apart from the matchmaker's own matches", async () => {
    const naftali = await person(Side.MALE, "נפתלי");
    const { id } = await engage(matchmakerId, {
      candidateId: naftali,
      partnerName: "דבורה גרין",
      byMatchmaker: false,
      madeBy: "שדכן אחר",
    });
    expect(await statusOf(naftali)).toEqual([CandidateStatus.ENGAGED]);

    const all = await listEngagements(matchmakerId, { page: 1 });
    const mine = await listEngagements(matchmakerId, { page: 1, by: "me" });
    expect(all.items.map((e) => e.id)).toContain(id);
    expect(mine.items.map((e) => e.id)).not.toContain(id);
    expect(all.counts.everyone).toBeGreaterThan(all.counts.mine);

    await expect(engage(matchmakerId, { candidateId: naftali, partnerName: "x", byMatchmaker: false })).rejects.toThrow(
      EngagementRuleError,
    );
  });

  it("is invisible to another matchmaker", async () => {
    const yaakov = await person(Side.MALE, "יעקב");
    const { id } = await engage(matchmakerId, { candidateId: yaakov, partnerName: "רבקה", byMatchmaker: true });
    expect(await getEngagement(otherMatchmakerId, id)).toBeNull();
    await expect(cancelEngagement(otherMatchmakerId, id)).rejects.toThrow();
    await expect(engage(otherMatchmakerId, { candidateId: yaakov, partnerName: "x", byMatchmaker: false })).rejects.toThrow();
  });
});

describe("ending an engagement", () => {
  it("cancelling frees the couple and declines the introduction", async () => {
    const [levi, dina] = [await person(Side.MALE, "לוי"), await person(Side.FEMALE, "דינה")];
    const introduction = await proposeIntroduction(matchmakerId, levi, dina);
    await changeIntroductionStatus(matchmakerId, introduction.id, IntroductionStatus.ENGAGED);
    const engagement = (await engagementOf(matchmakerId, levi))!;

    await cancelEngagement(matchmakerId, engagement.id);

    expect(await statusOf(levi, dina)).toEqual([CandidateStatus.AVAILABLE, CandidateStatus.AVAILABLE]);
    expect((await db.introduction.findUniqueOrThrow({ where: { id: introduction.id } })).status).toBe(IntroductionStatus.DECLINED);
  });

  it("deleting one partner's card keeps the other's engagement under that partner's name", async () => {
    const [gad, tova] = [await person(Side.MALE, "גד"), await person(Side.FEMALE, "טובה")];
    const introduction = await proposeIntroduction(matchmakerId, gad, tova);
    await changeIntroductionStatus(matchmakerId, introduction.id, IntroductionStatus.ENGAGED);

    await deleteCandidate(matchmakerId, gad);

    const engagement = await engagementOf(matchmakerId, tova);
    expect(engagement).toMatchObject({ male: null, partnerName: `גד ${RUN}` });
    expect(await statusOf(tova)).toEqual([CandidateStatus.ENGAGED]);
  });
});
