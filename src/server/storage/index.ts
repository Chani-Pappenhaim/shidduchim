import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { KvFileStorage } from "./kv-storage";
import type { FileStorage } from "./types";

export const storage: FileStorage = new KvFileStorage(() => getCloudflareContext().env.FILES);
