import type { PhotoAsset, TemplateId } from "@/lib/types";
import type { PhotoRole, RoleAssignment } from "./types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PHOTO ROLES — deterministic collage logic.
 * Layouts are art-directed, never random. Each photo gets one visual role so
 * a template can place "a hero portrait", "a full bleed", "a film strip"
 * without coupling to specific files. Roles adapt to photo count.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { min, max, floor } = Math;

function pick(list: PhotoAsset[], order: number, offset = 0): PhotoAsset | undefined {
  return list[offset + (order % list.length)];
}

/**
 * Assign every photo a role. `hero` and `finale` take priority; the rest fan
 * out into grid/strip/floating/paired roles based on how many photos exist.
 */
export function assignRoles(
  photos: PhotoAsset[],
  flex: {
    dense: boolean; // archive/contact style — many small frames
    strips: boolean; // supports film-strip + full-bleed interruptions
  } = { dense: false, strips: true }
): RoleAssignment[] {
  const n = photos.length;
  if (n === 0) return [];
  const heroIndex = Math.max(
    0,
    photos.findIndex((p) => p.isHero || p.heroEligible === false) === -1
      ? 0
      : photos.findIndex((p) => p.isHero)
  );
  const hero = photos[heroIndex];
  const finale = pick(photos, 1, n - 2); // a late, non-hero photo
  const roles: RoleAssignment[] = [];

  photos.forEach((photo, i) => {
    if (photo.id === hero.id) {
      roles.push({ photo, role: "hero" });
      return;
    }
    if (finale && photo.id === finale.id) {
      roles.push({ photo, role: "finale" });
      return;
    }
    // role fan-out
    const remaining = n - roles.filter((r) => r.role === "hero" || r.role === "finale").length;
    let role: PhotoRole;
    if (n === 1) role = "hero";
    else if (n <= 4) {
      // offset pairings: hero handled; the rest are large paired/strip
      role = i % 2 === 0 ? "strip" : "paired";
    } else if (n <= 12) {
      if (flex.strips && i % 6 === 2) role = "full-bleed";
      else if (i % 5 === 3) role = "floating";
      else if (i % 4 === 0) role = "strip";
      else role = "card";
    } else if (flex.dense) {
      role = "contact-frame"; // archive / contact sheet density
    } else {
      // 13+ but not a dense template: clusters of cards + occasional bleed
      if (i % 9 === 4 && flex.strips) role = "full-bleed";
      else if (i % 7 === 5) role = "strip";
      else role = "card";
    }
    roles.push({ photo, role });
    void remaining;
  });

  return roles;
}

/** Pull every photo of a given role, in order. */
export function byRole(roles: RoleAssignment[], role: PhotoRole): PhotoAsset[] {
  return roles.filter((r) => r.role === role).map((r) => r.photo);
}

/** The last card/strip photo — used as a mid-page accent. */
export function accentPhoto(roles: RoleAssignment[]): PhotoAsset | undefined {
  const acc = byRole(roles, "card");
  return acc.length ? acc[acc.length - 1] : byRole(roles, "floating")[0];
}

export { min, max, floor };