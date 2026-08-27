import type { Theme } from "./types";

/** WCAG-ish contrast pick: dark text for light grounds, light text for dark. */
function readableOn(hex: string): string {
  const c = hex.replace("#", "");
  const full = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#14140f" : "#f4f0e7";
}

function mix(hex: string, into: string, amount: number): string {
  const parse = (h: string) => {
    const c = h.replace("#", "");
    const f = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
    return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
  };
  const a = parse(hex);
  const b = parse(into);
  const ch = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
  return `#${ch.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PALETTE INFUSION — turn the 5-slot color direction into a full theme.
 * Colors: [0] ground, [1] type, [2] accent, [3] second accent, [4] highlight.
 * Template identity must survive any palette (Contact Sheet stays a contact
 * sheet even in pink) — templates own structure/typography; this owns color.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function buildTheme(colors: string[]): Theme {
  const bg = colors[0] ?? "#F4F0E7";
  const ink = colors[1] ?? "#1B1815";
  const accent = colors[2] ?? "#B4502A";
  const accent2 = colors[3] ?? (colors[2] ?? "#6E56CF");
  const accent3 = colors[4] ?? accent2;

  // Type color flows from the palette's own pairing, but must read on bg.
  const textIsInk = /^(?:#|)(?:[0-9a-f]{6}|[0-9a-f]{3})$/i.test(ink);
  const text = textIsInk ? ink : readableOn(bg);

  const lumBg = readableOn(bg) === "#14140f"; // background is light
  const lighter = lumBg;

  return {
    bg,
    panel: lighter ? mix(bg, ink, 0.07) : mix(bg, ink, 0.09),
    text,
    muted: lighter ? mix(text, bg, 0.32) : mix(text, bg, 0.3),
    accent,
    accent2,
    accent3,
    line: lighter ? mix(text, bg, 0.12) : mix(text, bg, 0.18),
  };
}

/** Convenience CSS custom-properties for a template root element. */
export function themeVars(theme: Theme): Record<string, string> {
  return {
    "--tp-bg": theme.bg,
    "--tp-panel": theme.panel,
    "--tp-text": theme.text,
    "--tp-muted": theme.muted,
    "--tp-accent": theme.accent,
    "--tp-accent2": theme.accent2,
    "--tp-accent3": theme.accent3,
    "--tp-line": theme.line,
  };
}