import type { Interest } from "./types";
import { uid } from "./utils";

/**
 * Interest chips. These seed SUBTLE motifs only (lap numbers, chapter
 * numbering, coordinates…) — never a full theme takeover.
 * `motifHint` documents what each interest may later influence.
 */
export const INTEREST_CHIPS: ReadonlyArray<{ label: string; motifHint: string }> = [
  { label: "Football", motifHint: "match-minute typography" },
  { label: "Formula 1", motifHint: "lap numbers, tiny checkered detail" },
  { label: "Gaming", motifHint: "level numbers, small achievements" },
  { label: "Movies", motifHint: "scene counters" },
  { label: "Books", motifHint: "chapter numbering, page numbers" },
  { label: "Travel", motifHint: "coordinates, ticket-style labels" },
  { label: "Chai", motifHint: "steam-line detail" },
  { label: "Coffee", motifHint: "cup-ring stamps" },
  { label: "Dogs", motifHint: "paw-print margin marks" },
  { label: "Cats", motifHint: "scratch-through underline" },
  { label: "Fashion", motifHint: "look-number tags" },
  { label: "Art", motifHint: "catalogue numbers" },
  { label: "Music", motifHint: "track listings, BPM notes" },
  { label: "Cooking", motifHint: "recipe-card annotations" },
  { label: "Photography", motifHint: "exposure metadata" },
];

export const chipLabels = INTEREST_CHIPS.map((c) => c.label);

export const makeInterest = (label: string, custom = false): Interest => ({
  id: uid(),
  label: label.trim(),
  custom,
});
