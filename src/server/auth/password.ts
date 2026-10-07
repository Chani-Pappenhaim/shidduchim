import "server-only";
import bcrypt from "bcryptjs";

const ROUNDS = 12;

let dummyHash: Promise<string> | undefined;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

// Without a stored hash the check still runs against a dummy one, so timing does not reveal unknown accounts
export async function verifyPassword(password: string, hash: string | null | undefined): Promise<boolean> {
  if (hash) return bcrypt.compare(password, hash);
  dummyHash ??= hashPassword("not-a-real-password");
  await bcrypt.compare(password, await dummyHash);
  return false;
}
