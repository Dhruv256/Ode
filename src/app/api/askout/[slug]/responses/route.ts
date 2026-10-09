export const dynamic = "force-dynamic";
import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { readJson, requestError } from "@/lib/serverAuth";
import { recordResponse } from "@/features/askout/server/repository";
import type { AskOutResponseKind } from "@/features/askout/types";
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await readJson(request, 16 * 1024) as { response?: AskOutResponseKind; selectedDayOption?: string; selectedActivity?: string };
    const jar = cookies(); let token = jar.get("ode_askout_session")?.value;
    if (!token) { token = randomUUID(); jar.set("ode_askout_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 90, path: "/" }); }
    const session = createHash("sha256").update(`${params.slug}:${token}`).digest("hex");
    return Response.json(await recordResponse(params.slug, body.response as AskOutResponseKind, session, body.selectedDayOption, body.selectedActivity));
  } catch (error) { return requestError(error); }
}
