export const dynamic = "force-dynamic";
import { database } from "@/lib/database";
import { readJson, requireOwner, requestError } from "@/lib/serverAuth";
import { createAskOut, ownerDto, type AskOutRow } from "@/features/askout/server/repository";
export async function GET() {
  try {
    const owner = await requireOwner();
    const rows = await database()<AskOutRow[]>`select * from ask_outs where user_id=${owner} order by updated_at desc`;
    return Response.json({ askOuts: await Promise.all(rows.map(ownerDto)) });
  } catch (error) { return requestError(error); }
}
export async function POST(request: Request) {
  try {
    const owner = await requireOwner();
    const body = await readJson(request) as { content?: unknown; publish?: boolean; slug?: string };
    return Response.json(await createAskOut(owner, body.content, body), { status: 201 });
  }
  catch (error) { return requestError(error); }
}
