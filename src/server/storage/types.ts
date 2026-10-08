// Contract for binary object storage, so drivers (KV, S3-compatible buckets) are interchangeable
export interface FileStorage {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  remove(key: string): Promise<void>;
}
