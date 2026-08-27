import type { PaletteDefinition } from "./types";

/**
 * Curated palette library. Each entry is an art direction, not an accent
 * color: background → text → annotations → borders → overlays.
 * Order matters — first color is the intended ground, second the type color.
 */
export const PALETTES: PaletteDefinition[] = [
  { id: "cherry-cola", name: "Cherry Cola", moodWord: "Fizzy", colors: ["#3A0E12", "#E8D9C3", "#B23A48", "#7A1F2B", "#D98E73"] },
  { id: "mediterranean", name: "Mediterranean", moodWord: "Salt air", colors: ["#F2EBDD", "#22364A", "#3E6C8E", "#C4622D", "#8FA98F"] },
  { id: "matcha-paper", name: "Matcha Paper", moodWord: "Steeped", colors: ["#EFEAD8", "#33362B", "#7C8A5A", "#B5BE8F", "#57503A"] },
  { id: "midnight-flash", name: "Midnight Flash", moodWord: "Blinded", colors: ["#101018", "#F4F1FF", "#6E56CF", "#2A2A3D", "#C4B5FD"] },
  { id: "strawberry-milk", name: "Strawberry Milk", moodWord: "Soft", colors: ["#FBEEE9", "#43242B", "#D97A8E", "#EFA9B8", "#8C5560"] },
  { id: "film-negative", name: "Film Negative", moodWord: "Inverted", colors: ["#111111", "#F5F2EA", "#9A9A92", "#3A3A36", "#D9D4C5"] },
  { id: "butter", name: "Butter", moodWord: "Melted", colors: ["#F6E7B2", "#3D3417", "#D9A441", "#B3771F", "#FFF6DA"] },
  { id: "blue-hour", name: "Blue Hour", moodWord: "Dusk", colors: ["#171C2B", "#E6E9F2", "#4A5D8A", "#8B9BC4", "#2C3652"] },
  { id: "tangerine", name: "Tangerine", moodWord: "Peel", colors: ["#F8EFE4", "#33231A", "#E07A2F", "#C25417", "#F0B25E"] },
  { id: "lavender-haze", name: "Lavender Haze", moodWord: "Hazy", colors: ["#EAE4F2", "#2F2740", "#8E7CC3", "#B9A7DC", "#574A78"] },
  { id: "espresso", name: "Espresso", moodWord: "Double shot", colors: ["#241B15", "#EDE3D2", "#8A6A4F", "#4E3826", "#C4A47F"] },
  { id: "forest", name: "Forest", moodWord: "Deep green", colors: ["#16241B", "#EDE8D8", "#4F7355", "#2E4A38", "#93A87E"] },
  { id: "electric", name: "Electric", moodWord: "Voltage", colors: ["#0D0D0D", "#F2F2F2", "#D8F34E", "#232323", "#8A8A80"] },
  { id: "monochrome", name: "Monochrome", moodWord: "Noir", colors: ["#F5F5F2", "#141414", "#8C8C88", "#3D3D3A", "#CFCFC8"] },
  { id: "ocean", name: "Ocean", moodWord: "Undertow", colors: ["#0E2733", "#E4EEEA", "#2E6E7E", "#5AA0A8", "#173F4C"] },
  { id: "wine", name: "Wine", moodWord: "Cellared", colors: ["#F4EDE4", "#3A1220", "#6E2436", "#96455C", "#51121F"] },
  { id: "retro-pop", name: "Retro Pop", moodWord: "Jukebox", colors: ["#F6EFE0", "#26221E", "#E2543E", "#3E7CB1", "#EFB63C"] },
  { id: "golden-hour", name: "Golden Hour", moodWord: "Backlit", colors: ["#2B1D14", "#F7E8CE", "#D99A4E", "#A66A2E", "#EFC98A"] },
];

export const CUSTOM_PALETTE_ID = "custom";

export const paletteById = (id?: string): PaletteDefinition | undefined =>
  PALETTES.find((p) => p.id === id);

/** Resolve the working color set for a project (curated or custom). */
export function resolveProjectColors(
  paletteId?: string,
  customPalette?: string[]
): string[] | undefined {
  if (paletteId === CUSTOM_PALETTE_ID) {
    return customPalette && customPalette.length >= 2 ? customPalette : undefined;
  }
  return paletteById(paletteId)?.colors;
}
