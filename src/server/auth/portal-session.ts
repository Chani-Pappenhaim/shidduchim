import "server-only";
import { clearCookie, PORTAL_COOKIE, readCookie, setAuthCookie } from "./cookies";
import { signToken, verifyToken } from "./token";

const PORTAL_TTL_SECONDS = 60 * 60;

// A short session that lets a candidate edit their own details through one invite
export async function startPortalSession(inviteId: string) {
  await setAuthCookie(PORTAL_COOKIE, await signToken("portal", inviteId, PORTAL_TTL_SECONDS), PORTAL_TTL_SECONDS);
}

export async function endPortalSession() {
  await clearCookie(PORTAL_COOKIE);
}

export async function getPortalInviteId(): Promise<string | null> {
  return verifyToken(await readCookie(PORTAL_COOKIE), "portal");
}
