import "server-only";
import { database } from "@/lib/database";
import { RequestError } from "@/lib/serverAuth";
export const BUCKET = "ode-hamper-assets";
function storageConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  const placeholder = /your[_ -]|placeholder|paste[_ -]|example/i;
  if (!url || !key || placeholder.test(url) || placeholder.test(key)) {
    console.error("Hamper upload configuration missing", { urlConfigured: Boolean(url && !placeholder.test(url)), serverKeyConfigured: Boolean(key && !placeholder.test(key)) });
    throw new RequestError("Photo and voice uploads aren't configured yet. Your other keepsakes can still be saved.", 503);
  }
  return { url, key };
}
export const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");
export async function storageRequest(path: string, init: RequestInit = {}) {
  const { url, key } = storageConfig();
  let response: Response;
  try { response = await fetch(`${url}/storage/v1/${path}`, { ...init, cache: "no-store", headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", ...init.headers } }); }
  catch {
    console.error("Hamper storage connection failed");
    throw new RequestError("The upload service couldn't be reached. Please try again; your other keepsakes are safe.", 502);
  }
  if (!response.ok) {
    console.error("Hamper storage request rejected", { status: response.status });
    throw new RequestError("The keepsake could not be stored. Please try again.", 502);
  }
  return response;
}
export async function signAsset(path: string) {
  const response = await storageRequest(`object/sign/${BUCKET}/${encodePath(path)}`, { method: "POST", body: JSON.stringify({ expiresIn: 900 }) });
  const result = await response.json() as { signedURL?: string };
  return signedUrl(result.signedURL);
}
export async function signUpload(path: string) {
  const response = await storageRequest(`object/upload/sign/${BUCKET}/${encodePath(path)}`, { method: "POST", body: JSON.stringify({ upsert: false }) });
  const result = await response.json() as { url?: string };
  return signedUrl(result.url);
}
function signedUrl(path: string | undefined) {
  if (!path) throw new RequestError("The upload service returned an incomplete link. Please try again.", 502);
  const base = storageConfig().url;
  const url = new URL(path.startsWith("http") ? path : `${base}/storage/v1${path.startsWith("/") ? "" : "/"}${path}`);
  if (url.origin !== new URL(base).origin) throw new RequestError("The upload service returned an invalid link. Please try again.", 502);
  return url.href;
}
export async function inspectAsset(path: string) {
  const response = await storageRequest(`object/info/${BUCKET}/${encodePath(path)}`);
  const result = await response.json() as { metadata?: { size?: number; mimetype?: string }; size?: number; content_type?: string; contentType?: string };
  return { size: Number(result.metadata?.size ?? result.size), mime: String(result.content_type ?? result.metadata?.mimetype ?? result.contentType ?? "") };
}
export async function copyAsset(from: string, to: string) {
  await storageRequest("object/copy", { method: "POST", body: JSON.stringify({ bucketId: BUCKET, sourceKey: from, destinationKey: to }) });
}
export async function cleanupStorage() {
  const sql = database();
  // Pending signed uploads live at most two hours; leave a full day before
  // collecting them so an outstanding upload cannot recreate an orphan.
  await sql`delete from hamper_assets a where created_at<now()-interval '1 day' and
    (state='pending' or not exists(select 1 from hamper_items i where i.hamper_id=a.hamper_id and i.payload->>'assetId'=a.id::text))`;
  await sql`delete from hamper_access_attempts where expires_at<now()-interval '1 day'`;
  const rows = await sql<{ path: string }[]>`select path from hamper_storage_cleanup where run_after<=now() order by created_at limit 100`;
  if (!rows.length) return;
  await storageRequest(`object/${BUCKET}`, { method: "DELETE", body: JSON.stringify({ prefixes: rows.map(r => r.path) }) });
  await sql`delete from hamper_storage_cleanup where path in ${sql(rows.map(r => r.path))}`;
}
