import "server-only";
import { AwsClient } from "aws4fetch";
import type { FileStorage } from "./types";

export interface S3Config {
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

// Stores files as private objects in an S3-compatible bucket (Backblaze B2, R2, AWS S3)
export class S3FileStorage implements FileStorage {
  private readonly client: AwsClient;

  constructor(private readonly config: S3Config) {
    this.client = new AwsClient({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
      service: "s3",
    });
  }

  async put(key: string, data: Buffer) {
    await this.send(key, { method: "PUT", body: new Uint8Array(data) });
  }

  async get(key: string) {
    const response = await this.send(key, { method: "GET" }, [404]);
    return response.status === 404 ? null : Buffer.from(await response.arrayBuffer());
  }

  async remove(key: string) {
    await this.send(key, { method: "DELETE" }, [404]);
  }

  private async send(key: string, init: RequestInit, allowed: number[] = []) {
    const path = [this.config.bucket, ...key.split("/")].map(encodeURIComponent).join("/");
    const response = await this.client.fetch(`${this.config.endpoint.replace(/\/+$/, "")}/${path}`, init);
    if (!response.ok && !allowed.includes(response.status)) {
      throw new Error(`File storage ${init.method} failed with status ${response.status}`);
    }
    return response;
  }
}
