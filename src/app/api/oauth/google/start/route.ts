import { NextResponse } from "next/server";
import { OAUTH_STATE_COOKIE, setAuthCookie } from "@/server/auth/cookies";
import { requireMatchmakerId } from "@/server/auth/session";
import { randomToken } from "@/server/crypto";
import { env } from "@/server/env";
import { googleAuthUrl, isGoogleConfigured } from "@/server/mail/google";

const STATE_TTL_SECONDS = 10 * 60;

// Sends the signed-in matchmaker to Google to allow sending mail from their Gmail address
export async function GET() {
  await requireMatchmakerId();
  if (!isGoogleConfigured()) return NextResponse.redirect(new URL("/profile?mail=unavailable", env.APP_URL));
  const state = randomToken();
  await setAuthCookie(OAUTH_STATE_COOKIE, state, STATE_TTL_SECONDS);
  return NextResponse.redirect(googleAuthUrl(state));
}
