import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { loadEnvConfig } from "@next/env";
import postgres from "postgres";
import { randomUUID } from "node:crypto";
import { fixtureItem } from "../fixtures";
import type { HamperItem, ItemType } from "../../src/features/hamper/types";

const state = vi.hoisted(() => ({ database: null as unknown }));
vi.mock("@/lib/database", () => ({ database: () => state.database }));
// A save normally attempts global background cleanup. Never touch unrelated
// files while exercising a rolled-back integration transaction.
vi.mock("@/features/hamper/server/storage", async importOriginal => ({ ...await importOriginal<object>(), cleanupStorage: async () => undefined }));
import { createHamper, ownedHamper, ownerDto, saveHamper } from "../../src/features/hamper/server/repository";

let sql: postgres.Sql;
beforeAll(() => {
  vi.stubEnv("NODE_ENV", "development");
  loadEnvConfig(process.cwd(), true);
  if (!process.env.DATABASE_URL) throw new Error("A configured test database is required.");
  sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1, prepare: false, connect_timeout: 10 });
});
afterAll(async () => { await sql?.end(); });

it("persists, reloads, edits and removes all ten item types through the real repository and connected PostgreSQL", async () => {
  const rollback = new Error("Rollback the complete live test");
  const owner = `ode-live-check-${randomUUID()}`;
  try {
    await sql.begin(async tx => {
      state.database = new Proxy(tx, { get(target, key) { return key === "begin" ? (run: (connection: postgres.TransactionSql) => Promise<unknown>) => tx.savepoint(run) : Reflect.get(target, key); } });
      const id = await createHamper(owner);
      let saved = await ownerDto(await ownedHamper(owner, id));
      const items: HamperItem[] = [];
      for (const type of ["note", "photo", "song", "video", "voice", "drawing", "gift", "location", "coupon", "news"] as ItemType[]) {
        const item = { ...fixtureItem(type, items.length), id: randomUUID() };
        if (item.type === "photo" || item.type === "voice") {
          item.payload.assetId = randomUUID();
          await tx`insert into hamper_assets(id,hamper_id,owner_id,item_id,path,kind,mime,asset_bytes,state) values(${item.payload.assetId},${id},${owner},${item.id},${`${owner}/${id}/${item.id}/${item.payload.assetId}`},${type},${type === "photo" ? "image/png" : "audio/wav"},1024,'ready')`;
        }
        items.push(item);
        saved = await saveHamper(owner, id, { ...saved, items }, { updatedAt: saved.updatedAt });
        const loaded = await ownerDto(await ownedHamper(owner, id));
        expect(loaded.items.map(value => value.type)).toEqual(items.map(value => value.type));
        expect(loaded.items.at(-1)?.payload).toEqual(saved.items.at(-1)?.payload);
        console.log(`PASS: ${type} persisted and reloaded`);
      }
      const edited = saved.items.map(item => {
        const field = item.type === "note" ? "body" : item.type === "location" ? "place" : item.type === "gift" ? "note" : item.type === "news" ? "headline" : ["photo", "video", "drawing"].includes(item.type) ? "caption" : "title";
        return { ...item, payload: { ...item.payload, [field]: "Edited during verification" } };
      });
      saved = await saveHamper(owner, id, { ...saved, items: edited }, { updatedAt: saved.updatedAt });
      expect(saved.items).toHaveLength(10);
      saved = await saveHamper(owner, id, { ...saved, items: [] }, { updatedAt: saved.updatedAt });
      expect(saved.items).toHaveLength(0);
      throw rollback;
    });
  } catch (error) { if (error !== rollback) throw error; }
  expect((await sql`select id from digital_hampers where owner_id=${owner}`).length).toBe(0);
});
