import { readFile } from "node:fs/promises";

const legacyTables = ["digital_hampers", "hamper_items", "hamper_share_links", "hamper_events", "hamper_access_attempts"];
const archive = "ode_legacy_hamper_v1";
const required = {
  birthday_projects: ["id", "owner_id", "slug", "project", "write_token", "status", "visibility", "created_at", "updated_at"],
  digital_hampers: ["id", "owner_id", "recipient", "sender", "message", "theme", "opening_style", "status", "pin_hash", "access_version", "created_at", "updated_at"],
  hamper_items: ["id", "hamper_id", "type", "position", "payload", "asset_bytes"],
  hamper_assets: ["id", "hamper_id", "owner_id", "item_id", "path", "kind", "mime", "asset_bytes", "state", "created_at"],
  hamper_share_links: ["id", "hamper_id", "slug", "is_primary", "revoked_at", "created_at"],
  hamper_events: ["id", "hamper_id", "link_id", "item_id", "event_type", "session_hash", "dedupe_key", "created_at"],
  hamper_access_attempts: ["key", "attempts", "expires_at"],
  hamper_storage_cleanup: ["path", "created_at", "run_after"],
};

/** query(text, parameters) returns rows; exec(text) executes migration SQL. */
export async function inspectStudioSchema(db) {
  const rows = await db.query("select table_name,column_name from information_schema.columns where table_schema='public'");
  const columns = new Map();
  for (const row of rows) {
    if (!columns.has(row.table_name)) columns.set(row.table_name, new Set());
    columns.get(row.table_name).add(row.column_name);
  }
  const missing = Object.entries(required).flatMap(([table, names]) => names.filter(name => !columns.get(table)?.has(name)).map(name => `${table}.${name}`));
  const legacy = columns.get("digital_hampers")?.has("recipient_name") && !columns.get("digital_hampers")?.has("recipient");
  const counts = {};
  if (legacy) for (const table of legacyTables) {
    if (!columns.has(table)) throw new Error(`Incomplete legacy schema: ${table} is missing. No changes were made.`);
    counts[table] = Number((await db.query(`select count(*)::int as count from public.${table}`))[0].count);
  }
  return { ready: missing.length === 0, missing, legacy: Boolean(legacy), counts, tables: [...columns.keys()] };
}

async function migration(db, name) {
  const source = await readFile(new URL(`../../database/migrations/${name}`, import.meta.url), "utf8");
  // Both migrations are executed inside the caller's single transaction.
  await db.exec(source.replace(/^\s*(?:begin|commit);\s*$/gmi, ""));
}

/** Caller MUST hold one database transaction until this function completes. */
export async function repairStudioSchema(db) {
  await db.query("select pg_advisory_xact_lock(hashtextextended('ode:studio-schema-repair',0))");
  await db.exec("set local lock_timeout='10s'");
  let state = await inspectStudioSchema(db);
  if (state.ready) return { changed: false, archived: false };
  if (!state.tables.includes("birthday_projects")) throw new Error("Apply migration 001 first. No changes were made.");
  await db.exec("lock table public.birthday_projects in share row exclusive mode");
  const websiteFingerprint = "select count(*)::int as count,md5(coalesce(string_agg(row(slug,project,write_token,visibility,status,created_at,updated_at)::text,'|' order by slug),'')) as fingerprint from public.birthday_projects";
  const beforeWebsites = (await db.query(websiteFingerprint))[0];
  const partial = state.tables.some(table => table.startsWith("hamper_") || table === "digital_hampers");
  if (state.legacy) {
    if (state.tables.includes("hamper_assets") || state.tables.includes("hamper_storage_cleanup")) throw new Error("Mixed legacy/current hamper schema. No changes were made.");
    // Lock before checking emptiness, so a concurrent create cannot be moved.
    await db.exec(`lock table ${legacyTables.map(table => `public.${table}`).join(",")} in access exclusive mode`);
    state = await inspectStudioSchema(db);
    if (Object.values(state.counts).some(count => count !== 0)) throw new Error("Legacy hamper records exist. This repair only accepts empty legacy tables; no data was changed.");
    if ((await db.query("select schema_name from information_schema.schemata where schema_name=$1", [archive])).length) throw new Error("The legacy archive already exists. No changes were made.");
    await db.exec(`create schema ${archive}; revoke all on schema ${archive} from public,anon,authenticated;`);
    for (const table of legacyTables) await db.exec(`alter table public.${table} set schema ${archive}`);
    await db.exec(`revoke all on all tables in schema ${archive} from public,anon,authenticated; revoke all on all sequences in schema ${archive} from public,anon,authenticated;`);
  } else if (partial && state.missing.some(name => !name.startsWith("birthday_projects."))) {
    throw new Error("Unrecognized partial hamper schema. No changes were made.");
  }
  await migration(db, "003_studio_ownership.sql");
  if (state.legacy || !partial) await migration(db, "004_digital_hampers.sql");
  const after = await inspectStudioSchema(db);
  if (!after.ready) throw new Error(`Repair verification failed: ${after.missing.join(", ")}`);
  const afterWebsites = (await db.query(websiteFingerprint))[0];
  if (beforeWebsites.count !== afterWebsites.count || beforeWebsites.fingerprint !== afterWebsites.fingerprint) throw new Error("Birthday content preservation check failed; rolling back the repair.");
  return { changed: true, archived: state.legacy, websitesPreserved: afterWebsites.count };
}
