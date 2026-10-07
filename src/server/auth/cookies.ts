import "server-only";
import { cookies } from "next/headers";

export { OAUTH_STATE_COOKIE, PORTAL_COOKIE, SESSION_COOKIE } from "./cookie-names";

// Stores a signed token in an httpOnly cookie
export async function setAuthCookie(name: string, token: string, maxAgeSeconds: number) {
  (await cookies()).set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function readCookie(name: string): Promise<string | undefined> {
  return (await cookies()).get(name)?.value;
}

export async function clearCookie(name: string) {
  (await cookies()).delete(name);
}
