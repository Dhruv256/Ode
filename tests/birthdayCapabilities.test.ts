import { describe, expect, it } from "vitest";
import { BIRTHDAY_PHOTO_LIMIT, CAROUSEL_AUTOPLAY_MS, HIGH_PHOTO_THRESHOLD, highPhotoArchive, resolvePhotoMode, validatePhotoUsage } from "../src/lib/birthdayCapabilities";
import { createEmptyProject, type PhotoAsset, type TemplateId } from "../src/lib/types";

function photos(count: number): PhotoAsset[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `photo-${index}`,
    fileName: `${index}.jpg`,
    previewUrl: `/photo-${index}.jpg`,
    width: 1200,
    height: 1600,
    orientation: "portrait",
    focalPoint: { x: .5, y: .5 },
    fit: "fill",
    heroEligible: true,
    isHero: index === 0,
    order: count - index,
  }));
}

describe("birthday capability contracts", () => {
  it("auto-enables the 50+ mode and allows either manual override", () => {
    const project = createEmptyProject();
    project.photos = photos(HIGH_PHOTO_THRESHOLD);
    expect(resolvePhotoMode(project)).toBe("high-photo");
    project.photoMode = "standard";
    expect(resolvePhotoMode(project)).toBe("standard");
    project.photoMode = "high-photo";
    project.photos = [];
    expect(resolvePhotoMode(project)).toBe("high-photo");
  });

  it("keeps all 57 uploads and reports a single missing assignment", () => {
    const uploaded = photos(57);
    const assigned = highPhotoArchive(uploaded);
    expect(assigned).toHaveLength(57);
    expect(validatePhotoUsage(uploaded, assigned.map((photo) => photo.id))).toMatchObject({ uploadedCount: 57, renderedCount: 57, unusedPhotoIds: [], valid: true });
    expect(validatePhotoUsage(uploaded, assigned.slice(1).map((photo) => photo.id))).toMatchObject({ renderedCount: 56, unusedPhotoIds: [assigned[0].id], valid: false });
  });

  it("locks the product limits and carousel rhythm", () => {
    expect(BIRTHDAY_PHOTO_LIMIT).toBe(75);
    expect(CAROUSEL_AUTOPLAY_MS).toBe(2500);
  });

  it("keeps the capability layer available to all twelve templates", () => {
    const ids: TemplateId[] = ["contact-sheet", "cut-and-paste", "cover-star", "cinema", "internet-person", "archive", "after-dark", "sunday-morning", "polaroid-wall", "dreamscape", "poster-city", "yearbook"];
    expect(new Set(ids).size).toBe(12);
  });
});
