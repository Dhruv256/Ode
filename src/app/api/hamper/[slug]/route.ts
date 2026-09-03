import { requestError } from "@/lib/serverAuth";
import { publicContent } from "@/features/hamper/server/public";
import { eventSession } from "@/features/hamper/server/security";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try { const content = await publicContent(params.slug); eventSession(); return Response.json(content, { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" } }); } catch (error) { return requestError(error); }
}
