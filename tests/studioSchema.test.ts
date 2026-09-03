import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PGlite, type Transaction } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { inspectStudioSchema, repairStudioSchema } from "../scripts/lib/studio-schema.mjs";

let db: PGlite;
const adapter = (connection: PGlite | Transaction) => ({
  query: async (text: string, values: unknown[] = []) => (await connection.query(text, values)).rows,
  exec: (text: string) => connection.exec(text),
});
const repair = () => db.transaction(tx => repairStudioSchema(adapter(tx)));
const migration = (name: string) => readFileSync(`database/migrations/${name}`, "utf8");

beforeEach(async () => {
  db = new PGlite();
  await db.exec("create role anon; create role authenticated; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid primary key,bucket_id text);");
  await db.exec(migration("001_published_birthday_projects.sql"));
  await db.exec(`insert into birthday_projects(slug,project,write_token,visibility,status) values('old-birthday','{"id":"legacy-project","person":{"fullName":"Example"}}','original-write-token','link','published')`);
});
afterEach(() => db.close());

// The legacy column names, enum types, defaults, indexes, identity sequences
// and foreign keys match the incompatible empty schema found on the server.
async function legacy() {
  await db.exec(`
    create type hamper_status as enum('draft','published');
    create type hamper_opening_style as enum('burst','scene');
    create table digital_hampers(id uuid primary key default gen_random_uuid(),owner_id text not null,recipient_name text not null check(length(recipient_name)>0),sender_name text not null,opening_message text,status hamper_status not null default 'draft',opening_style hamper_opening_style not null default 'burst');
    create index digital_hampers_owner_idx on digital_hampers(owner_id);
    create table hamper_items(id uuid primary key default gen_random_uuid(),hamper_id uuid not null references digital_hampers on delete cascade,item_type text not null,payload jsonb not null default '{}');
    create table hamper_share_links(id uuid primary key default gen_random_uuid(),hamper_id uuid not null references digital_hampers on delete cascade,slug text not null,is_active boolean not null default true);
    create table hamper_events(id bigint generated always as identity primary key,hamper_id uuid not null references digital_hampers on delete cascade,share_link_id uuid references hamper_share_links,occurred_at timestamptz default now());
    create table hamper_access_attempts(id bigint generated always as identity primary key,hamper_id uuid not null references digital_hampers on delete cascade,client_key text not null);
  `);
}

describe("studio schema repair", () => {
  it("reproduces both reported failures and repairs the empty legacy schema without changing websites", async () => {
    await legacy();
    await expect(db.query("select id from birthday_projects where owner_id='someone'")).rejects.toMatchObject({ code: "42703" });
    await expect(db.query("insert into digital_hampers(owner_id) values('someone')")).rejects.toMatchObject({ code: "23502", column: "recipient_name" });
    const before = (await db.query("select slug,project,write_token,visibility,status,created_at,updated_at from birthday_projects")).rows;
    expect(await repair()).toEqual({ changed: true, archived: true, websitesPreserved: 1 });
    expect((await inspectStudioSchema(adapter(db))).ready).toBe(true);
    expect((await db.query("select slug,project,write_token,visibility,status,created_at,updated_at from birthday_projects")).rows).toEqual(before);
    expect((await db.query("select id,owner_id from birthday_projects")).rows).toEqual([{ id: "legacy-project", owner_id: null }]);
    const [{ id }] = (await db.query<{ id: string }>("insert into digital_hampers(owner_id) values('someone') returning id")).rows;
    await db.query("insert into hamper_share_links(hamper_id,slug,is_primary) values($1,'new-hamper',true)", [id]);
    await db.query("insert into hamper_items(id,hamper_id,type,position,payload) values(gen_random_uuid(),$1,'note',0,'{\"body\":\"Hello\"}')", [id]);
    await db.query("insert into hamper_access_attempts(key,attempts,expires_at) values('check',1,now())");
    expect((await db.query("select count(*)::int count from ode_legacy_hamper_v1.digital_hampers")).rows).toEqual([{ count: 0 }]);
    expect((await db.query("select to_regclass('ode_legacy_hamper_v1.hamper_events_id_seq') is not null as archived")).rows).toEqual([{ archived: true }]);
    expect((await db.query("select has_schema_privilege('anon','ode_legacy_hamper_v1','USAGE') as access")).rows).toEqual([{ access: false }]);
    expect(await repair()).toEqual({ changed: false, archived: false });
  });
  it("refuses to archive any populated legacy schema and rolls back everything", async () => {
    await legacy();
    await db.query("insert into digital_hampers(owner_id,recipient_name,sender_name) values('someone','Keep me','Sender')");
    await expect(repair()).rejects.toThrow("Legacy hamper records exist");
    expect((await db.query("select recipient_name from digital_hampers")).rows).toEqual([{ recipient_name: "Keep me" }]);
    expect((await inspectStudioSchema(adapter(db))).legacy).toBe(true);
    expect((await db.query("select to_regnamespace('ode_legacy_hamper_v1') as archive")).rows).toEqual([{ archive: null }]);
  });
  it("applies missing migrations to an original birthday-only database", async () => {
    expect(await repair()).toEqual({ changed: true, archived: false, websitesPreserved: 1 });
    expect((await inspectStudioSchema(adapter(db))).ready).toBe(true);
  });
  it("adds birthday ownership when the current hamper schema already exists", async () => {
    await db.exec(migration("004_digital_hampers.sql"));
    expect(await repair()).toEqual({ changed: true, archived: false, websitesPreserved: 1 });
    expect((await inspectStudioSchema(adapter(db))).ready).toBe(true);
  });
  it("leaves a fully migrated database untouched and rejects a partial schema", async () => {
    await db.exec(migration("003_studio_ownership.sql"));
    await db.exec("create table digital_hampers(id uuid primary key)");
    await expect(repair()).rejects.toThrow("Unrecognized partial hamper schema");
    expect((await db.query("select count(*)::int count from birthday_projects")).rows).toEqual([{ count: 1 }]);
  });
  it("restores the original tables if a later migration fails after archiving", async () => {
    await legacy();
    await db.exec("create policy hamper_bucket_server_only on storage.objects for all to anon using(false)");
    await expect(repair()).rejects.toThrow("already exists");
    const state = await inspectStudioSchema(adapter(db));
    expect(state.legacy).toBe(true);
    expect(state.missing).toContain("birthday_projects.owner_id");
    expect((await db.query("select to_regnamespace('ode_legacy_hamper_v1') as archive")).rows).toEqual([{ archive: null }]);
  });
});
