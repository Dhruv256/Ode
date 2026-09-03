import "server-only";
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { database } from "@/lib/database";
import { RequestError } from "@/lib/serverAuth";
const scrypt = promisify(scryptCallback);
function secret() {
  const key = process.env.HAMPER_ACCESS_SECRET;
  if (!key || key.length < 32) throw new RequestError("Hamper privacy is not configured yet.", 503);
  return key;
}
export function digest(value: string) { return createHmac("sha256", secret()).update(value).digest("hex"); }
export function ensureAccessConfigured() { secret(); }
export async function hashPin(pin: string) {
  if (!/^\d{4,6}$/.test(pin)) throw new RequestError("Choose a PIN with 4–6 digits.");
  const salt = randomBytes(16).toString("hex"), hash = await scrypt(pin, salt, 64) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}
export async function verifyPin(pin: string, stored: string) {
  if (!/^\d{4,6}$/.test(pin)) return false;
  const [salt, hash] = stored.split(":");
  const derived = await scrypt(pin, salt, 64) as Buffer, expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
export function accessToken(linkId: string, version: string, expires: number) { return `${expires}.${digest(`${linkId}:${version}:${expires}`)}`; }
export function validAccessToken(token: string | undefined, linkId: string, version: string) {
  if (!token) return false;
  const [exp] = token.split("."), expiry = Number(exp);
  if (!Number.isFinite(expiry) || expiry < Date.now() || expiry > Date.now() + 24 * 60 * 60 * 1000 + 1000) return false;
  const expected = Buffer.from(accessToken(linkId, version, expiry)), actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export function canAccess(linkId: string, version: string) { return validAccessToken(cookies().get(`ode-hamper-${linkId}`)?.value, linkId, version); }
export function grantAccess(linkId: string, version: string) {
  cookies().set(`ode-hamper-${linkId}`, accessToken(linkId, version, Date.now() + 24 * 60 * 60 * 1000), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 86400 });
}
export function eventSession() {
  const raw = cookies().get("ode-hamper-session")?.value;
  if (raw) {
    const [id, signature] = raw.split(".");
    if (/^[a-f0-9]{32}$/.test(id) && signature === digest(`session:${id}`)) return id;
  }
  const id = randomBytes(16).toString("hex");
  cookies().set("ode-hamper-session", `${id}.${digest(`session:${id}`)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 1800 });
  return id;
}
/** Platform-controlled IP headers only; raw IPs never enter the database. */
export function clientHash(request: Request) {
  const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : "local-development";
  return digest(ip || "unknown");
}
export async function rateLimit(key: string, limit: number, seconds: number) {
  const rows = await database()<{ attempts: number }[]>`
    insert into hamper_access_attempts(key,attempts,expires_at) values(${key},1,now()+${seconds}*interval '1 second')
    on conflict(key) do update set attempts=case when hamper_access_attempts.expires_at<now() then 1 else hamper_access_attempts.attempts+1 end,
      expires_at=case when hamper_access_attempts.expires_at<now() then excluded.expires_at else hamper_access_attempts.expires_at end
    returning attempts`;
  if (rows[0].attempts > limit) throw new RequestError("A few too many tries. Please come back in a little while.", 429);
}
