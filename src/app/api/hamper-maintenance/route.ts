export const dynamic = "force-dynamic";
import { timingSafeEqual } from "node:crypto";
import { cleanupStorage } from "@/features/hamper/server/storage";
import { requestError } from "@/lib/serverAuth";
export async function GET(request: Request) {
  const expected = Buffer.from(`Bearer ${process.env.CRON_SECRET || ""}`), received = Buffer.from(request.headers.get("authorization") || "");
  if (!process.env.CRON_SECRET || received.length !== expected.length || !timingSafeEqual(expected, received)) return new Response("Unauthorized", { status: 401 });
  try { await cleanupStorage(); return Response.json({ ok: true }); } catch (error) { return requestError(error); }
}

