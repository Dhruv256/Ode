export const dynamic = "force-dynamic";
import { readJson, requestError, RequestError } from "@/lib/serverAuth";
import { activeLink, assertUnlocked, EVENT_TYPES, writeEvent } from "@/features/hamper/server/public";
import { clientHash, eventSession, rateLimit } from "@/features/hamper/server/security";
import type { EventType } from "@/features/hamper/types";
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const row = await activeLink(params.slug); assertUnlocked(row);
    const body = await readJson(request, 1024) as { event?: EventType; itemId?: string };
    if (!body.event || !EVENT_TYPES.includes(body.event) || body.event === "pin_unlocked" || Object.keys(body).some(k => !["event", "itemId"].includes(k))) throw new RequestError("Unknown event.");
    if (body.itemId !== undefined && (typeof body.itemId !== "string" || body.itemId.length > 36)) throw new RequestError("Invalid item.");
    const client = clientHash(request);
    await rateLimit(`events:${row.id}:${client}`, 100, 60);
    await writeEvent(row, body.event, eventSession(), body.itemId);
    return Response.json({ ok: true });
  } catch (error) { return requestError(error); }
}

