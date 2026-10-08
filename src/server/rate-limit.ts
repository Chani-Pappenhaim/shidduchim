import "server-only";
import { db } from "@/server/db";

export type RateRule = { limit: number; windowSeconds: number };

// Shared rules, so each kind of request is limited the same way wherever it is made
export const RATE_RULES = {
  loginPerEmail: { limit: 10, windowSeconds: 15 * 60 },
  loginPerIp: { limit: 30, windowSeconds: 15 * 60 },
  registerPerIp: { limit: 5, windowSeconds: 60 * 60 },
  invitePerMatchmaker: { limit: 30, windowSeconds: 24 * 60 * 60 },
  portalCodePerIp: { limit: 20, windowSeconds: 60 * 60 },
} satisfies Record<string, RateRule>;

export const RATE_LIMITED_MESSAGE = "יותר מדי ניסיונות. כדאי לנסות שוב בעוד כמה דקות";

const isUniqueViolation = (error: unknown) => (error as { code?: string } | null)?.code === "P2002";

// Counts one request under the key; false once the key used up its quota for the current window
export async function consumeRateLimit(key: string, { limit, windowSeconds }: RateRule, now = new Date()): Promise<boolean> {
  const windowOpen = new Date(now.getTime() - windowSeconds * 1000);
  for (let attempt = 0; attempt < 2; attempt++) {
    const counted = await db.rateLimit.updateMany({
      where: { key, windowStart: { gt: windowOpen }, count: { lt: limit } },
      data: { count: { increment: 1 } },
    });
    if (counted.count > 0) return true;

    const restarted = await db.rateLimit.updateMany({
      where: { key, windowStart: { lte: windowOpen } },
      data: { windowStart: now, count: 1 },
    });
    if (restarted.count > 0) return true;

    try {
      await db.rateLimit.create({ data: { key, windowStart: now, count: 1 } });
      return true;
    } catch (error) {
      // The row exists: either its quota is used up, or a parallel request just created it
      if (!isUniqueViolation(error)) throw error;
    }
  }
  return false;
}

// Every rule must pass; all are counted so a blocked caller keeps paying for each try
export async function consumeAll(checks: [string, RateRule][], now = new Date()): Promise<boolean> {
  let allowed = true;
  // One write at a time: D1 runs writes serially anyway
  for (const [key, rule] of checks) allowed = (await consumeRateLimit(key, rule, now)) && allowed;
  return allowed;
}

export async function pruneRateLimits(now = new Date()) {
  const longest = Math.max(...Object.values(RATE_RULES).map((rule) => rule.windowSeconds));
  const { count } = await db.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(now.getTime() - longest * 1000) } } });
  return count;
}
