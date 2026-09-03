import "server-only";
import { database } from "@/lib/database";
import { RequestError } from "@/lib/serverAuth";
import type { EventType } from "../types";
import { validateSlug } from "../validation";
import { canAccess, digest } from "./security";
import { contentFor, type HamperRow, itemsFor } from "./repository";
export async function activeLink(slug: string) {
  validateSlug(slug);
  const [row] = await database()<(HamperRow & { link_id: string })[]>`
    select h.*,l.id as link_id from digital_hampers h join hamper_share_links l on l.hamper_id=h.id
    where l.slug=${slug} and l.revoked_at is null and h.status='published'`;
  if (!row) throw new RequestError("This hamper isn't available at this link.", 404);
  return row;
}
export function assertUnlocked(row: HamperRow & { link_id: string }) {
  if (row.pin_hash && !canAccess(row.link_id, row.access_version)) throw new RequestError("Enter the PIN to open this hamper.", 401);
}
export async function publicContent(slug: string) {
  const row = await activeLink(slug);
  assertUnlocked(row);
  // Explicit allowlist: no owner ID, hash, storage path, event hashes or links.
  return contentFor(row, await itemsFor(row.id));
}
export const EVENT_TYPES: EventType[] = ["hamper_viewed", "pin_unlocked", "box_first_shake", "box_second_shake", "box_opened", "item_opened", "external_link_clicked"];
export async function writeEvent(row: HamperRow & { link_id: string }, event: EventType, session: string, itemId?: string) {
  const sql = database();
  if (event === "item_opened" || event === "external_link_clicked") {
    const [item] = await sql<{ type: string }[]>`select type from hamper_items where id::text=${itemId ?? ""} and hamper_id=${row.id}`;
    if (!item || event === "external_link_clicked" && !["song", "video", "gift", "location", "coupon", "news"].includes(item.type)) throw new RequestError("That item is not in this hamper.");
  } else if (itemId) throw new RequestError("This event does not use an item.");
  const sessionHash = digest(`${row.id}:${session}:${Math.floor(Date.now() / 1800000)}`);
  const key = digest(`${row.id}:${sessionHash}:${event}:${itemId ?? ""}`);
  await sql`insert into hamper_events(hamper_id,link_id,item_id,event_type,session_hash,dedupe_key)
    values(${row.id},${row.link_id},${itemId ?? null},${event},${sessionHash},${key}) on conflict(dedupe_key) do nothing`;
}
