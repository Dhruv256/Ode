export const dynamic = "force-dynamic";
import { publicAskOut } from "@/features/askout/server/repository";
import { requestError } from "@/lib/serverAuth";
export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try { return Response.json(await publicAskOut(params.slug)); } catch (error) { return requestError(error); }
}
