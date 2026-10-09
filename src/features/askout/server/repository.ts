import "server-only";
import { randomUUID } from "node:crypto";
import type postgres from "postgres";
import { database } from "@/lib/database";
import { RequestError } from "@/lib/serverAuth";
import type { AskOut, AskOutContent, AskOutResponseKind, AskOutTheme } from "../types";
import { EMPTY_ASK_OUT } from "../types";
import { validateAskOut, validateAskOutSlug } from "../validation";

type Sql = postgres.Sql | postgres.TransactionSql;
export type AskOutRow = {
  id: string; user_id: string; slug: string; recipient_name: string; recipient_tag: string; creator_name: string;
  opening_message: string; theme: AskOutTheme; selected_interests: AskOutContent["interests"]; date: string | Date | null;
  weekday: string; pickup_time: string | Date | null; end_time: string | Date | null; pickup_location: string; destination: string;
  map_data: { address?: string }; activity: string; additional_details: Partial<AskOutContent>; configuration: Partial<AskOutContent>;
  status: "draft" | "published"; created_at: Date; updated_at: Date;
};

const cleanTime = (value: string | Date | null) => value instanceof Date ? value.toISOString().slice(11, 16) : typeof value === "string" ? value.slice(0, 5) : "";
const cleanDate = (value: string | Date | null) => value instanceof Date ? value.toISOString().slice(0, 10) : value || "";
export function contentFor(row: AskOutRow): AskOutContent {
  const extra = row.additional_details || {}, configuration = row.configuration || {};
  return {
    ...EMPTY_ASK_OUT, ...extra, ...configuration,
    recipientName: row.recipient_name, recipientTag: row.recipient_tag, creatorName: row.creator_name,
    openingMessage: row.opening_message, theme: row.theme, interests: row.selected_interests || [], date: cleanDate(row.date),
    weekday: row.weekday, pickupTime: cleanTime(row.pickup_time), endTime: cleanTime(row.end_time),
    pickupLocation: row.pickup_location, destination: row.destination, mapAddress: row.map_data?.address || "", activity: row.activity,
  };
}

export async function ownedAskOut(owner: string, id: string, sql: Sql = database(), lock = false) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new RequestError("Ask Out not found.", 404);
  const [row] = await sql<AskOutRow[]>`select * from ask_outs where id=${id} and user_id=${owner} ${lock ? sql`for update` : sql``}`;
  if (!row) throw new RequestError("Ask Out not found.", 404);
  return row;
}

async function responseSummary(id: string, sql: Sql = database()) {
  const rows = await sql<{ response: AskOutResponseKind; count: number }[]>`select response,count(*)::int count from ask_out_responses where ask_out_id=${id} group by response`;
  const responses = { viewed: 0, started: 0, tell_more: 0, accepted: 0, declined: 0 };
  rows.forEach(row => { responses[row.response] = Number(row.count); });
  const [latest] = await sql<{ response: AskOutResponseKind; selected_day_option: string | null; selected_activity: string | null; responded_at: Date }[]>`
    select response,selected_day_option,selected_activity,responded_at from ask_out_responses where ask_out_id=${id} order by responded_at desc limit 1`;
  return { responses, latestResponse: latest ? { response: latest.response, selectedDayOption: latest.selected_day_option || undefined, selectedActivity: latest.selected_activity || undefined, respondedAt: latest.responded_at.toISOString() } : undefined };
}

export async function ownerDto(row: AskOutRow): Promise<AskOut> {
  return { ...contentFor(row), id: row.id, slug: row.slug, status: row.status, createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(), ...await responseSummary(row.id) };
}

function storedContent(content: AskOutContent) {
  return {
    mapData: { address: content.mapAddress },
    extra: {
      customInterest: content.customInterest, meetingPoint: content.meetingPoint, dressCodeJoke: content.dressCodeJoke,
      specialNote: content.specialNote, reservationInfo: content.reservationInfo, additionalDetails: content.additionalDetails,
      extraCuteLine: content.extraCuteLine, recurringJoke: content.recurringJoke, finalInvitationLine: content.finalInvitationLine,
      acceptedMessage: content.acceptedMessage, declineMessage: content.declineMessage,
    },
    configuration: {
      miniGames: content.miniGames, dayQuestion: content.dayQuestion, dayOptions: content.dayOptions,
      timeQuestion: content.timeQuestion, playfulJourney: content.playfulJourney, playfulIntensity: content.playfulIntensity,
    },
  };
}

