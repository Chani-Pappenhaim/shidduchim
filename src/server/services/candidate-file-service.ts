import "server-only";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type { FileKind } from "@/generated/prisma/enums";
import { FILE_RULES } from "@/lib/files";
import { db } from "@/server/db";
import { storage } from "@/server/storage";
import { assertCandidateOwner } from "./ownership";

export class InvalidFileError extends Error {}

export function validateFile(kind: FileKind, file: File) {
  const rules = FILE_RULES[kind];
  if (file.size === 0) throw new InvalidFileError("לא נבחר קובץ");
  if (!rules.mimeTypes.includes(file.type)) throw new InvalidFileError(`סוג הקובץ לא נתמך עבור ${rules.label}`);
  if (file.size > rules.maxBytes) throw new InvalidFileError(`${rules.label} גדול מדי`);
}

// Saves a candidate file, replacing the previous file of the same kind; callers must authorize first
export async function replaceCandidateFile(candidateId: string, kind: FileKind, file: File) {
  validateFile(kind, file);
  const storageKey = `candidates/${candidateId}/${kind.toLowerCase()}-${randomUUID()}${path.extname(file.name).toLowerCase()}`;
  await storage.put(storageKey, Buffer.from(await file.arrayBuffer()));

  const previous = await db.candidateFile.findUnique({ where: { candidateId_kind: { candidateId, kind } } });
  const data = { storageKey, originalName: file.name, mimeType: file.type, sizeBytes: file.size };
  await db.candidateFile.upsert({ where: { candidateId_kind: { candidateId, kind } }, create: { candidateId, kind, ...data }, update: data });
  if (previous) await storage.remove(previous.storageKey);
}

export async function uploadCandidateFile(matchmakerId: string, candidateId: string, kind: FileKind, file: File) {
  await assertCandidateOwner(matchmakerId, candidateId);
  await replaceCandidateFile(candidateId, kind, file);
}

export async function deleteCandidateFile(matchmakerId: string, fileId: string) {
  const file = await db.candidateFile.findFirst({ where: { id: fileId, candidate: { matchmakerId } } });
  if (!file) return null;
  await db.candidateFile.delete({ where: { id: file.id } });
  await storage.remove(file.storageKey);
  return file;
}

// Loads a stored file only when it belongs to one of the matchmaker's candidates
export async function readCandidateFile(matchmakerId: string, fileId: string) {
  const file = await db.candidateFile.findFirst({ where: { id: fileId, candidate: { matchmakerId } } });
  if (!file) return null;
  const data = await storage.get(file.storageKey);
  return data && { file, data };
}

export async function removeStoredFiles(keys: string[]) {
  await Promise.all(keys.map((key) => storage.remove(key)));
}
