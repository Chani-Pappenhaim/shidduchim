"use server";

import { revalidatePath } from "next/cache";
import { routes } from "@/lib/routes";
import { requireMatchmakerId } from "@/server/auth/session";
import { deleteCandidateFile } from "@/server/services/candidate-file-service";

export async function deleteFileAction(candidateId: string, fileId: string) {
  await deleteCandidateFile(await requireMatchmakerId(), fileId);
  revalidatePath(routes.candidate(candidateId));
  revalidatePath("/candidates");
}
