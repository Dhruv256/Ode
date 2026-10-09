export const dynamic = "force-dynamic";
import { database } from "@/lib/database";
import { requireOwner, readJson, requestError } from "@/lib/serverAuth";
import { ownedAskOut, ownerDto, saveAskOut } from "@/features/askout/server/repository";
type Context = { params: { id: string } };
export async function GET(_request: Request, { params }: Context) {
  try { return Response.json(await ownerDto(await ownedAskOut(await requireOwner(), params.id))); } catch (error) { return requestError(error); }
}
export async function PUT(request: Request, { params }: Context) {
  try {
    const body = await readJson(request) as { content?: unknown; publish?: boolean; slug?: string; updatedAt?: string };
    return Response.json(await saveAskOut(await requireOwner(), params.id, body.content, body));
  } catch (error) { return requestError(error); }
}
export async function DELETE(_request: Request, { params }: Context) {
  try { const owner = await requireOwner(); await ownedAskOut(owner, params.id); await database()`delete from ask_outs where id=${params.id} and user_id=${owner}`; return Response.json({ ok: true }); }
  catch (error) { return requestError(error); }
}
