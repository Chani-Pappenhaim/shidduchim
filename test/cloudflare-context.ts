import { vi } from "vitest";

// Gives the services the local D1 database and KV namespace, as `next dev` does
vi.mock("@opennextjs/cloudflare", async () => {
  const { getPlatformProxy } = await import("wrangler");
  const platform = await getPlatformProxy<CloudflareEnv>();
  return { getCloudflareContext: () => ({ env: platform.env }) };
});
