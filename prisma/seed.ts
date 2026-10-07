import { PrismaD1 } from "@prisma/adapter-d1";
import { getPlatformProxy } from "wrangler";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/server/auth/password";
import { CandidateStatus, IntroductionStatus, Side } from "../src/generated/prisma/enums";

// Demo matchmaker with sample data for local development; rerunning replaces only this account
const DEMO_EMAIL = "demo@shadchones.test";
const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? "demo-shadchan-1";

// Seeds the local D1 database that `next dev` and `wrangler dev` use
const platform = getPlatformProxy<CloudflareEnv>();
let db: PrismaClient;

// Whole-day dates are stored as UTC midnight, relative to today
function day(offset: number): Date {
  const today = new Date();
  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + offset));
}

const men = [
  { firstName: "יוסף", lastName: "כהן", city: "בני ברק", occupation: "אברך", birthDate: new Date("2002-03-10") },
  { firstName: "משה", lastName: "לוי", city: "ירושלים", occupation: "מהנדס תוכנה", birthDate: new Date("2000-07-21") },
  { firstName: "אהרון", lastName: "פרידמן", city: "בית שמש", occupation: "מלמד", birthDate: new Date("2001-11-02") },
  { firstName: "דוד", lastName: "אזולאי", city: "אשדוד", occupation: "רואה חשבון", birthDate: new Date("1999-01-15") },
  { firstName: "שמואל", lastName: "גולדברג", city: "מודיעין עילית", occupation: "אברך", birthDate: new Date("2003-05-30") },
];

const women = [
  { firstName: "רחל", lastName: "שפירא", city: "בני ברק", occupation: "גננת", birthDate: new Date("2003-02-12") },
  { firstName: "שרה", lastName: "ברגר", city: "ירושלים", occupation: "מורה", birthDate: new Date("2002-09-04") },
  { firstName: "לאה", lastName: "רוזנברג", city: "אלעד", occupation: "מעצבת גרפית", birthDate: new Date("2001-12-19") },
  { firstName: "חנה", lastName: "מזרחי", city: "פתח תקווה", occupation: "אחות", birthDate: new Date("2000-06-08") },
  { firstName: "מרים", lastName: "וייס", city: "בית שמש", occupation: "סטודנטית", birthDate: new Date("2004-04-25") },
];

async function main() {
  db = new PrismaClient({ adapter: new PrismaD1((await platform).env.DB) });
  await db.matchmaker.deleteMany({ where: { email: DEMO_EMAIL } });
  const matchmaker = await db.matchmaker.create({
    data: { email: DEMO_EMAIL, name: "שדכנית לדוגמה", city: "בני ברק", passwordHash: await hashPassword(DEMO_PASSWORD) },
  });
  const matchmakerId = matchmaker.id;
  const create = (side: Side) => (person: (typeof men)[number]) => db.candidate.create({ data: { matchmakerId, side, ...person } });
  const [yosef, moshe, aharon, david, shmuel] = await Promise.all(men.map(create(Side.MALE)));
  const [rachel, sarah, leah, chana, miriam] = await Promise.all(women.map(create(Side.FEMALE)));

  // An introduction in progress
  await db.introduction.create({
    data: { matchmakerId, maleId: yosef.id, femaleId: rachel.id, status: IntroductionStatus.MEETING, proposedBy: "אני", meetings: { create: { date: day(-3) } } },
  });
  await db.candidate.updateMany({ where: { id: { in: [yosef.id, rachel.id] } }, data: { status: CandidateStatus.IN_PROCESS } });
  await db.introduction.create({ data: { matchmakerId, maleId: moshe.id, femaleId: sarah.id, status: IntroductionStatus.PROPOSED, proposedBy: "אני" } });

  // A couple the matchmaker made, wedding coming up
  const introduction = await db.introduction.create({
    data: { matchmakerId, maleId: aharon.id, femaleId: leah.id, status: IntroductionStatus.ENGAGED, proposedBy: "אני" },
  });
  await db.engagement.create({
    data: { matchmakerId, maleId: aharon.id, femaleId: leah.id, introductionId: introduction.id, byMatchmaker: true, engagedAt: day(-40), weddingDate: day(12), weddingVenue: "אולמי ורסאי, בני ברק" },
  });
  // Already married through the matchmaker
  await db.engagement.create({
    data: { matchmakerId, maleId: david.id, femaleId: chana.id, byMatchmaker: true, engagedAt: day(-150), weddingDate: day(-30) },
  });
  // Engaged to someone outside the database, matched by someone else
  await db.engagement.create({
    data: { matchmakerId, maleId: shmuel.id, partnerName: "אסתר קליין", madeBy: "ר׳ יעקב", engagedAt: day(-10) },
  });
  await db.engagement.create({
    data: { matchmakerId, femaleId: miriam.id, partnerName: "נחום הלפרין", byMatchmaker: true, engagedAt: day(-20), weddingDate: day(45) },
  });
  await db.candidate.updateMany({ where: { id: { in: [aharon.id, leah.id, shmuel.id, miriam.id] } }, data: { status: CandidateStatus.ENGAGED } });
  await db.candidate.updateMany({ where: { id: { in: [david.id, chana.id] } }, data: { status: CandidateStatus.MARRIED } });

  await db.reminder.create({ data: { matchmakerId, title: "לחזור לרחל אחרי הפגישה", dueAt: day(0), candidateId: rachel.id } });

  console.log(`Seeded demo matchmaker ${DEMO_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => (await platform).dispose());
