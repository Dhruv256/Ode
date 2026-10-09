import type { TemplateId } from "@/lib/types";

export type FrameRatio = "portrait" | "landscape" | "square" | "cinematic" | "postcard";
export const FRAME_RATIOS: Record<FrameRatio, string> = { portrait:"4 / 5",landscape:"3 / 2",square:"1 / 1",cinematic:"16 / 9",postcard:"4 / 3" };
export const TEMPLATE_FRAMES: Record<TemplateId, { hero: FrameRatio; repeated: FrameRatio; collection: FrameRatio }> = {
  "contact-sheet": {hero:"portrait",repeated:"landscape",collection:"portrait"},
  "cut-and-paste": {hero:"portrait",repeated:"portrait",collection:"square"},
  "cover-star": {hero:"portrait",repeated:"portrait",collection:"landscape"},
  cinema: {hero:"cinematic",repeated:"cinematic",collection:"cinematic"},
  "internet-person": {hero:"portrait",repeated:"landscape",collection:"square"},
  archive: {hero:"portrait",repeated:"portrait",collection:"postcard"},
  "after-dark": {hero:"portrait",repeated:"portrait",collection:"square"},
  "sunday-morning": {hero:"portrait",repeated:"postcard",collection:"postcard"},
  "polaroid-wall": {hero:"square",repeated:"square",collection:"square"},
  dreamscape: {hero:"portrait",repeated:"portrait",collection:"square"},
  "poster-city": {hero:"portrait",repeated:"portrait",collection:"portrait"},
  yearbook: {hero:"portrait",repeated:"portrait",collection:"postcard"},
};
export function normalizedFocal(value: number | undefined) { return Number.isFinite(value) ? Math.max(0,Math.min(1,value!)) : .5; }

/** Keep square instant prints and cinema mattes; let other frames follow the source. */
export function photoFrameRatio(ratio: FrameRatio | undefined, orientation: string, legacy?: string) {
  if (legacy) return legacy;
  if (ratio === 'square' || ratio === 'cinematic') return FRAME_RATIOS[ratio];
  if (orientation === 'landscape') return FRAME_RATIOS.landscape;
  if (orientation === 'square') return FRAME_RATIOS.square;
  return FRAME_RATIOS.portrait;
}
