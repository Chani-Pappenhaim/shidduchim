import { NextResponse, type NextRequest } from "next/server";
import { clearCookie, OAUTH_STATE_COOKIE, readCookie } from "@/server/auth/cookies";
import { requireMatchmakerId } from "@/server/auth/session";
import { env } from "@/server/env";
import { exchangeGoogleCode } from "@/server/mail/google";
import { saveGoogleConnection } from "@/server/services/mail-connection-service";

function backToProfile(result: "connected" | "error") {
  return NextResponse.redirect(new URL(`/profile?mail=${result}`, env.APP_URL));
}

// Google returns here after the matchmaker allowed (or refused) sending mail on their behalf
export async function GET(request: NextRequest) {
  const matchmakerId = await requireMatchmakerId();
  const { searchParams } = request.nextUrl;
  const expectedState = await readCookie(OAUTH_STATE_COOKIE);
  await clearCookie(OAUTH_STATE_COOKIE);

  const code = searchParams.get("code");
  if (!code || !expectedState || searchParams.get("state") !== expectedState) return backToProfile("error");
  try {
    await saveGoogleConnection(matchmakerId, await exchangeGoogleCode(code));
  } catch (error) {
    console.error("[oauth] Google connection failed", error);
    return backToProfile("error");
  }
  return backToProfile("connected");
}
