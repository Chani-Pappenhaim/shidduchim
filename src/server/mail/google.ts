import "server-only";
import { env } from "@/server/env";

// Google OAuth and Gmail API calls that let a matchmaker send mail from their own Gmail address

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const SCOPES = ["openid", "email", "https://www.googleapis.com/auth/gmail.send"];

export const GOOGLE_PROVIDER = "google";

// The stored grant was revoked or expired; the matchmaker has to connect again
export class MailGrantRevokedError extends Error {}

export function isGoogleConfigured(): boolean {
  return !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET;
}

function redirectUri(): string {
  return new URL("/api/oauth/google/callback", env.APP_URL).toString();
}

export function googleAuthUrl(state: string): string {
  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  }).toString();
  return url.toString();
}

async function tokenRequest(params: Record<string, string>) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET!, ...params }),
  });
  const data = await response.json();
  if (response.ok) return data as { access_token: string; refresh_token?: string; id_token?: string };
  if (data.error === "invalid_grant") throw new MailGrantRevokedError();
  throw new Error(`Google token request failed: ${data.error ?? response.status}`);
}

// The ID token comes straight from Google's token endpoint over TLS, so its claims are read without re-verifying
function emailFromIdToken(idToken: string | undefined): string | undefined {
  const payload = idToken?.split(".")[1];
  if (!payload) return undefined;
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string; email_verified?: boolean };
  return claims.email_verified ? claims.email : undefined;
}

// Exchanges the authorization code for a long-lived grant and the connected address
export async function exchangeGoogleCode(code: string): Promise<{ email: string; refreshToken: string }> {
  const tokens = await tokenRequest({ code, grant_type: "authorization_code", redirect_uri: redirectUri() });
  const email = emailFromIdToken(tokens.id_token);
  if (!tokens.refresh_token || !email) throw new Error("Google did not return an offline grant with a verified email");
  return { email, refreshToken: tokens.refresh_token };
}

export async function sendWithGmail(refreshToken: string, mime: Buffer): Promise<void> {
  const { access_token } = await tokenRequest({ refresh_token: refreshToken, grant_type: "refresh_token" });
  const response = await fetch(SEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: mime.toString("base64url") }),
  });
  if (response.status === 401 || response.status === 403) throw new MailGrantRevokedError();
  if (!response.ok) throw new Error(`Gmail send failed: ${response.status}`);
}
