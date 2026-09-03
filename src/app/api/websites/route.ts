export const dynamic = "force-dynamic";
import { requireOwner, readJson, requestError } from "@/lib/serverAuth";
import { saveWebsite, validateWebsite, websitesForOwner } from "@/lib/websiteProjects";

export async function GET() {
  try { return Response.json({ websites: await websitesForOwner(await requireOwner()) }); }
  catch (error) { return requestError(error); }
}
export async function POST(request: Request) {
  try {
    const owner = await requireOwner();
    const body = await readJson(request, 2 * 1024 * 1024) as { project?: unknown; token?: string };
    return Response.json(await saveWebsite(owner, validateWebsite(body.project), body.token));
  } catch (error) { return requestError(error); }
}

