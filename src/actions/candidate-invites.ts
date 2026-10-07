"use server";

import { revalidatePath } from "next/cache";
import { routes } from "@/lib/routes";
import { requireMatchmakerId } from "@/server/auth/session";
import { createInvite, InviteEmailMissingError, revokeInvites } from "@/server/services/portal-service";

export type InviteState = { url?: string; error?: string };

export async function createInviteAction(candidateId: string): Promise<InviteState> {
  const matchmakerId = await requireMatchmakerId();
  try {
    const { url } = await createInvite(matchmakerId, candidateId);
    revalidatePath(routes.candidate(candidateId));
    return { url };
  } catch (error) {
    if (error instanceof InviteEmailMissingError) return { error: "כדי לשלוח הזמנה צריך מייל בכרטיס" };
    throw error;
  }
}

export async function revokeInviteAction(candidateId: string) {
  await revokeInvites(await requireMatchmakerId(), candidateId);
  revalidatePath(routes.candidate(candidateId));
}
