/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BIRTHDAY WORLD — Core data model
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for everything a birthday project contains.
 * Designed to be extended in later phases (guest messages, publishing,
 * GSAP / Three.js motion profiles, photo analysis) WITHOUT breaking changes.
 */

/* ── Person ─────────────────────────────────────────────────────────────── */

export type Gender = "male" | "female";

export type Relationship =
  | "friend"
  | "best-friend"
  | "partner"
  | "sibling"
  | "parent"
  | "colleague"
  | "other";

export interface PersonProfile {
  gender?: Gender;
  fullName: string;
  nickname?: string;
  pronouns?: string;
  relationship?: Relationship;
}

/* ── Vibes (Step 02 · Their world) ──────────────────────────────────────── */

export type VibeId =
  | "main-character"
  | "soft-sentimental"
  | "chaos-energy"
  | "old-soul"
  | "minimal-cool"
  | "sunshine-human"
  | "midnight-person"
  | "creative-soul"
  | "explorer"
  | "retro-kid"
  | "romantic"
  | "internet-native";

export interface VibeProfile {
  vibes: VibeId[];
  /** Free-text description, e.g. "foodie, sarcastic, obsessed with F1…" */
  customVibe?: string;
}

/* ── Templates (Step 03 · Style) ────────────────────────────────────────── */

export type TemplateId =
  | "contact-sheet"
  | "cut-and-paste"
  | "cover-star"
  | "cinema"
  | "internet-person"
  | "after-dark"
  | "sunday-morning"
  | "polaroid-wall"
  | "archive"
  | "dreamscape"
  | "poster-city"
  | "yearbook";

/**
 * Declarative motion intent. Phase 1 renders this with CSS / Framer Motion.
 * Later phases map these profiles onto GSAP timelines, ScrollTrigger
 * scrubbing, or R3F camera moves without touching project state.
 */
export interface MotionProfile {
  intensity: "calm" | "expressive" | "cinematic";
  scrollDriven: boolean;
  pageTransition: "cut" | "fade" | "sweep";
  parallax: boolean;
  /** Always true — every profile degrades gracefully under prefers-reduced-motion. */
  reducedMotionSafe: true;
}

export type TemplateFeature =
  | "hero-photo"
  | "full-bleed"
  | "collage"
  | "film-strip"
  | "annotations"
  | "stickers"
  | "chapters"
  | "marquee"
  | "grain"
  | "countdown"
  | "guest-messages"
  | "video-support";

export interface TemplatePhotoCount {
  min: number;
  ideal: number;
  max?: number;
}

export type MilestoneTreatmentStyle =
  | "editorial-cover"
  | "cinematic-title-card"
  | "repetition-motif"
  | "archival-chapter"
  | "typographic-poster"
  | "scrapbook-stamp";

export type TemplatePreviewKind = TemplateId;

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  recommendedVibes: VibeId[];
  typographyProfile: {
    display: string;
    body: string;
    notes: string;
  };
  motionProfile: MotionProfile;
  features: TemplateFeature[];
  recommendedPhotoCount: TemplatePhotoCount;
  milestoneTreatment: MilestoneTreatmentStyle;
  /** Suggested palette id from lib/palettes.ts (a starting point, not a lock). */
  suggestedPaletteId: PaletteId;
  previewKind: TemplatePreviewKind;
  /** One-line motion hint shown on the selector card. */
  motionHint: string;
}

/* ── Milestones (Step 04 · Age) ─────────────────────────────────────────── */

export const MILESTONE_AGES = [16, 18, 21, 22, 25, 50, 100] as const;

export type BirthdayMilestone = (typeof MILESTONE_AGES)[number];

export interface MilestoneModule {
  id: string;
  title: string;
  note?: string;
}

export interface MilestoneDefinition {
  age: BirthdayMilestone;
  numeral: string;
  /** Short label shown under the big number, e.g. QUARTER CENTURY. */
  label: string;
  tagline: string;
  treatmentStyle: MilestoneTreatmentStyle;
  modules: MilestoneModule[];
}

/**
 * Per-template milestone headline language. A milestone is never rendered
 * template-independent — the same age speaks differently through each system.
 */
export type MilestoneTitleMap = Partial<Record<TemplateId, string>>;

/* ── Palettes (Step 05 · Color) ─────────────────────────────────────────── */

