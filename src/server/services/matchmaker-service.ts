import "server-only";
import { db } from "@/server/db";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import type { ProfileInput, RegisterInput } from "@/lib/validation/matchmaker";

export class EmailTakenError extends Error {}

export async function registerMatchmaker(input: RegisterInput) {
  const existing = await db.matchmaker.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw new EmailTakenError();
  return db.matchmaker.create({
    data: { name: input.name, email: input.email, passwordHash: await hashPassword(input.password) },
    select: { id: true },
  });
}

// Returns the matchmaker id when the credentials match, otherwise null
export async function authenticateMatchmaker(email: string, password: string): Promise<string | null> {
  const matchmaker = await db.matchmaker.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
  if (!matchmaker || !(await verifyPassword(password, matchmaker.passwordHash))) return null;
  return matchmaker.id;
}

export function getMatchmakerProfile(id: string) {
  return db.matchmaker.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      about: true,
      emailSignature: true,
      mailConnection: { select: { email: true, provider: true } },
    },
  });
}

export function updateMatchmakerProfile(id: string, input: ProfileInput) {
  return db.matchmaker.update({ where: { id }, data: input, select: { id: true } });
}
