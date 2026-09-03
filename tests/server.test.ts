import { beforeAll, beforeEach, afterAll, describe, expect, it, vi } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { taggedDatabase } from "./dbAdapter";
import { fixtureHamper, fixtureItem } from "./fixtures";
import type { HamperContent } from "../src/features/hamper/types";
const state = vi.hoisted(() => ({ db: null as unknown, owner: "user_alice", cookies: new Map<string, string>() }));
vi.mock("@/lib/database", () => ({ database: () => state.db }));
vi.mock("@clerk/nextjs/server", () => ({ auth: async () => ({ userId: state.owner }) }));
vi.mock("next/headers", () => ({ cookies: () => ({ get: (key: string) => state.cookies.has(key) ? { value: state.cookies.get(key) } : undefined, set: (key: string, value: string) => state.cookies.set(key, value) }) }));
vi.mock("@/features/hamper/server/storage", () => ({ BUCKET: "ode-hamper-assets", encodePath: (path: string) => path, storageRequest: vi.fn(async () => new Response("{}")), cleanupStorage: vi.fn(async () => undefined), copyAsset: vi.fn(async () => undefined), signAsset: vi.fn(async () => "https://storage.example/signed"), signUpload: vi.fn(async () => "https://storage.example/upload"), inspectAsset: vi.fn(async () => ({ size: 1234, mime: "image/jpeg" })) }));
import { createHamper, ownedHamper, ownerDto, saveHamper, duplicateHamper } from "../src/features/hamper/server/repository";
import { activeLink, publicContent, writeEvent } from "../src/features/hamper/server/public";
import { accessToken, grantAccess, hashPin, rateLimit, validAccessToken, verifyPin } from "../src/features/hamper/server/security";
import { saveWebsite } from "../src/lib/websiteProjects";
import { createEmptyProject } from "../src/lib/types";
import { publishedProjectBySlug } from "../src/lib/publishedProjects";
import { POST as unlock } from "../src/app/api/hamper/[slug]/unlock/route";
import { GET as ownerGet } from "../src/app/api/hampers/[id]/route";
import { POST as eventPost } from "../src/app/api/hamper/[slug]/events/route";
import { POST as uploadStart, PUT as uploadFinish } from "../src/app/api/hampers/[id]/assets/route";
import { inspectAsset } from "../src/features/hamper/server/storage";
let db: PGlite;
const plainContent = (): HamperContent => ({ ...fixtureHamper(), items: [{ ...fixtureItem("note"), id: crypto.randomUUID() }] });
async function pack(published = false, pin?: string) {
  const id = await createHamper("user_alice"), row = await ownedHamper("user_alice", id);
  const hamper = await saveHamper("user_alice", id, plainContent(), { publish: published, pin, updatedAt: row.updated_at.toISOString() });
  return { id, slug: hamper.links[0].slug, hamper };
}
beforeAll(async () => {
  process.env.HAMPER_ACCESS_SECRET = "test-only-secret-with-at-least-32-characters"; process.env.NEXT_PUBLIC_CLERK_ENABLED = "true";
  db = new PGlite(); state.db = taggedDatabase(db);
  await db.exec("create role anon; create role authenticated; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid primary key,bucket_id text);");
  for (const file of ["001_published_birthday_projects.sql", "003_studio_ownership.sql", "004_digital_hampers.sql"]) await db.exec(readFileSync(`database/migrations/${file}`, "utf8"));
});
beforeEach(async () => { state.owner = "user_alice"; state.cookies.clear(); await db.exec("delete from digital_hampers; delete from hamper_access_attempts; delete from birthday_projects;"); });
afterAll(async () => { await db.close(); });
describe("real PostgreSQL schema and server access", () => {
  it("isolates owners in both repository and HTTP route", async () => { const { id } = await pack(); await expect(ownedHamper("user_bob", id)).rejects.toThrow("not found"); state.owner = "user_bob"; expect((await ownerGet(new Request("http://local"), { params: { id } })).status).toBe(404); });
  it("does not let anonymous database roles read or write base tables", async () => { await db.exec("set role anon"); await expect(db.query("select * from digital_hampers")).rejects.toThrow("permission denied"); await expect(db.query("insert into hamper_events(hamper_id) values(gen_random_uuid())")).rejects.toThrow("permission denied"); await db.exec("reset role"); });
  it("rejects duplicate slugs; drafts and revoked links stay private", async () => {
    const a = await pack(); await expect(activeLink(a.slug)).rejects.toThrow("isn't available"); const b = await pack(true);
    await expect(db.query("insert into hamper_share_links(hamper_id,slug) values($1,$2)", [a.id, b.slug])).rejects.toThrow("unique");
    await db.query("update hamper_share_links set revoked_at=now() where slug=$1", [b.slug]); await expect(publicContent(b.slug)).rejects.toThrow("isn't available");
  });
  it("requires a correct PIN and never serializes hashes or owner IDs", async () => {
    const p = await pack(true, "12345"); await expect(publicContent(p.slug)).rejects.toThrow("PIN");
    const bad = await unlock(new Request("http://local", { method: "POST", body: JSON.stringify({ pin: "54321" }) }), { params: { slug: p.slug } }); expect(bad.status).toBe(401);
    const good = await unlock(new Request("http://local", { method: "POST", body: JSON.stringify({ pin: "12345" }) }), { params: { slug: p.slug } }); expect(good.status).toBe(200);
    const dto = await publicContent(p.slug); expect(dto.items).toHaveLength(1); expect(JSON.stringify(dto)).not.toMatch(/owner_id|pin_hash|access_version|write_token/);
  });
  it("hashes PINs with random salts, rejects modified/expired access cookies", async () => {
    const hash = await hashPin("1234"); expect(hash).not.toBe("1234"); expect(hash).not.toBe(await hashPin("1234")); expect(await verifyPin("1234", hash)).toBe(true); expect(await verifyPin("0000", hash)).toBe(false);
    const token = accessToken("link", "version", Date.now() + 10000); expect(validAccessToken(token, "link", "version")).toBe(true); expect(validAccessToken(token, "link", "different")).toBe(false); expect(validAccessToken(token + "x", "link", "version")).toBe(false); expect(validAccessToken(accessToken("link", "version", Date.now() - 1), "link", "version")).toBe(false);
  });
  it("rate limits after five PIN tries in a shared database", async () => { for (let i = 0; i < 5; i++) await rateLimit("pin-test", 5, 900); await expect(rateLimit("pin-test", 5, 900)).rejects.toThrow("too many"); });
  it("enforces the 10 hamper cap in the database", async () => { for (let i = 0; i < 10; i++) await createHamper("user_alice"); await expect(createHamper("user_alice")).rejects.toThrow("10 hampers"); await expect(db.query("insert into digital_hampers(owner_id) values('user_alice')")).rejects.toThrow("10 active"); });
  it("enforces database type/item caps and per-hamper storage limits", async () => {
    const { id } = await pack();
    for (let i = 1; i < 10; i++) await db.query("insert into hamper_items(id,hamper_id,type,position,payload) values(gen_random_uuid(),$1,'note',$2,'{}')", [id, i]);
    await expect(db.query("insert into hamper_items(id,hamper_id,type,position,payload) values(gen_random_uuid(),$1,'note',10,'{}')", [id])).rejects.toThrow("type cap");
    for (let i = 0; i < 5; i++) await db.query("insert into hamper_assets(hamper_id,owner_id,item_id,path,kind,mime,asset_bytes) values($1,'user_alice',gen_random_uuid(),$2,'photo','image/jpeg',5242880)", [id, `asset-${i}`]);
    await expect(db.query("insert into hamper_assets(hamper_id,owner_id,item_id,path,kind,mime,asset_bytes) values($1,'user_alice',gen_random_uuid(),'overflow','photo','image/jpeg',1)", [id])).rejects.toThrow("storage cap");
    await expect(db.query("insert into hamper_assets(hamper_id,owner_id,item_id,path,kind,mime,asset_bytes) values($1,'user_bob',gen_random_uuid(),'stolen','photo','image/jpeg',1)", [id])).rejects.toThrow();
  });
  it("enforces 200 MB across the owner's hampers", async () => {
    for (let h = 0; h < 8; h++) { const id = await createHamper("user_alice"); for (let i = 0; i < 5; i++) await db.query("insert into hamper_assets(hamper_id,owner_id,item_id,path,kind,mime,asset_bytes) values($1,'user_alice',gen_random_uuid(),$2,'photo','image/jpeg',5242880)", [id, `quota-${h}-${i}`]); }
    const id = await createHamper("user_alice"); await expect(db.query("insert into hamper_assets(hamper_id,owner_id,item_id,path,kind,mime,asset_bytes) values($1,'user_alice',gen_random_uuid(),'over-user','photo','image/jpeg',1)", [id])).rejects.toThrow("User storage cap");
  });
  it("enforces upload limits server-side, reserves quota, then measures actual bytes", async () => {
    const { id } = await pack(); const itemId = crypto.randomUUID();
    const start = (kind: string, size: number, mime: string) => uploadStart(new Request("http://local", { method: "POST", body: JSON.stringify({ kind, size, mime, itemId }) }), { params: { id } });
    expect((await start("photo", 5242881, "image/jpeg")).status).toBe(422);
    expect((await start("voice", 2097153, "audio/webm")).status).toBe(422);
    expect((await start("voice", 100, "audio/webm")).status).toBe(400);
    const voice = await uploadStart(new Request("http://local", { method: "POST", headers: { "content-type":"audio/webm", "x-ode-item-id":itemId }, body: Buffer.alloc(1024) }), { params: { id } });
    expect(voice.status).toBe(200); expect((await voice.json()).assetBytes).toBe(1024);
    const tooLarge = await uploadStart(new Request("http://local", { method: "POST", headers: { "content-type":"audio/webm", "x-ode-item-id":itemId }, body: Buffer.alloc(2097153) }), { params: { id } });
    expect(tooLarge.status).toBe(413);
    expect((await start("video", 100, "video/mp4")).status).toBe(400);
    const response = await start("photo", 1, "image/jpeg"); expect(response.status).toBe(200); const { assetId } = await response.json();
    const reserved = await db.query<{ asset_bytes: number }>("select asset_bytes from hamper_assets where id=$1", [assetId]); expect(Number(reserved.rows[0].asset_bytes)).toBe(5242880);
    const finalized = await uploadFinish(new Request("http://local", { method:"PUT", body:JSON.stringify({ assetId }) }), { params:{ id } });
    expect(finalized.status).toBe(200); expect((await finalized.json()).assetBytes).toBe(1234);
    const second = await start("photo", 1, "image/jpeg"); const invalid = await second.json(); vi.mocked(inspectAsset).mockResolvedValueOnce({ size:6000000,mime:"image/jpeg" });
    expect((await uploadFinish(new Request("http://local", { method:"PUT", body:JSON.stringify({ assetId:invalid.assetId }) }), { params:{ id } })).status).toBe(422);
    expect((await db.query("select * from hamper_assets where id=$1", [invalid.assetId])).rows).toHaveLength(0);
  });
  it("duplicates item IDs independently and deletion cascades", async () => { const a = await pack(true); const id = await duplicateHamper("user_alice", a.id), b = await ownerDto(await ownedHamper("user_alice", id)); expect(b.items[0].id).not.toBe(a.hamper.items[0].id); expect(b.status).toBe("draft"); expect(b.links[0].slug).not.toBe(a.slug); await db.query("delete from digital_hampers where id=$1", [id]); expect((await db.query("select * from hamper_items where hamper_id=$1", [id])).rows).toHaveLength(0); expect((await publicContent(a.slug)).items).toHaveLength(1); });
  it("dedupes events and rejects foreign item events", async () => { const p = await pack(true); const row = await activeLink(p.slug); await writeEvent(row, "hamper_viewed", "session"); await writeEvent(row, "hamper_viewed", "session"); expect((await db.query("select * from hamper_events where hamper_id=$1", [p.id])).rows).toHaveLength(1); const response = await eventPost(new Request("http://local", { method: "POST", body: JSON.stringify({ event: "item_opened", itemId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }) }), { params: { slug: p.slug } }); expect(response.status).toBe(400); });
  it("prevents stale edits and item rows moving between hampers", async () => { const a = await pack(), b = await pack(); await expect(saveHamper("user_alice", a.id, plainContent(), { updatedAt: "stale" })).rejects.toThrow("another tab"); await expect(saveHamper("user_alice", b.id, { ...plainContent(), items: a.hamper.items }, { updatedAt: b.hamper.updatedAt })).rejects.toThrow("another hamper"); });
  it("keeps two birthday projects separate and requires legacy write tokens", async () => {
    const base = { ...createEmptyProject(), id: "site-one", person: { fullName: "Ananya" }, publishing: { slug: "ananya-one", status: "published" as const, visibility: "link" as const } };
    await db.query("insert into birthday_projects(id,slug,project,write_token,status,visibility) values($1,$2,$3,'legacy-secret','published','link')", [base.id, base.publishing.slug, JSON.stringify(base)]);
    const legacy = base as Parameters<typeof saveWebsite>[1];
    await expect(saveWebsite("user_alice", legacy, "wrong")).rejects.toThrow("another creator"); await saveWebsite("user_alice", legacy, "legacy-secret");
    await saveWebsite("user_alice", { ...legacy, id: "site-two", person: { fullName: "Vaibhav" }, publishing: { ...legacy.publishing, slug: "vaibhav-two" } });
    expect((await db.query("select * from birthday_projects where owner_id='user_alice'")).rows).toHaveLength(2);
    expect((await publishedProjectBySlug("ananya-one"))?.person.fullName).toBe("Ananya");
    expect((await publishedProjectBySlug("vaibhav-two"))?.person.fullName).toBe("Vaibhav");
    await expect(saveWebsite("user_bob", legacy, "legacy-secret")).rejects.toThrow("another creator");
  });
});
