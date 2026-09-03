export const dynamic = "force-dynamic";
import { randomUUID } from "node:crypto";
import { database } from "@/lib/database";
import { requireOwner, readBytes, readJson, requestError, RequestError } from "@/lib/serverAuth";
import { ownedHamper, itemAsset } from "@/features/hamper/server/repository";
import { BUCKET, cleanupStorage, encodePath, inspectAsset, signAsset, signUpload, storageRequest } from "@/features/hamper/server/storage";
import { HAMPER_LIMITS } from "@/features/hamper/config";
import { validateFile } from "@/features/hamper/validation";
type Context = { params: { id: string } };
export async function GET(request: Request, { params }: Context) {
  try {
    await ownedHamper(await requireOwner(), params.id);
    return Response.json({ url: await itemAsset(params.id, new URL(request.url).searchParams.get("item") || "") });
  } catch (error) { return requestError(error); }
}
export async function POST(request: Request, { params }: Context) {
  try {
    const owner = await requireOwner();
    await ownedHamper(owner, params.id);
    const mime = (request.headers.get("content-type") || "").split(";")[0];
    if (mime.startsWith("audio/")) {
      const itemId = request.headers.get("x-ode-item-id") || "";
      if (!/^[0-9a-f-]{36}$/i.test(itemId)) throw new RequestError("Choose a voice keepsake.");
      // Audio fits below Vercel's request limit. Receiving it here enforces the
      // stricter 2 MB cap before any bytes enter the 5 MB storage bucket.
      const bytes = await readBytes(request, HAMPER_LIMITS.maxAudioBytes);
      validateFile("voice", bytes.length, mime);
      const assetId = randomUUID(), path = `${owner}/${params.id}/${itemId}/${assetId}`;
      const sql = database();
      await sql`insert into hamper_assets(id,hamper_id,owner_id,item_id,path,kind,mime,asset_bytes) values(${assetId},${params.id},${owner},${itemId},${path},'voice',${mime},${bytes.length})`;
      try {
        await storageRequest(`object/${BUCKET}/${encodePath(path)}`, { method: "POST", headers: { "content-type": mime, "x-upsert": "false" }, body: Uint8Array.from(bytes) });
        await sql`update hamper_assets set state='ready' where id=${assetId} and owner_id=${owner}`;
        return Response.json({ assetId, assetBytes: bytes.length, url: await signAsset(path) });
      } catch (error) { await sql`delete from hamper_assets where id=${assetId} and owner_id=${owner}`; await cleanupStorage().catch(() => undefined); throw error; }
    }
    const body = await readJson(request) as { kind?: string; itemId?: string; size?: number; mime?: string };
    if ((body.kind !== "photo" && body.kind !== "voice") || !body.itemId || !/^[0-9a-f-]{36}$/i.test(body.itemId)) throw new RequestError("Choose a photo or voice keepsake.");
    validateFile(body.kind, Number(body.size), String(body.mime));
    if (body.kind === "voice") throw new RequestError("Upload the voice file directly so its size can be checked.");
    const id = randomUUID(), path = `${owner}/${params.id}/${body.itemId}/${id}`;
    // Reserve the maximum supported size, not client-declared bytes. Finalize
    // uses Supabase's actual size. Concurrent uploads cannot exceed the cap.
    const reserved = HAMPER_LIMITS.maxImageBytes;
    const sql = database();
    await sql`insert into hamper_assets(id,hamper_id,owner_id,item_id,path,kind,mime,asset_bytes) values(${id},${params.id},${owner},${body.itemId},${path},${body.kind},${String(body.mime).split(";")[0]},${reserved})`;
    try { return Response.json({ assetId: id, uploadUrl: await signUpload(path) }); }
    catch (error) { await sql`delete from hamper_assets where id=${id}`; throw error; }
  } catch (error) { return requestError(error); }
}
export async function PUT(request: Request, { params }: Context) {
  try {
    const owner = await requireOwner();
    await ownedHamper(owner, params.id);
    const { assetId } = await readJson(request) as { assetId?: string };
    const sql = database();
    const [asset] = await sql<{ path: string; kind: "photo" | "voice"; mime: string }[]>`select path,kind,mime from hamper_assets where id::text=${assetId ?? ""} and hamper_id=${params.id} and owner_id=${owner}`;
    if (!asset) throw new RequestError("Upload not found.", 404);
    try {
      const actual = await inspectAsset(asset.path);
      validateFile(asset.kind, actual.size, actual.mime);
      if (actual.mime.split(";")[0] !== asset.mime) throw new RequestError("The uploaded file type changed. Please upload again.");
      await sql`update hamper_assets set asset_bytes=${actual.size},state='ready' where id::text=${assetId ?? ""} and owner_id=${owner}`;
      return Response.json({ assetId, assetBytes: actual.size, url: await signAsset(asset.path) });
    } catch (error) {
      await sql`delete from hamper_assets where id::text=${assetId ?? ""} and owner_id=${owner}`;
      await cleanupStorage().catch(() => undefined);
      throw error;
    }
  } catch (error) { return requestError(error); }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    const owner = await requireOwner();
    await ownedHamper(owner, params.id);
    const assetId = new URL(request.url).searchParams.get("asset") || "";
    await database()`delete from hamper_assets a where a.id::text=${assetId} and a.owner_id=${owner} and a.hamper_id=${params.id} and not exists(select 1 from hamper_items i where i.hamper_id=a.hamper_id and i.payload->>'assetId'=a.id::text)`;
    await cleanupStorage().catch(() => undefined);
    return Response.json({ ok: true });
  } catch (error) { return requestError(error); }
}

