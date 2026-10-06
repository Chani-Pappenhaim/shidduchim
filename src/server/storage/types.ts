// Contract for binary object storage, so drivers (local disk, S3) are interchangeable
export interface FileStorage {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  remove(key: string): Promise<void>;
}
