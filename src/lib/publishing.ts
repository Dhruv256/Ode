import type { BirthdayProject } from "./types";

export function slugifyProject(project: BirthdayProject): string {
  const name = (project.person.nickname || project.person.fullName || "birthday-world").trim().toLowerCase();
  const clean = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${clean || "birthday-world"}${project.age ? `-${project.age}` : ""}`.slice(0, 48);
}

export function validSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length >= 3 && value.length <= 48;
}

export function shareUrl(slug: string): string {
  if (typeof window === "undefined") return `/${slug}`;
  return `${window.location.origin}/${slug}`;
}
