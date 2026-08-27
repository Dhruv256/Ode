import type { VibeId } from "./types";

export interface VibeDefinition {
  id: VibeId;
  name: string;
  description: string;
  /** Decorative keyword surfaced on hover / selection. */
  motifWord: string;
}

export const VIBES: VibeDefinition[] = [
  {
    id: "main-character",
    name: "The Main Character",
    description: "Confident, cinematic, dramatic.",
    motifWord: "CINEMA",
  },
  {
    id: "soft-sentimental",
    name: "Soft & Sentimental",
    description: "Warm, nostalgic, intimate.",
    motifWord: "KEEPSAKE",
  },
  {
    id: "chaos-energy",
    name: "Chaos Energy",
    description: "Funny, unpredictable, loud.",
    motifWord: "UNHINGED",
  },
  {
    id: "old-soul",
    name: "Old Soul",
    description: "Film, books, timeless details.",
    motifWord: "TIMELESS",
  },
  {
    id: "minimal-cool",
    name: "Minimal Cool",
    description: "Understated, editorial, design-conscious.",
    motifWord: "QUIET",
  },
  {
    id: "sunshine-human",
    name: "Sunshine Human",
    description: "Bright, optimistic, colorful.",
    motifWord: "GOLDEN",
  },
  {
    id: "midnight-person",
    name: "Midnight Person",
    description: "Dark, nightlife, mysterious.",
    motifWord: "AFTER 1AM",
  },
  {
    id: "creative-soul",
    name: "Creative Soul",
    description: "Art, music, photography, experimentation.",
    motifWord: "STUDIO",
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Travel, maps, places, adventure.",
    motifWord: "N 28°",
  },
  {
    id: "retro-kid",
    name: "Retro Kid",
    description: "Analog, Y2K, disposable camera, nostalgia.",
    motifWord: "EST. Y2K",
  },
  {
    id: "romantic",
    name: "Romantic",
    description: "Dreamlike, expressive, soft.",
    motifWord: "AMOUR",
  },
  {
    id: "internet-native",
    name: "Internet Native",
    description: "Memes, screenshots, digital culture, playful UI.",
    motifWord: "LOL",
  },
];

export const vibeById = (id: VibeId): VibeDefinition | undefined =>
  VIBES.find((v) => v.id === id);
