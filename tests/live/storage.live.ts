import { beforeAll, expect, it, vi } from "vitest";
import { loadEnvConfig } from "@next/env";
import { randomUUID } from "node:crypto";
import { BUCKET, copyAsset, encodePath, inspectAsset, signAsset, signUpload, storageRequest } from "../../src/features/hamper/server/storage";

beforeAll(() => {
  // Next intentionally excludes .env.local under NODE_ENV=test. These opt-in
  // live checks must load the same credentials as the local development app.
  vi.stubEnv("NODE_ENV", "development");
  loadEnvConfig(process.cwd(), true);
});
it("uploads, inspects, signs, downloads and removes real private photo and voice files", async () => {
  const prefix = `ode-upload-check-${randomUUID()}/${randomUUID()}/${randomUUID()}`;
  const paths = ["photo", "voice", "copy"].map(name => `${prefix}/${name}`);
  const photo = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aIZ0AAAAASUVORK5CYII=", "base64");
  const voice = Buffer.alloc(44 + 800 * 2);
  voice.write("RIFF", 0); voice.writeUInt32LE(voice.length - 8, 4); voice.write("WAVEfmt ", 8); voice.writeUInt32LE(16, 16); voice.writeUInt16LE(1, 20); voice.writeUInt16LE(1, 22); voice.writeUInt32LE(8000, 24); voice.writeUInt32LE(16000, 28); voice.writeUInt16LE(2, 32); voice.writeUInt16LE(16, 34); voice.write("data", 36); voice.writeUInt32LE(1600, 40);
  try {
    const upload = await fetch(await signUpload(paths[0]), { method: "PUT", headers: { "content-type": "image/png" }, body: photo });
    expect(upload.ok).toBe(true);
    await storageRequest(`object/${BUCKET}/${encodePath(paths[1])}`, { method: "POST", headers: { "content-type": "audio/wav", "x-upsert": "false" }, body: Uint8Array.from(voice) });
    for (const [index, bytes, mime] of [[0, photo, "image/png"], [1, voice, "audio/wav"]] as const) {
      const metadata = await inspectAsset(paths[index]);
      expect(metadata).toEqual({ size: bytes.length, mime });
      const download = await fetch(await signAsset(paths[index]));
      expect(download.ok).toBe(true);
      expect(Buffer.from(await download.arrayBuffer())).toEqual(bytes);
    }
    await copyAsset(paths[0], paths[2]);
    expect((await inspectAsset(paths[2])).size).toBe(photo.length);
  } finally {
    // Exact fresh paths only; never enumerate or remove user uploads.
    await storageRequest(`object/${BUCKET}`, { method: "DELETE", body: JSON.stringify({ prefixes: paths }) });
  }
});
