import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { env } from "@/server/env";
import { KvFileStorage } from "./kv-storage";
import { S3FileStorage } from "./s3-storage";
import type { FileStorage } from "./types";

// An S3-compatible bucket when one is configured, otherwise the Cloudflare KV namespace
export const storage: FileStorage =
  env.S3_ENDPOINT && env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
    ? new S3FileStorage({
        endpoint: env.S3_ENDPOINT,
        bucket: env.S3_BUCKET,
        // Backblaze endpoints name their region: https://s3.<region>.backblazeb2.com
        region: env.S3_REGION ?? new URL(env.S3_ENDPOINT).hostname.match(/^s3\.([^.]+)\./)?.[1] ?? "auto",
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      })
    : new KvFileStorage(() => getCloudflareContext().env.FILES);
