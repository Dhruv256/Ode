import "server-only";
import { randomUUID } from "node:crypto";
import type postgres from "postgres";
import { database } from "@/lib/database";
import { RequestError } from "@/lib/serverAuth";
import { HAMPER_LIMITS } from "../config";
import type { Analytics, Hamper, HamperContent, HamperItem, HamperTheme, OpeningStyle, ShareLink } from "../types";
import { validateContent, validateSlug } from "../validation";
import { copyAsset, cleanupStorage, signAsset } from "./storage";
import { ensureAccessConfigured, hashPin } from "./security";

export type HamperRow = { id: string; owner_id: string; recipient: string; sender: string; message: string; theme: HamperTheme; opening_style: OpeningStyle; status: "draft" | "published"; pin_hash: string | null; access_version: string; created_at: Date; updated_at: Date };
type Sql = postgres.Sql | postgres.TransactionSql;
export async function ownedHamper(owner: string, id: string, sql: Sql = database(), lock = false) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new RequestError("Hamper not found.", 404);
  const [row] = await sql<HamperRow[]>`select * from digital_hampers where id=${id} and owner_id=${owner} ${lock ? sql`for update` : sql``}`;
  if (!row) throw new RequestError("Hamper not found.", 404);
  return row;
}
export async function itemsFor(id: string, sql: Sql = database()): Promise<HamperItem[]> {
  const rows = await sql<{ id: string; type: HamperItem["type"]; position: number; payload: HamperItem["payload"]; asset_bytes: number }[]>`select id,type,position,payload,asset_bytes from hamper_items where hamper_id=${id} order by position`;
  return rows.map(r => ({ id: r.id, type: r.type, position: r.position, payload: r.payload, assetBytes: Number(r.asset_bytes) }) as HamperItem);
}
export function contentFor(row: HamperRow, items: HamperItem[]): HamperContent { return { recipient: row.recipient, sender: row.sender, message: row.message, theme: row.theme, openingStyle: row.opening_style, items }; }
export async function ownerDto(row: HamperRow, withItems = true): Promise<Hamper> {
  const sql = database();
  const [items, links, counts] = await Promise.all([
    withItems ? itemsFor(row.id) : Promise.resolve([]),
    sql<ShareLink[]>`select id,slug,is_primary,revoked_at,created_at from hamper_share_links where hamper_id=${row.id} order by created_at`,
    sql<{ views: number; opened: number }[]>`select count(*) filter(where event_type='hamper_viewed')::int as views,count(*) filter(where event_type='box_opened')::int as opened from hamper_events where hamper_id=${row.id}`,
  ]);
  return { ...contentFor(row, items), id: row.id, status: row.status, createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(), hasPin: Boolean(row.pin_hash), links, views: counts[0].views, opened: counts[0].opened };
}
export async function createHamper(owner: string) {
  const sql = database();
  return sql.begin(async tx => {
    await tx`select pg_advisory_xact_lock(hashtextextended(${owner},0))`;
    const [{ count }] = await tx<{ count: number }[]>`select count(*)::int count from digital_hampers where owner_id=${owner}`;
    if (count >= HAMPER_LIMITS.maxActiveHampersPerUser) throw new RequestError("Your studio can hold up to 10 hampers. Delete an old one to make room.", 422);
    const [row] = await tx<HamperRow[]>`insert into digital_hampers(owner_id) values(${owner}) returning *`;
    await tx`insert into hamper_share_links(hamper_id,slug,is_primary) values(${row.id},${`for-you-${randomUUID().slice(0, 8)}`},true)`;
    return row.id;
  });
}

