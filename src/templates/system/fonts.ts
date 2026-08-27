import type { TemplateId } from "@/lib/types";
import type { RenderFonts, Treatment } from "./types";

/**
 * Typography + treatment profiles per template.
 * Generated sites must NOT all share one type system — these give each
 * template a distinct voice (Fraunces/Space Grotesk remain in the creator;
 * the generated pages draw from the full five-family library).
 */

const F = {
  serif: "'Fraunces', Georgia, serif",
  didone: "'Bodoni Moda', Georgia, serif",
  sans: "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif",
  cond: "'Anton', 'Arial Narrow', sans-serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
  hand: "'Caveat', cursive",
};

export interface TemplateStyleSpec {
  fonts: RenderFonts;
  treatment: Treatment;
}

export const TEMPLATE_STYLE: Record<TemplateId, TemplateStyleSpec> = {
  "contact-sheet": { fonts: { display: F.sans, body: F.sans, mono: F.mono, hand: F.hand }, treatment: "grain" },
  "cut-and-paste": { fonts: { display: F.didone, body: F.sans, mono: F.mono, hand: F.hand }, treatment: "none" },
  "cover-star": { fonts: { display: F.didone, body: F.sans, mono: F.mono, hand: F.hand }, treatment: "none" },
  cinema: { fonts: { display: F.didone, body: F.sans, mono: F.mono }, treatment: "grain" },
  "internet-person": { fonts: { display: F.sans, body: F.sans, mono: F.mono }, treatment: "none" },
  archive: { fonts: { display: F.didone, body: F.serif, mono: F.mono }, treatment: "newspaper" },
  "after-dark": { fonts: { display: F.cond, body: F.sans, mono: F.mono }, treatment: "flash" },
  "sunday-morning": { fonts: { display: F.serif, body: F.serif, mono: F.mono, hand: F.hand }, treatment: "none" },
  "polaroid-wall": { fonts: { display: F.serif, body: F.sans, mono: F.mono, hand: F.hand }, treatment: "warm" },
  dreamscape: { fonts: { display: F.serif, body: F.sans, mono: F.mono, hand: F.hand }, treatment: "cool" },
  "poster-city": { fonts: { display: F.cond, body: F.sans, mono: F.mono }, treatment: "halftone" },
  yearbook: { fonts: { display: F.didone, body: F.mono, mono: F.mono, hand: F.hand }, treatment: "photocopy" },
};

export { F as FONTS };