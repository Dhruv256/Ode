import env from "@next/env";
import postgres from "postgres";
import { randomUUID } from "node:crypto";
import { inspectStudioSchema, repairStudioSchema } from "./lib/studio-schema.mjs";

env.loadEnvConfig(process.cwd());
const mode = process.argv[2] ?? "--check";
if (!["--check", "--apply", "--verify"].includes(mode)) throw new Error("Use --check, --apply or --verify.");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1, prepare: false, connect_timeout: 10, onnotice: () => {} });
const adapter = client => ({ query: (text, values = []) => client.unsafe(text, values), exec: text => client.unsafe(text).simple() });

try {
  if (mode === "--apply") console.log(JSON.stringify(await sql.begin(tx => repairStudioSchema(adapter(tx)))));
  const state = await inspectStudioSchema(adapter(sql));
  console.log(JSON.stringify({ ready: state.ready, missing: state.missing, legacy: state.legacy, counts: state.counts }, null, 2));
  if (!state.ready) process.exitCode = 1;
  else if (mode === "--verify") {
    const rollback = new Error("Roll back the schema verification fixtures");
    try {
      await sql.begin(async tx => {
        const owner = `ode-schema-check-${randomUUID()}`;
        await tx`select id,project,created_at,updated_at from birthday_projects where owner_id=${owner}`;
        const [hamper] = await tx`insert into digital_hampers(owner_id) values(${owner}) returning id,recipient,sender,message,access_version`;
        const [link] = await tx`insert into hamper_share_links(hamper_id,slug,is_primary) values(${hamper.id},${`check-${randomUUID().slice(0, 8)}`},true) returning id`;
        const item = randomUUID();
        await tx`insert into hamper_items(id,hamper_id,type,position,payload) values(${item},${hamper.id},'note',0,'{"body":"Temporary verification"}')`;
        await tx`update digital_hampers set recipient='Schema check',sender='Ode',message='',theme='soft-parcel',opening_style='scene',updated_at=now() where id=${hamper.id}`;
        await tx`insert into hamper_events(hamper_id,link_id,item_id,event_type,session_hash,dedupe_key) values(${hamper.id},${link.id},${item},'item_opened',${owner},${owner})`;
        await tx`insert into hamper_access_attempts(key,attempts,expires_at) values(${owner},1,now()+interval '15 minutes') on conflict(key) do update set attempts=hamper_access_attempts.attempts+1`;
        await tx`insert into hamper_assets(hamper_id,owner_id,item_id,path,kind,mime,asset_bytes) values(${hamper.id},${owner},${randomUUID()},${owner},'photo','image/webp',1024)`;
        await tx`update hamper_share_links set revoked_at=now(),is_primary=false where id=${link.id}`;
        throw rollback;
      });
    } catch (error) { if (error !== rollback) throw error; }
    console.log("PASS: website listing, draft creation, share links, items, save, events, rate limits and asset reservations. All verification records were rolled back.");
  }
} catch (error) {
  // Never log connection strings, SQL parameters, or failing-row contents.
  console.error(JSON.stringify({ message: error.message, code: error.code, table: error.table_name, column: error.column_name, constraint: error.constraint_name }));
  process.exitCode = 1;
} finally { await sql.end(); }
