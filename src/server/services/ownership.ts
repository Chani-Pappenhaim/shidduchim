import "server-only";
import { db } from "@/server/db";

export class NotFoundError extends Error {}

// Throws unless the candidate belongs to the matchmaker
export async function assertCandidateOwner(matchmakerId: string, candidateId: string) {
  const found = await db.candidate.findFirst({ where: { id: candidateId, matchmakerId }, select: { id: true } });
  if (!found) throw new NotFoundError();
}
