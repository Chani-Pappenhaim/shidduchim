import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from "@prisma/adapter-d1";
import { type Prisma, PrismaClient } from "@/generated/prisma/client";

let client: PrismaClient | undefined;

// The D1 binding only exists once the worker runs, so the client is created on first use
function getClient(): PrismaClient {
  client ??= new PrismaClient({ adapter: new PrismaD1(getCloudflareContext().env.DB) });
  return client;
}

// Single shared client for the D1 database; services use it like a plain PrismaClient
export const db = new Proxy({} as PrismaClient, {
  get: (_, property) => {
    const value = Reflect.get(getClient(), property);
    return typeof value === "function" ? value.bind(getClient()) : value;
  },
});

// D1 has no interactive transactions, so the steps run in order on the shared client.
// Each step stays scoped by ownership checks, and a failure part-way leaves earlier steps applied.
export function transaction<T>(steps: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return steps(db);
}
