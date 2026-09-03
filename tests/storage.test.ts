import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { inspectAsset, signAsset, signUpload, storageRequest } from "../src/features/hamper/server/storage";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test-key");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("reports placeholder storage configuration before making any network request", async () => {
  const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://YOUR_PROJECT.supabase.co");
  await expect(signUpload("private/photo")).rejects.toMatchObject({ status: 503, message: expect.stringContaining("aren't configured") });
  expect(fetch).not.toHaveBeenCalled();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("SUPABASE_SECRET_KEY", "YOUR_SERVICE_ROLE_KEY");
  await expect(signUpload("private/photo")).rejects.toMatchObject({ status: 503 });
  expect(fetch).not.toHaveBeenCalled();
});
it("keeps connection failures distinct from saving text keepsakes", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
  await expect(storageRequest("object/test")).rejects.toMatchObject({ status: 502, message: expect.stringContaining("upload service couldn't be reached") });
});
it.each(["/object/upload/sign/bucket/photo?token=test", "object/upload/sign/bucket/photo?token=test", "https://project.supabase.co/storage/v1/object/upload/sign/bucket/photo?token=test"])("resolves the storage signed URL format %s", async returned => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ url: returned })));
  await expect(signUpload("private/photo")).resolves.toBe("https://project.supabase.co/storage/v1/object/upload/sign/bucket/photo?token=test");
});
it("validates signed downloads and rejects malformed or foreign links", async () => {
  const fetch = vi.fn().mockResolvedValueOnce(Response.json({ signedURL: "/object/sign/bucket/photo?token=test" })).mockResolvedValueOnce(Response.json({})).mockResolvedValueOnce(Response.json({ url: "https://outside.example/upload" }));
  vi.stubGlobal("fetch", fetch);
  await expect(signAsset("private/photo")).resolves.toBe("https://project.supabase.co/storage/v1/object/sign/bucket/photo?token=test");
  await expect(signUpload("private/photo")).rejects.toMatchObject({ status: 502 });
  await expect(signUpload("private/photo")).rejects.toMatchObject({ status: 502 });
});
it.each([
  { size: 68, content_type: "image/png", metadata: {} },
  { metadata: { size: 68, mimetype: "image/png" } },
  { size: 68, contentType: "image/png" },
])("reads authoritative MIME/size from storage response %j", async response => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(response)));
  await expect(inspectAsset("private/photo")).resolves.toEqual({ size: 68, mime: "image/png" });
});
