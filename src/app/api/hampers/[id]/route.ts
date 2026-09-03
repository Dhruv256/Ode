export const dynamic = "force-dynamic";
import { database } from "@/lib/database";
import { requireOwner, readJson, requestError, RequestError } from "@/lib/serverAuth";
import { duplicateHamper, ownedHamper, ownerDto, saveHamper } from "@/features/hamper/server/repository";
import { cleanupStorage } from "@/features/hamper/server/storage";
type Context = { params: { id: string } };
export async function GET(_request: Request, { params }: Context) {
  try { return Response.json(await ownerDto(await ownedHamper(await requireOwner(), params.id))); } catch (error) { return requestError(error); }
}
export async function PUT(request: Request, { params }: Context) {
  try {
    const owner = await requireOwner();
    const body = await readJson(request, 2 * 1024 * 1024) as { content?: unknown; publish?: boolean; slug?: string; updatedAt?: string; pin?: string | null };
    if (body.pin !== undefined && body.pin !== null && typeof body.pin !== "string") throw new RequestError("Choose a valid PIN.");
    return Response.json(await saveHamper(owner, params.id, body.content, { ...body, publish: body.publish === true }));
  } catch (error) { return requestError(error); }
}
export async function POST(_request: Request, { params }: Context) {
  try { return Response.json({ id: await duplicateHamper(await requireOwner(), params.id) }); } catch (error) { return requestError(error); }
}
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const owner = await requireOwner();
    await ownedHamper(owner, params.id);
    await database()`delete from digital_hampers where id=${params.id} and owner_id=${owner}`;
    await cleanupStorage().catch(() => undefined);
    return Response.json({ ok: true });
  } catch (error) { return requestError(error); }
}

