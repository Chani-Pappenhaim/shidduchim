import { pbkdf2, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// PBKDF2 runs natively on Cloudflare Workers, where a pure-JS bcrypt would exceed the CPU budget
const ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const derive = promisify(pbkdf2);

const DUMMY_HASH = `pbkdf2$${ITERATIONS}$${"A".repeat(22)}$${"A".repeat(43)}`;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, ITERATIONS, KEY_LENGTH, "sha256");
  return ["pbkdf2", ITERATIONS, salt.toString("base64url"), key.toString("base64url")].join("$");
}

async function matches(password: string, stored: string): Promise<boolean> {
  const [scheme, iterations, salt, expected] = stored.split("$");
  if (scheme !== "pbkdf2" || !salt || !expected) return false;
  const expectedKey = Buffer.from(expected, "base64url");
  const key = await derive(password, Buffer.from(salt, "base64url"), Number(iterations), expectedKey.length, "sha256");
  return timingSafeEqual(key, expectedKey);
}

// Without a stored hash the check still runs against a dummy one, so timing does not reveal unknown accounts
export async function verifyPassword(password: string, hash: string | null | undefined): Promise<boolean> {
  const ok = await matches(password, hash ?? DUMMY_HASH);
  return !!hash && ok;
}
