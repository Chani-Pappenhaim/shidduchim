import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Side } from "@/generated/prisma/enums";
import { candidateSchema } from "@/lib/validation/candidate";
import { db } from "@/server/db";
import { createCandidate, getCandidate, updateCandidate } from "./candidate-service";

const RUN = Date.now().toString(36);
let matchmakerId: string;

beforeAll(async () => {
  ({ id: matchmakerId } = await db.matchmaker.create({
    data: { email: `candidates-${RUN}@engagement.test`, name: "חנה", passwordHash: "-" },
  }));
});

afterAll(async () => {
  await db.matchmaker.delete({ where: { id: matchmakerId } });
  await db.$disconnect();
});

describe("updating a candidate", () => {
  it("clears the fields that were emptied in the form", async () => {
    const base = { side: Side.MALE, firstName: "משה", lastName: RUN };
    const { id } = await createCandidate(matchmakerId, candidateSchema.parse({ ...base, city: "צפת", about: "שקדן" }));
    await updateCandidate(matchmakerId, id, candidateSchema.parse({ ...base, city: "", about: "שקדן מאוד" }));
    const candidate = await getCandidate(matchmakerId, id);
    expect(candidate).toMatchObject({ city: null, about: "שקדן מאוד", status: "AVAILABLE" });
  });
});
