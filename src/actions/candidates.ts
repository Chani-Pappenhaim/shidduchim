"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FileKind } from "@/generated/prisma/enums";
import { formValues, parseForm, type FormState } from "@/lib/form-state";
import { routes } from "@/lib/routes";
import { candidateSchema } from "@/lib/validation/candidate";
import { requireMatchmakerId } from "@/server/auth/session";
import { InvalidFileError, uploadCandidateFile, validateFile } from "@/server/services/candidate-file-service";
import { createCandidate, deleteCandidate, updateCandidate } from "@/server/services/candidate-service";

const FILE_FIELDS: Record<FileKind, string> = { PHOTO: "photo", RESUME: "resume" };

// Collects the non-empty uploads from the form, keyed by file kind
function pickFiles(formData: FormData): [FileKind, File][] {
  return (Object.entries(FILE_FIELDS) as [FileKind, string][])
    .map(([kind, field]): [FileKind, FormDataEntryValue | null] => [kind, formData.get(field)])
    .filter((entry): entry is [FileKind, File] => entry[1] instanceof File && entry[1].size > 0);
}

function fileErrors(files: [FileKind, File][]): Record<string, string[]> | null {
  for (const [kind, file] of files) {
    try {
      validateFile(kind, file);
    } catch (error) {
      if (error instanceof InvalidFileError) return { [FILE_FIELDS[kind]]: [error.message] };
      throw error;
    }
  }
  return null;
}

export async function saveCandidateAction(_: FormState, formData: FormData): Promise<FormState> {
  const matchmakerId = await requireMatchmakerId();
  const candidateId = formData.get("candidateId");
  const parsed = parseForm(candidateSchema, formData);
  if (!parsed.ok) return parsed.state;
  const files = pickFiles(formData);
  const invalid = fileErrors(files);
  if (invalid) return { error: "יש לתקן את הקבצים המסומנים", fieldErrors: invalid, values: formValues(formData) };

  const { id } = typeof candidateId === "string" && candidateId
    ? await updateCandidate(matchmakerId, candidateId, parsed.data)
    : await createCandidate(matchmakerId, parsed.data);
  for (const [kind, file] of files) await uploadCandidateFile(matchmakerId, id, kind, file);

  revalidatePath("/candidates");
  redirect(routes.candidate(id));
}

export async function deleteCandidateAction(candidateId: string) {
  const matchmakerId = await requireMatchmakerId();
  const { side } = await deleteCandidate(matchmakerId, candidateId);
  revalidatePath("/candidates");
  redirect(routes.candidates(side));
}
