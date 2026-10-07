import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getSessionVersion, revokeSessions } from "@/server/services/matchmaker-service";
import { clearCookie, readCookie, SESSION_COOKIE, setAuthCookie } from "./cookies";
import { readToken, signToken } from "./token";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export async function startSession(matchmakerId: string) {
  const version = (await getSessionVersion(matchmakerId)) ?? 0;
  await setAuthCookie(SESSION_COOKIE, await signToken("matchmaker", matchmakerId, SESSION_TTL_SECONDS, version), SESSION_TTL_SECONDS);
}

// Signs out on every device, not only this browser
export async function endSession() {
  const id = await getMatchmakerId();
  if (id) await revokeSessions(id);
  await clearCookie(SESSION_COOKIE);
}

// A valid signature is not enough: the token must also carry the matchmaker's current session version
export const getMatchmakerId = cache(async (): Promise<string | null> => {
  const claims = await readToken(await readCookie(SESSION_COOKIE), "matchmaker");
  if (!claims) return null;
  return (await getSessionVersion(claims.subject)) === claims.version ? claims.subject : null;
});

// Returns the signed-in matchmaker id or sends the visitor to the login page
export async function requireMatchmakerId(): Promise<string> {
  const id = await getMatchmakerId();
  if (!id) redirect("/login");
  return id;
}
