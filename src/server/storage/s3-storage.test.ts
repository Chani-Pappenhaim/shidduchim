import { afterEach, describe, expect, it, vi } from "vitest";
import { S3FileStorage } from "./s3-storage";

const storage = new S3FileStorage({
  endpoint: "https://s3.eu-central-003.backblazeb2.com/",
  bucket: "files",
  region: "eu-central-003",
  accessKeyId: "test-key-id",
  secretAccessKey: "test-secret",
});

function stubFetch(response: Response) {
  const fetchMock = vi.fn(async (_request: Request) => response);
  vi.stubGlobal("fetch", fetchMock);
  return () => fetchMock.mock.calls[0][0];
}

afterEach(() => vi.unstubAllGlobals());

describe("S3FileStorage", () => {
  it("uploads a signed object under the bucket path", async () => {
    const request = stubFetch(new Response(null, { status: 200 }));
    await storage.put("candidates/1/photo-a b.jpg", Buffer.from("data"));
    expect(request().method).toBe("PUT");
    expect(request().url).toBe("https://s3.eu-central-003.backblazeb2.com/files/candidates/1/photo-a%20b.jpg");
    expect(request().headers.get("authorization")).toMatch(/^AWS4-HMAC-SHA256 Credential=test-key-id\/\d+\/eu-central-003\/s3\//);
  });

  it("reads an object back", async () => {
    stubFetch(new Response("data", { status: 200 }));
    expect((await storage.get("candidates/1/photo.jpg"))?.toString()).toBe("data");
  });

  it("returns null for a missing object", async () => {
    stubFetch(new Response(null, { status: 404 }));
    expect(await storage.get("missing")).toBeNull();
  });

  it("fails loudly when the bucket rejects the request", async () => {
    stubFetch(new Response(null, { status: 403 }));
    await expect(storage.put("candidates/1/photo.jpg", Buffer.from("data"))).rejects.toThrow("403");
  });
});
