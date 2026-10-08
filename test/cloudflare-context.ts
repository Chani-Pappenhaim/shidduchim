import { afterAll, vi } from "vitest";

const platform = vi.hoisted(async () => {
  const { getPlatformProxy } = await import("wrangler");
  return getPlatformProxy<CloudflareEnv>();
});

// Gives the services the local D1 database and KV namespace, as `next dev` does
vi.mock("@opennextjs/cloudflare", async () => {
  const { env } = await platform;
  return { getCloudflareContext: () => ({ env }) };
});

// Releases the local database so the next test file can open it
afterAll(async () => (await platform).dispose());