export async function createAskOut(owner: string, value: unknown, options: { publish?: boolean; slug?: string } = {}) {
  const content = validateAskOut(value, options.publish);
  const slug = options.slug ? validateAskOutSlug(options.slug) : `secret-${randomUUID().slice(0, 8)}`;
  const sql = database(), stored = storedContent(content);
  const [row] = await sql<AskOutRow[]>`insert into ask_outs(
      user_id,slug,recipient_name,recipient_tag,creator_name,opening_message,theme,selected_interests,date,weekday,
      pickup_time,end_time,pickup_location,destination,map_data,activity,additional_details,configuration,status
    ) values (
      ${owner},${slug},${content.recipientName},${content.recipientTag},${content.creatorName},${content.openingMessage},${content.theme},${sql.json(content.interests)},${content.date || null},${content.weekday},
      ${content.pickupTime || null},${content.endTime || null},${content.pickupLocation},${content.destination},${sql.json(stored.mapData)},${content.activity},${sql.json(stored.extra)},${sql.json(stored.configuration)},${options.publish ? "published" : "draft"}
    ) returning *`;
  return ownerDto(row);
}

export async function saveAskOut(owner: string, id: string, value: unknown, options: { publish?: boolean; slug?: string; updatedAt?: string }) {
  const content = validateAskOut(value, options.publish);
  const requestedSlug = options.slug === undefined ? undefined : validateAskOutSlug(options.slug);
  const sql = database();
  await sql.begin(async tx => {
    const row = await ownedAskOut(owner, id, tx, true);
    if (!options.updatedAt || row.updated_at.toISOString() !== options.updatedAt) throw new RequestError("This Ask Out changed in another tab. Reload before saving.", 409);
    if (row.status === "published") validateAskOut(content, true);
    const stored = storedContent(content);
    await tx`update ask_outs set slug=${requestedSlug || row.slug},recipient_name=${content.recipientName},recipient_tag=${content.recipientTag},creator_name=${content.creatorName},
      opening_message=${content.openingMessage},theme=${content.theme},selected_interests=${tx.json(content.interests)},date=${content.date || null},weekday=${content.weekday},
      pickup_time=${content.pickupTime || null},end_time=${content.endTime || null},pickup_location=${content.pickupLocation},destination=${content.destination},
      map_data=${tx.json(stored.mapData)},activity=${content.activity},additional_details=${tx.json(stored.extra)},configuration=${tx.json(stored.configuration)},
      status=${options.publish ? "published" : row.status},updated_at=now() where id=${id} and user_id=${owner}`;
  });
  return ownerDto(await ownedAskOut(owner, id));
}

export async function publicAskOut(slug: string) {
  const clean = validateAskOutSlug(slug);
  const [row] = await database()<AskOutRow[]>`select * from ask_outs where slug=${clean} and status='published'`;
  if (!row) throw new RequestError("This Ask Out is not available.", 404);
  return { ...contentFor(row), id: row.id, slug: row.slug };
}

export async function recordResponse(slug: string, response: AskOutResponseKind, session: string, selectedDayOption?: string, selectedActivity?: string) {
  const allowed: AskOutResponseKind[] = ["viewed", "started", "tell_more", "accepted", "declined"];
  if (!allowed.includes(response)) throw new RequestError("That response is invalid.");
  const askOut = await publicAskOut(slug);
  await database()`insert into ask_out_responses(ask_out_id,response,selected_day_option,selected_activity,session_hash)
    values(${askOut.id},${response},${selectedDayOption?.slice(0, 100) || null},${selectedActivity?.slice(0, 160) || null},${session}) on conflict(ask_out_id,response,session_hash) do nothing`;
  return { ok: true };
}