export async function saveHamper(owner: string, id: string, value: unknown, options: { publish?: boolean; slug?: string; updatedAt?: string; pin?: string | null }) {
  if (options.publish) ensureAccessConfigured();
  const content = validateContent(value, options.publish);
  const pinHash = typeof options.pin === "string" ? await hashPin(options.pin) : options.pin;
  const slug = options.slug === undefined ? undefined : validateSlug(options.slug);
  const sql = database();
  await sql.begin(async tx => {
    await tx`select pg_advisory_xact_lock(hashtextextended(${owner},0))`;
    const row = await ownedHamper(owner, id, tx, true);
    if (!options.updatedAt || row.updated_at.toISOString() !== options.updatedAt) throw new RequestError("This hamper changed in another tab. Reload before saving.", 409);
    // Validate live edits with the same rules as publishing.
    if (row.status === "published") validateContent(content, true);
    const existing = await itemsFor(id, tx);
    for (const item of content.items) {
      if (item.type === "photo" || item.type === "voice") {
        const [asset] = await tx<{ asset_bytes: number }[]>`select asset_bytes from hamper_assets where id::text=${item.payload.assetId} and hamper_id=${id} and item_id=${item.id} and owner_id=${owner} and kind=${item.type} and state='ready'`;
        if (!asset) throw new RequestError("Finish uploading each photo and voice message before saving.", 422);
        item.assetBytes = Number(asset.asset_bytes);
      }
    }
    const ids = content.items.map(i => i.id);
    if (ids.length) await tx`delete from hamper_items where hamper_id=${id} and id not in ${tx(ids)}`;
    else await tx`delete from hamper_items where hamper_id=${id}`;
    for (const item of content.items) {
      // Global item IDs cannot be moved from another hamper by an upsert.
      const result = await tx`insert into hamper_items(id,hamper_id,type,position,payload,asset_bytes)
        values(${item.id},${id},${item.type},${item.position},${tx.json(JSON.parse(JSON.stringify(item.payload)))},${item.assetBytes})
        on conflict(id) do update set type=excluded.type,position=excluded.position,payload=excluded.payload,asset_bytes=excluded.asset_bytes where hamper_items.hamper_id=${id} returning id`;
      if (!result.length) throw new RequestError("This item belongs to another hamper.", 403);
    }
    // Remove only assets previously attached to saved items, never an upload
    // being prepared in another editor. The queue handles storage after commit.
    for (const old of existing) {
      if (old.type === "photo" || old.type === "voice") {
        const assetId = old.payload.assetId;
        if (!content.items.some(i => (i.type === "photo" || i.type === "voice") && i.payload.assetId === assetId)) await tx`delete from hamper_assets where id::text=${assetId} and hamper_id=${id}`;
      }
    }
    const [primary] = await tx<ShareLink[]>`select id,slug,is_primary,revoked_at,created_at from hamper_share_links where hamper_id=${id} and is_primary and revoked_at is null`;
    if (slug && primary && slug !== primary.slug) {
      if (row.status === "published") throw new RequestError("Use Manage links to change a published link.");
      await tx`update hamper_share_links set slug=${slug} where id=${primary.id}`;
    }
    if (options.publish && !primary) throw new RequestError("Create an active share link before publishing.");
    await tx`update digital_hampers set recipient=${content.recipient},sender=${content.sender},message=${content.message},theme=${content.theme},opening_style=${content.openingStyle},
      status=${options.publish ? "published" : row.status}, pin_hash=${pinHash === undefined ? row.pin_hash : pinHash},
      access_version=${pinHash === undefined ? row.access_version : randomUUID()},updated_at=now() where id=${id} and owner_id=${owner}`;
  });
  await cleanupStorage().catch(() => undefined);
  return ownerDto(await ownedHamper(owner, id));
}
export async function itemAsset(id: string, itemId: string) {
  const [row] = await database()<{ path: string }[]>`select a.path from hamper_assets a join hamper_items i on i.id=a.item_id and i.hamper_id=a.hamper_id and i.payload->>'assetId'=a.id::text where a.hamper_id=${id} and i.id::text=${itemId} and a.state='ready'`;
  if (!row) throw new RequestError("This keepsake could not be found.", 404);
  return signAsset(row.path);
}
export async function duplicateHamper(owner: string, sourceId: string) {
  const source = await ownedHamper(owner, sourceId), originalItems = await itemsFor(sourceId);
  const id = await createHamper(owner);
  try {
    const items: HamperItem[] = [];
    for (const original of originalItems) {
      const item = { ...original, id: randomUUID(), payload: { ...original.payload } } as HamperItem;
      if (item.type === "photo" || item.type === "voice") {
        const [asset] = await database()<{ path: string; mime: string; asset_bytes: number }[]>`select path,mime,asset_bytes from hamper_assets where id::text=${item.payload.assetId} and hamper_id=${sourceId} and owner_id=${owner} and state='ready'`;
        if (!asset) throw new RequestError("One of the original keepsakes is missing.");
        const assetId = randomUUID(), path = `${owner}/${id}/${item.id}/${assetId}`;
        await database()`insert into hamper_assets(id,owner_id,hamper_id,item_id,path,kind,mime,asset_bytes) values(${assetId},${owner},${id},${item.id},${path},${item.type},${asset.mime},${asset.asset_bytes})`;
        await copyAsset(asset.path, path);
        await database()`update hamper_assets set state='ready' where id=${assetId}`;
        item.payload.assetId = assetId;
      }
      items.push(item);
    }
    const target = await ownedHamper(owner, id);
    await saveHamper(owner, id, contentFor(source, items), { updatedAt: target.updated_at.toISOString() });
    return id;
  } catch (error) {
    await database()`delete from digital_hampers where id=${id} and owner_id=${owner}`;
    await cleanupStorage().catch(() => undefined);
    throw error;
  }
}
export async function analyticsFor(id: string): Promise<Analytics> {
  const sql = database();
  const [counts, items, recent] = await Promise.all([
    sql<{ views: number; opened: number; clicks: number }[]>`select count(*) filter(where event_type='hamper_viewed')::int views,count(*) filter(where event_type='box_opened')::int opened,count(*) filter(where event_type='external_link_clicked')::int clicks from hamper_events where hamper_id=${id}`,
    sql<{ item_id: string; count: number }[]>`select item_id,count(*)::int count from hamper_events where hamper_id=${id} and event_type='item_opened' group by item_id order by count desc limit 10`,
    sql<Analytics["recent"]>`select event_type,created_at from hamper_events where hamper_id=${id} order by created_at desc limit 15`,
  ]);
  return { ...counts[0], items, recent };
}
