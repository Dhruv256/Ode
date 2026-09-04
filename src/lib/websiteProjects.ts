import "server-only";
import { randomUUID } from "node:crypto";
import { database } from "./database";
import { RequestError } from "./serverAuth";
import { validSlug } from "./publishing";
import type { BirthdayProject } from "./types";
import { BIRTHDAY_PHOTO_LIMIT, CUSTOM_MEMORY_LIMIT, resolvePhotoMode, validatePhotoUsage } from "./birthdayCapabilities";

export function validateWebsite(value: unknown): BirthdayProject {
  const p = value as BirthdayProject | undefined;
  if (!p || typeof p.id !== "string" || p.id.length > 100 || !p.person || typeof p.person.fullName !== "string" ||
    !p.publishing || !["draft", "published", "archived"].includes(p.publishing.status) ||
    !["private", "link", "public"].includes(p.publishing.visibility) || !Array.isArray(p.photos) ||
    !Array.isArray(p.memories) || !Array.isArray(p.interests) || !p.vibes) throw new RequestError("This website draft is incomplete.");
  if (p.photos.length > BIRTHDAY_PHOTO_LIMIT) throw new RequestError(`Birthday websites can hold up to ${BIRTHDAY_PHOTO_LIMIT} photos.`);
  if (p.photoMode && !["auto", "standard", "high-photo"].includes(p.photoMode)) throw new RequestError("Choose a valid photo mode.");
  if ((p.customMemories?.length ?? 0) > CUSTOM_MEMORY_LIMIT) throw new RequestError(`Add up to ${CUSTOM_MEMORY_LIMIT} custom memories.`);
  for (const memory of p.customMemories ?? []) {
    if (!memory || typeof memory.id !== "string" || typeof memory.label !== "string" || typeof memory.value !== "string" ||
      memory.label.length > 80 || memory.value.length > 600 || (memory.icon?.length ?? 0) > 12 ||
      !["subtle", "normal", "prominent"].includes(memory.prominence)) throw new RequestError("A custom memory is invalid.");
  }
  if (resolvePhotoMode(p) === "high-photo") {
    const usage = validatePhotoUsage(p.photos, p.photos.map((photo) => photo.id));
    if (!usage.valid) throw new RequestError("Every photo must be assigned in 50+ photo mode.");
  }
  return p;
}

export async function websitesForOwner(owner: string) {
  return database()<{ id: string; project: BirthdayProject; created_at: string; updated_at: string }[]>`
    select id, project, created_at, updated_at from birthday_projects where owner_id = ${owner} order by updated_at desc`;
}

export async function saveWebsite(owner: string, project: BirthdayProject, token?: string) {
  const sql = database();
  return sql.begin(async tx => {
    await tx`select pg_advisory_xact_lock(hashtextextended(${owner}, 0))`;
    // Preserve the row's slug on normal draft autosaves. Legacy claims require
    // its secret write token, never merely a matching browser project ID.
    const existing = await tx<{ id: string; slug: string; owner_id: string | null; write_token: string }[]>`
      select id, slug, owner_id, write_token from birthday_projects
      where id = ${project.id} or (${project.publishing.slug ?? ""} <> '' and slug = ${project.publishing.slug ?? ""}) for update`;
    const row = existing.find(x => x.id === project.id) ?? existing[0];
    if (row && row.owner_id !== owner && !(row.owner_id === null && token && row.write_token === token)) throw new RequestError("This website belongs to another creator.", 403);
    if (row?.owner_id === owner && row.id !== project.id) throw new RequestError("Choose a different link for this separate website.", 409);
    const slug = project.publishing.slug || row?.slug || `draft-${randomUUID()}`;
    if (!validSlug(slug) || ["dashboard", "create", "hamper", "api", "sign-in", "sign-up"].includes(slug)) throw new RequestError("Choose a valid website link.");
    const id = row?.id ?? project.id;
    const safeProject = JSON.parse(JSON.stringify({ ...project, id, publishing: { ...project.publishing, publishToken: undefined, slug } }));
    if (row) {
      await tx`update birthday_projects set owner_id=${owner}, slug=${slug}, project=${tx.json(safeProject)}, status=${project.publishing.status}, visibility=${project.publishing.visibility}, updated_at=now() where id=${id}`;
    } else {
      await tx`insert into birthday_projects(id,owner_id,slug,project,write_token,status,visibility) values(${id},${owner},${slug},${tx.json(safeProject)},${randomUUID()},${project.publishing.status},${project.publishing.visibility})`;
    }
    return { id, slug };
  });
}
