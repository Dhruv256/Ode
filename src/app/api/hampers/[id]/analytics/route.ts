export const dynamic = "force-dynamic";
import { requireOwner, requestError } from "@/lib/serverAuth";
import { analyticsFor, ownedHamper } from "@/features/hamper/server/repository";
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try { await ownedHamper(await requireOwner(), params.id); return Response.json(await analyticsFor(params.id)); } catch (error) { return requestError(error); }
}

