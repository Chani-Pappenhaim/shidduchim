import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { clearCookie, readCookie, SESSION_COOKIE, setAuthCookie } from "./cookies";
import { signToken, verifyToken } from "./token";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export async function startSession(matchmakerId: string) {
  await setAuthCookie(SESSION_COOKIE, await signToken("matchmaker", matchmakerId, SESSION_TTL_SECONDS), SESSION_TTL_SECONDS);
}

export async function endSession() {
  await clearCookie(SESSION_COOKIE);
}

export const getMatchmakerId = cache(async (): Promise<string | null> => {
  return verifyToken(await readCookie(SESSION_COOKIE), "matchmaker");
});

// Returns the signed-in matchmaker id or sends the visitor to the login page
export async function requireMatchmakerId(): Promise<string> {
  const id = await getMatchmakerId();
  if (!id) redirect("/login");
  return id;
}
