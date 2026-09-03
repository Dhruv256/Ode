export const dynamic = "force-dynamic";
import { requestError } from "@/lib/serverAuth";
import { activeLink, assertUnlocked } from "@/features/hamper/server/public";
import { itemAsset } from "@/features/hamper/server/repository";
import { clientHash, rateLimit } from "@/features/hamper/server/security";
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const row = await activeLink(params.slug); assertUnlocked(row);
    await rateLimit(`assets:${row.id}:${clientHash(request)}`, 120, 60);
    return Response.json({ url: await itemAsset(row.id, new URL(request.url).searchParams.get("item") || "") }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return requestError(error); }
}

