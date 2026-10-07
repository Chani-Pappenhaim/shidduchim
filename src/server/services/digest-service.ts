import "server-only";
import { buildDigest, WEDDING_NOTICE_DAYS } from "@/lib/digest";
import { todayDate } from "@/lib/format";
import { env } from "@/server/env";
import { sendSystemMail } from "@/server/mail/system-mailer";
import { listWeddingsOn } from "./engagement-service";
import { listMatchmakerContacts } from "./matchmaker-service";
import { listRemindersToNotify, markRemindersNotified } from "./reminder-service";

const DAY_MS = 86_400_000;

function groupBy<T extends { matchmakerId: string }>(items: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) groups.set(item.matchmakerId, [...(groups.get(item.matchmakerId) ?? []), item]);
  return groups;
}

// Emails each matchmaker a summary of reminders that fell due and of their upcoming weddings
export async function sendDailyDigests(now = new Date()) {
  const today = todayDate(now);
  const [reminders, weddings] = await Promise.all([
    listRemindersToNotify(today),
    listWeddingsOn(WEDDING_NOTICE_DAYS.map((days) => new Date(today.getTime() + days * DAY_MS))),
  ]);
  const remindersBy = groupBy(reminders);
  const weddingsBy = groupBy(weddings);
  const matchmakers = await listMatchmakerContacts([...new Set([...remindersBy.keys(), ...weddingsBy.keys()])]);

  let sent = 0;
  let failed = 0;
  for (const matchmaker of matchmakers) {
    const own = remindersBy.get(matchmaker.id) ?? [];
    const digest = buildDigest({ name: matchmaker.name, reminders: own, weddings: weddingsBy.get(matchmaker.id) ?? [] }, env.APP_URL, now);
    if (!digest) continue;
    try {
      await sendSystemMail({ to: matchmaker.email, ...digest });
      await markRemindersNotified(own.map((r) => r.id));
      sent++;
    } catch (error) {
      console.error(`[digest] failed for matchmaker ${matchmaker.id}`, error);
      failed++;
    }
  }
  return { sent, failed };
}
