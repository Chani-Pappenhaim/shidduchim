import "server-only";
import { timingSafeEqual } from "node:crypto";
import { env } from "@/server/env";

// Scheduled jobs authenticate with "Authorization: Bearer <CRON_SECRET>"; without a secret they are disabled
export function isCronRequest(request: Request): boolean {
  if (!env.CRON_SECRET) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
