export const dynamic = "force-dynamic";
import { randomUUID } from "node:crypto";
import { database } from "@/lib/database";
import { requireOwner, RequestError, requestError } from "@/lib/serverAuth";
import type { BirthdayProject } from "@/lib/types";
import { saveWebsite } from "@/lib/websiteProjects";

type Context = { params: { id: string } };
async function owned(id: string) {
  const owner = await requireOwner();
  const [row] = await database()<{ project: BirthdayProject; id: string }[]>`select id,project from birthday_projects where id=${id} and owner_id=${owner}`;
  if (!row) throw new RequestError("Website not found.", 404);
  return { owner, project: { ...row.project, id: row.id } };
}
export async function GET(_request: Request, { params }: Context) {
  try { return Response.json({ project: (await owned(params.id)).project }); } catch (error) { return requestError(error); }
}
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { owner } = await owned(params.id);
    await database()`delete from birthday_projects where id=${params.id} and owner_id=${owner}`;
    // Birthday uploads predate ownership tracking and may be reused by legacy
    // copies. Keep those shared media objects; deleting them would break sites.
    return Response.json({ ok: true });
  } catch (error) { return requestError(error); }
}
export async function POST(_request: Request, { params }: Context) {
  try {
    const { owner, project } = await owned(params.id);
    const copy = { ...project, id: randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), publishing: { status: "draft" as const, visibility: "link" as const } };
    return Response.json(await saveWebsite(owner, copy));
  } catch (error) { return requestError(error); }
}

