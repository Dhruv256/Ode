import type { PhotoAsset, TemplateId } from "@/lib/types";
import type { PhotoRole, RoleAssignment } from "./types";
import { photoStage } from "@/lib/photoIntelligence";

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
  const hero = photos.find(p=>p.isHero) ?? photos.find(p=>p.heroEligible && (photoStage(p)==="adult"||photoStage(p)==="young_adult")) ?? photos.find(p=>p.heroEligible) ?? photos[0];
  const finale = [...photos].reverse().find(p=>p.id!==hero.id) ?? hero;
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
    // Metadata-aware casting comes before count-based fan-out. No analysis is
    // invented: these branches activate only when the creator or a real image
    // analysis pass supplied the corresponding signal.
    const remaining = n - roles.filter((r) => r.role === "hero" || r.role === "finale").length;
    let role: PhotoRole;
    if (photo.associatedMemoryId) role = "hidden-interaction";
    else if (photo.analysis?.isGroupPhoto) role = "group";
    else if (photo.analysis?.isCloseUp) role = "detail";
    else if (photo.dateTaken && i % 3 === 0) role = "sequence";
    else if (photo.orientation === "landscape" && n > 4 && i % 5 === 0) role = "background";
    else if (n === 1) role = "hero";
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

export interface PhotoStoryAllocation {
  hero?: PhotoAsset;
  feature?: PhotoAsset;
  pair: PhotoAsset[];
  reveal?: PhotoAsset;
  carousel: PhotoAsset[];
  memory?: PhotoAsset;
  secondaryPair: PhotoAsset[];
  montage: PhotoAsset[];
  finale?: PhotoAsset;
}

/**
 * A deterministic narrative allocation that uses every upload without placing
 * the whole collection on screen. Dense montage is reserved for 21+ photos.
 */
export function allocatePhotoStory(photos: PhotoAsset[], heroId?: string): PhotoStoryAllocation {
  if (!photos.length) return { pair: [], carousel: [], secondaryPair: [], montage: [] };
  const hero = photos.find((photo) => photo.id === heroId || photo.isHero) ?? photos[0];
  const ordered = photos.filter((photo) => photo.id !== hero.id);
  const finale = ordered.length > 0 ? ordered.pop() : hero;
  const feature = ordered.shift();
  const pair = ordered.splice(0, 2);
  const reveal = ordered.shift();
  const memory = ordered.length > 2 ? ordered.splice(Math.floor(ordered.length / 2), 1)[0] : ordered.shift();
  const secondaryPair = ordered.splice(-2, 2);
  const montage = photos.length >= 21 ? ordered.splice(Math.max(0, ordered.length - Math.min(12, photos.length - 18))) : [];
  return { hero, feature, pair, reveal, carousel: ordered, memory, secondaryPair, montage, finale };
}

export { min, max, floor };
