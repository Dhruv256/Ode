export const dynamic = "force-dynamic";
import { database } from "@/lib/database";
import { requireOwner, requestError } from "@/lib/serverAuth";
import { createHamper, ownerDto, type HamperRow } from "@/features/hamper/server/repository";
export async function GET() {
  try {
    const owner = await requireOwner();
    const rows = await database()<HamperRow[]>`select * from digital_hampers where owner_id=${owner} order by updated_at desc`;
    return Response.json({ hampers: await Promise.all(rows.map(row => ownerDto(row, false))) });
  } catch (error) { return requestError(error); }
}
export async function POST() {
  try { return Response.json({ id: await createHamper(await requireOwner()) }); }
  catch (error) { return requestError(error); }
}

