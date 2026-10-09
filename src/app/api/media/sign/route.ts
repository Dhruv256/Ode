import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { readJson, requireOwner, requestError } from "@/lib/serverAuth";
import { validateBirthdayUpload } from '@/lib/birthdayMedia';

export const runtime = "nodejs";

const BUCKET = "birthday-media";
const MAX_FILENAME_LENGTH = 120;

function storageConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  // Supabase renamed these keys in 2025. Supporting both makes existing and
  // newly created projects work without exposing either key to the browser.
  const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

function safeFileName(value: string) {
  const name = value.split(/[\\/]/).pop() || "memory";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_FILENAME_LENGTH) || "memory";
}

function encodedPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export async function POST(request: Request) {
  const config = storageConfig();
  if (!config) {
    return NextResponse.json(
      {
        code: "STORAGE_NOT_CONFIGURED",
        error: "Supabase Storage is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel.",
      },
      { status: 503 }
    );
  }

  try {
    const owner = await requireOwner();
    const { projectId, assetId, fileName } = validateBirthdayUpload(await readJson(request, 4096));

    const path = `worlds/${owner}/${safeFileName(projectId)}/${safeFileName(assetId)}-${randomUUID()}-${safeFileName(fileName)}`;
    const response = await fetch(
      `${config.url}/storage/v1/object/upload/sign/${BUCKET}/${encodedPath(path)}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.serviceKey}`,
          apikey: config.serviceKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({ upsert: false }),
      }
    );
    const result = await response.json().catch(() => ({})) as { url?: string; error?: string; message?: string };
    if (!response.ok || !result.url) {
      console.error("Unable to create signed media upload", {status:response.status});
      return NextResponse.json({ error: "Unable to prepare the media upload. Please try again." }, { status: 502 });
    }

    const uploadUrl = result.url.startsWith("http")
      ? result.url
      : `${config.url}/storage/v1${result.url.startsWith("/") ? "" : "/"}${result.url}`;
    if (new URL(uploadUrl).origin !== new URL(config.url).origin) return NextResponse.json({error:'The upload service returned an invalid link.'},{status:502});
    const publicUrl = `${config.url}/storage/v1/object/public/${BUCKET}/${encodedPath(path)}`;
    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (error) {
    return requestError(error);
  }
}
