import type {
  BirthdayProject,
  MilestoneDefinition,
  PhotoAsset,
  TemplateId,
} from "@/lib/types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEMPLATE RENDERER — shared types
 * ─────────────────────────────────────────────────────────────────────────────
 * Every generated experience consumes a `RenderCtx` built once from the
 * BirthdayProject. Templates compose from system primitives but stay visually
 * distinct (different treatments, fonts, motifs, section rhythm, finale).
 */

/** The visual job a photo is assigned. Deterministic per template + count. */
export type PhotoRole =
  | "hero"
  | "full-bleed"
  | "cinematic-bg"
  | "contact-frame"
  | "card"
  | "strip"
  | "paired"
  | "floating"
  | "polaroid"
  | "annotation"
  | "finale";

/** Template-level image treatment. Applied via CSS, never destroys source. */
export type Treatment =
  | "none"
  | "grain"
  | "bw"
  | "warm"
  | "flash"
  | "duotone"
  | "halftone"
  | "newspaper"
  | "photocopy"
  | "cool";

/** Deeply-infused palette tokens, always readable on the chosen ground. */
export interface Theme {
  bg: string;
  panel: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  accent3: string;
  line: string;
}

/** Curated per-template font profile. */
export interface RenderFonts {
  display: string; // css font-family string
  body: string;
  mono: string;
  hand?: string;
}

export interface RoleAssignment {
  photo: PhotoAsset;
  role: PhotoRole;
}

export interface MemBundle {
  oneSentence?: string;
  threeWords?: string;
  thingsTheyLove?: string;
  place?: string;
  song?: string;
  movie?: string;
  insideJoke?: string;
  alwaysSays?: string;
  obsession?: string;
  knownFor?: string;
  memory?: string;
  message?: string;
  ending?: string;
}

export interface RenderCtx {
  id: TemplateId;
  project: BirthdayProject;
  colors: string[];
  theme: Theme;
  treatment: Treatment;
  fonts: RenderFonts;
  /** Display first-name (nickname wins). */
  name: string;
  fullName: string;
  age: number | null;
  milestone?: MilestoneDefinition;
  /** Milestone headline for (age × template). */
  title: string;
  photos: PhotoAsset[]; // sorted by order
  hero?: PhotoAsset;
  finalePhoto?: PhotoAsset;
  roles: RoleAssignment[];
  /** Lowercased interest labels, for motif seeding. */
  interests: string[];
  memories: MemBundle;
  edit: boolean;
  device: "desktop" | "mobile";
  onEdit?: (key: string, value: string) => void;
}

export const EMPTY_MEM: MemBundle = {};