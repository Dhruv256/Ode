export const dynamic = "force-dynamic";
import { database } from "@/lib/database";
import { requireOwner, readJson, requestError, RequestError } from "@/lib/serverAuth";
import { ownedHamper, ownerDto } from "@/features/hamper/server/repository";
import { validateSlug } from "@/features/hamper/validation";
type Context = { params: { id: string } };
export async function POST(request: Request, { params }: Context) {
  try {
    const owner = await requireOwner();
    const body = await readJson(request) as { action?: string; slug?: string; linkId?: string };
    const sql = database();
    await sql.begin(async tx => {
      await ownedHamper(owner, params.id, tx, true);
      if (body.action === "create" || body.action === "replace") {
        const slug = validateSlug(body.slug);
        if (body.action === "replace") await tx`update hamper_share_links set revoked_at=now(),is_primary=false where hamper_id=${params.id} and revoked_at is null`;
        else await tx`update hamper_share_links set is_primary=false where hamper_id=${params.id}`;
        await tx`insert into hamper_share_links(hamper_id,slug,is_primary) values(${params.id},${slug},true)`;
      } else if (body.action === "revoke") {
        const result = await tx`update hamper_share_links set revoked_at=now(),is_primary=false where id::text=${body.linkId ?? ""} and hamper_id=${params.id} returning id`;
        if (!result.length) throw new RequestError("Link not found.", 404);
        await tx`update hamper_share_links set is_primary=true where id=(select id from hamper_share_links where hamper_id=${params.id} and revoked_at is null and not exists(select 1 from hamper_share_links where hamper_id=${params.id} and is_primary and revoked_at is null) order by created_at desc limit 1)`;
      } else if (body.action === "primary") {
        const [link] = await tx`select id from hamper_share_links where id::text=${body.linkId ?? ""} and hamper_id=${params.id} and revoked_at is null`;
        if (!link) throw new RequestError("Link not found.", 404);
        await tx`update hamper_share_links set is_primary=false where hamper_id=${params.id}`;
        await tx`update hamper_share_links set is_primary=true where id=${link.id}`;
      } else throw new RequestError("Choose a link action.");
      await tx`update digital_hampers set updated_at=now() where id=${params.id}`;
    });
    return Response.json(await ownerDto(await ownedHamper(owner, params.id)));
  } catch (error) { return requestError(error); }
}

