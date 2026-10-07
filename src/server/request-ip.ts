import "server-only";
import { headers } from "next/headers";

// The caller's address as reported by the hosting edge (Cloudflare first, then a generic proxy)
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
