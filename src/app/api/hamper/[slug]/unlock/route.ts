export const dynamic = "force-dynamic";
import { readJson, requestError, RequestError } from "@/lib/serverAuth";
import { activeLink, writeEvent } from "@/features/hamper/server/public";
import { clientHash, eventSession, grantAccess, rateLimit, verifyPin } from "@/features/hamper/server/security";
import { database } from "@/lib/database";
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const row = await activeLink(params.slug);
    const { pin } = await readJson(request, 1024) as { pin?: string };
    const client = clientHash(request);
    await rateLimit(`pin:${row.id}:${client}`, 5, 900);
    if (row.pin_hash && (typeof pin !== "string" || !(await verifyPin(pin, row.pin_hash)))) throw new RequestError("That PIN didn't match. Try again.", 401);
    grantAccess(row.link_id, row.access_version);
    await database()`delete from hamper_access_attempts where key=${`pin:${row.id}:${client}`}`;
    await writeEvent(row, "pin_unlocked", eventSession());
    return Response.json({ ok: true });
  } catch (error) { return requestError(error); }
}

