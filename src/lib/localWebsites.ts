import type { BirthdayProject } from "./types";
const key = (owner: string) => `ode/websites/v3/${owner}`;
const activeKey = (owner: string) => `ode/active-website/v3/${owner}`;
function read<T>(name: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(name) || "null") ?? fallback; } catch { return fallback; } }
/** Keep legacy drafts intact, assigning their local cache to the first account
 * that resumes them. Cloud ownership still requires proof at the server. */
export function localWebsites(owner: string): Record<string, BirthdayProject> {
  const owners = read<Record<string, string>>("ode/draft-owners/v1", {});
  const result = read<Record<string, BirthdayProject>>(key(owner), {});
  const legacy = read<BirthdayProject | null>("birthday-world/project/v1", null);
  const candidates = { ...read<Record<string, BirthdayProject>>("ode/websites/v2", {}), ...(owner !== "device" ? read<Record<string, BirthdayProject>>(key("device"), {}) : {}), ...(legacy?.id ? { [legacy.id]: legacy } : {}) };
  for (const project of Object.values(candidates)) {
    if (!project?.id || !project.person || !project.publishing) continue;
    if (!owners[project.id] || owners[project.id] === owner || owners[project.id] === "device" && owner !== "device") {
      if (!result[project.id] || result[project.id].updatedAt < project.updatedAt) result[project.id] = project;
      owners[project.id] = owner;
    }
  }
  for (const id of Object.keys(result)) if (owners[id] && owners[id] !== owner) delete result[id];
  localStorage.setItem("ode/draft-owners/v1", JSON.stringify(owners));
  localStorage.setItem(key(owner), JSON.stringify(result));
  return result;
}
export function saveLocalWebsite(owner: string, project: BirthdayProject) {
  const projects = localWebsites(owner); projects[project.id] = project;
  const owners = read<Record<string, string>>("ode/draft-owners/v1", {}); owners[project.id] = owner;
  localStorage.setItem("ode/draft-owners/v1", JSON.stringify(owners));
  localStorage.setItem(key(owner), JSON.stringify(projects)); localStorage.setItem(activeKey(owner), project.id);
}
export function activeLocalWebsite(owner: string) {
  const projects = localWebsites(owner), active = localStorage.getItem(activeKey(owner));
  return active && projects[active] || Object.values(projects).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] || null;
}
export function removeLocalWebsite(owner: string, id: string) {
  const projects = localWebsites(owner); delete projects[id]; localStorage.setItem(key(owner), JSON.stringify(projects));
  // A tombstone prevents the preserved legacy cache from resurrecting it.
  const owners = read<Record<string, string>>("ode/draft-owners/v1", {}); owners[id] = "deleted"; localStorage.setItem("ode/draft-owners/v1", JSON.stringify(owners));
}
