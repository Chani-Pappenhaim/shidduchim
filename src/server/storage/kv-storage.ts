import "server-only";
import type { FileStorage } from "./types";

// Stores files as values in a Cloudflare KV namespace
export class KvFileStorage implements FileStorage {
  constructor(private readonly namespace: () => KVNamespace) {}

  async put(key: string, data: Buffer) {
    await this.namespace().put(key, data);
  }

  async get(key: string) {
    const value = await this.namespace().get(key, "arrayBuffer");
    return value && Buffer.from(value);
  }

  async remove(key: string) {
    await this.namespace().delete(key);
  }
}