/** Curated palette ids use their slug; custom palettes use "custom". */
export type PaletteId = string;

export interface PaletteDefinition {
  id: PaletteId;
  name: string;
  moodWord: string;
  colors: string[];
  recommendedVibes?: VibeId[];
}

/* ── Photos (Step 06 · Memories as images) ──────────────────────────────── */

export type PhotoOrientation = "landscape" | "portrait" | "square";

export type ImageFitMode = "fit" | "fill" | "original" | "manual";

export interface FocalPoint {
  /** Normalized 0–1 within the image. */
  x: number;
  y: number;
}

/**
 * Optional future analysis results. NEVER fabricated by the generator:
 * fields stay undefined until a real analysis pass populates them.
 */
export interface PhotoAnalysis {
  brightness?: number;
  dominantColors?: string[];
  isCloseUp?: boolean;
  isGroupPhoto?: boolean;
  sharpness?: number;
}

export interface PhotoAsset {
  id: string;
  fileName: string;
  /** Object URL for session display; persisted projects flag stale URLs. */
  previewUrl: string;
  width: number;
  height: number;
  orientation: PhotoOrientation;
  focalPoint: FocalPoint;
  fit: ImageFitMode;
  heroEligible: boolean;
  /** Exactly one photo may be the hero at a time. */
  isHero: boolean;
  order: number;
  caption?: string;
  dateTaken?: string;
  location?: string;
  associatedMemoryId?: string;
  analysis?: PhotoAnalysis;
  /**
   * True when restored from storage but the blob URL no longer resolves
   * (object URLs die between sessions). The UI asks to re-link the file.
   */
  needsRelink?: boolean;
  /** Video clips share the collage system but never autoplay with sound. */
  kind?: "image" | "video";
  mimeType?: string;
}

/* ── Words (Step 07 · Details & memories) ───────────────────────────────── */

export type MemoryKey =
  | "one-sentence"
  | "three-words"
  | "things-they-love"
  | "favorite-place"
  | "favorite-song"
  | "favorite-movie"
  | "inside-joke"
  | "always-says"
  | "current-obsession"
  | "known-for"
  | "unforgettable-memory"
  | "birthday-message"
  | "ending-line";

export interface Memory {
  id: string;
  key: MemoryKey;
  answer: string;
  skipped: boolean;
}

/* ── Interests & guests ─────────────────────────────────────────────────── */

export interface Interest {
  id: string;
  label: string;
  /** True when typed in by the creator rather than chosen from chips. */
  custom: boolean;
}

export interface GuestMessage {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface SoundtrackAsset {
  fileName: string;
  previewUrl: string;
  mimeType: string;
  needsRelink?: boolean;
}

/* ── Publishing (future phase — schema reserved now) ────────────────────── */

export type PublishingStatus = "draft" | "published" | "archived";

export interface PublishingSettings {
  status: PublishingStatus;
  /** Link is deliberately not indexed; public is an explicit opt-in. */
  visibility: "private" | "link" | "public";
  slug?: string;
  publishedAt?: string;
  passwordProtected?: boolean;
  unlockAt?: string;
}

/* ── The project ────────────────────────────────────────────────────────── */

export type CreatorStepId =
  | "gender"
  | "person"
  | "world"
  | "style"
  | "age"
  | "color"
  | "photos"
  | "words"
  | "preview";

export interface BirthdayProject {
  id: string;
  createdAt: string;
  updatedAt: string;
  person: PersonProfile;
  vibes: VibeProfile;
  age: number | null;
  birthdayDate?: string;
  milestone?: BirthdayMilestone;
  templateId?: TemplateId;
  paletteId?: PaletteId;
  customPalette?: string[];
  photos: PhotoAsset[];
  interests: Interest[];
  memories: Memory[];
  guestMessages: GuestMessage[];
  soundtrack?: SoundtrackAsset;
  publishing: PublishingSettings;
  /** Highest step the creator has reached — powers "edit previous answers". */
  furthestStep: CreatorStepId;
}

export const createEmptyProject = (): BirthdayProject => ({
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  person: { fullName: "" },
  vibes: { vibes: [] },
  age: null,
  photos: [],
  interests: [],
  memories: [],
  guestMessages: [],
  publishing: { status: "draft", visibility: "link" },
  furthestStep: "gender",
});

