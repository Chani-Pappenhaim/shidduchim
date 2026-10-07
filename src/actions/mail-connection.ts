"use server";

import { revalidatePath } from "next/cache";
import { requireMatchmakerId } from "@/server/auth/session";
import { deleteMailConnection } from "@/server/services/mail-connection-service";

export async function disconnectMailAction() {
  await deleteMailConnection(await requireMatchmakerId());
  revalidatePath("/", "layout");
}
