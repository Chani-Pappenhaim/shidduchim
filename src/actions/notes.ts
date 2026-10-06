"use server";

import { revalidatePath } from "next/cache";
import { parseForm, type FormState } from "@/lib/form-state";
import { routes } from "@/lib/routes";
import { noteSchema } from "@/lib/validation/candidate";
import { requireMatchmakerId } from "@/server/auth/session";
import { addNote, deleteNote } from "@/server/services/note-service";

export async function addNoteAction(_: FormState, formData: FormData): Promise<FormState> {
  const matchmakerId = await requireMatchmakerId();
  const parsed = parseForm(noteSchema, formData);
  if (!parsed.ok) return parsed.state;
  await addNote(matchmakerId, parsed.data.candidateId, parsed.data.body);
  revalidatePath(routes.candidate(parsed.data.candidateId));
  return { success: "ההערה נשמרה" };
}

export async function deleteNoteAction(formData: FormData) {
  const candidateId = String(formData.get("candidateId"));
  await deleteNote(await requireMatchmakerId(), String(formData.get("noteId")));
  revalidatePath(routes.candidate(candidateId));
}
