import type { BirthdayProject, PhotoAsset, PhotoMode } from "./types";

export const BIRTHDAY_PHOTO_LIMIT = 75;
export const HIGH_PHOTO_THRESHOLD = 50;
export const CUSTOM_MEMORY_LIMIT = 10;
export const CAROUSEL_AUTOPLAY_MS = 2500;

export function resolvePhotoMode(project: Pick<BirthdayProject, "photos" | "photoMode">): "standard" | "high-photo" {
  const mode: PhotoMode = project.photoMode ?? "auto";
  if (mode === "high-photo" || mode === "standard") return mode;
  return project.photos.length >= HIGH_PHOTO_THRESHOLD ? "high-photo" : "standard";
}

export interface PhotoUsageReport {
  uploadedCount: number;
  renderedCount: number;
  unusedPhotoIds: string[];
  valid: boolean;
}

/** Strict, duplicate-safe coverage check used by renderers and tests. */
export function validatePhotoUsage(photos: readonly PhotoAsset[], renderedPhotoIds: readonly string[]): PhotoUsageReport {
  const rendered = new Set(renderedPhotoIds);
  const unusedPhotoIds = photos.filter((photo) => !rendered.has(photo.id)).map((photo) => photo.id);
  return {
    uploadedCount: photos.length,
    renderedCount: photos.length - unusedPhotoIds.length,
    unusedPhotoIds,
    valid: unusedPhotoIds.length === 0,
  };
}

/** The high-photo archive is intentionally lossless and keeps creator order. */
export function highPhotoArchive(photos: readonly PhotoAsset[]): PhotoAsset[] {
  return [...photos].sort((a, b) => a.order - b.order);
}
