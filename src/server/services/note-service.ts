import "server-only";
import { db } from "@/server/db";
import { assertCandidateOwner } from "./ownership";

export async function addNote(matchmakerId: string, candidateId: string, body: string) {
  await assertCandidateOwner(matchmakerId, candidateId);
  return db.privateNote.create({ data: { candidateId, body }, select: { id: true } });
}

export function deleteNote(matchmakerId: string, noteId: string) {
  return db.privateNote.deleteMany({ where: { id: noteId, candidate: { matchmakerId } } });
}
