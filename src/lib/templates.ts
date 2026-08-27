import type { MotionProfile, TemplateDefinition, TemplateId } from "./types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEMPLATE REGISTRY — fixed library of art-directed systems
 * ─────────────────────────────────────────────────────────────────────────────
 * Generated websites come ONLY from these curated definitions.
 * No procedural generation, no arbitrary websites.
 *
 * Phase 1: metadata + selector previews (pure CSS compositions).
 * Later phases: each id gains a full renderer module registered in
 * `src/templates/<id>/` and resolved via resolveTemplateRenderer().
 */

const motion = (
  intensity: MotionProfile["intensity"],
  opts: Partial<Omit<MotionProfile, "intensity" | "reducedMotionSafe">> = {}
): MotionProfile => ({
  intensity,
  scrollDriven: true,
  pageTransition: "fade",
  parallax: false,
  reducedMotionSafe: true,
  ...opts,
});

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  "contact-sheet": {
    id: "contact-sheet",
    name: "Contact Sheet",
    description:
      "A photographer's roll of film laid out in frames. Numbered, gridded, annotated in grease pencil.",
    recommendedVibes: ["creative-soul", "old-soul", "retro-kid"],
    typographyProfile: {
      display: "Grotesk caps",
      body: "Mono captions",
      notes: "Frame numbers, crop marks, grease-pencil circles.",
    },
    motionProfile: motion("calm", { pageTransition: "cut" }),
    features: ["film-strip", "annotations", "grain"],
    recommendedPhotoCount: { min: 12, ideal: 24, max: 36 },
    milestoneTreatment: "repetition-motif",
    suggestedPaletteId: "film-negative",
    previewKind: "contact-sheet",
    motionHint: "Frames slide through like a film advance.",
  },
  "cut-and-paste": {
    id: "cut-and-paste",
    name: "Cut & Paste",
    description:
      "Scissors, glue sticks, torn edges. A scrapbook that refuses to sit straight.",
    recommendedVibes: ["retro-kid", "chaos-energy", "soft-sentimental"],
    typographyProfile: {
      display: "Mixed ransom type",
      body: "Handwritten annotations",
      notes: "Torn paper, tape, sticker overlaps.",
    },
    motionProfile: motion("expressive", { pageTransition: "sweep", parallax: true }),
    features: ["collage", "stickers", "annotations"],
    recommendedPhotoCount: { min: 8, ideal: 18 },
    milestoneTreatment: "scrapbook-stamp",
    suggestedPaletteId: "butter",
    previewKind: "cut-and-paste",
    motionHint: "Pieces drop onto the page with a little bounce.",
  },
  "cover-star": {
    id: "cover-star",
    name: "Cover Star",
    description:
      "They are the magazine issue. Masthead, cover lines, fold marks, the works.",
    recommendedVibes: ["main-character", "minimal-cool", "sunshine-human"],
    typographyProfile: {
      display: "High-contrast Didone",
      body: "Editorial sans",
      notes: "Masthead, barcodes, pull quotes, issue numbers.",
    },
    motionProfile: motion("expressive", { pageTransition: "sweep" }),
    features: ["hero-photo", "full-bleed", "marquee", "chapters"],
    recommendedPhotoCount: { min: 6, ideal: 14 },
    milestoneTreatment: "editorial-cover",
    suggestedPaletteId: "monochrome",
    previewKind: "cover-star",
    motionHint: "Cover lines sweep in like a newsstand reveal.",
  },
  cinema: {
    id: "cinema",
    name: "Cinema",
    description:
      "Title cards, letterboxing, scene numbers. Their life as a feature film.",
    recommendedVibes: ["main-character", "romantic", "midnight-person"],
    typographyProfile: {
      display: "Wide-tracked caps",
      body: "Serif subtitles",
      notes: "Letterbox bars, slate cards, credits roll.",
    },
    motionProfile: motion("cinematic", { pageTransition: "sweep", parallax: true }),
    features: ["full-bleed", "video-support", "chapters", "grain"],
    recommendedPhotoCount: { min: 10, ideal: 20 },
    milestoneTreatment: "cinematic-title-card",
    suggestedPaletteId: "blue-hour",
    previewKind: "cinema",
    motionHint: "Slow fades, like cuts between scenes.",
  },
  "internet-person": {
    id: "internet-person",
    name: "Internet Person",
    description:
      "Browser chrome, cursor trails, screenshot energy. For the terminally online.",
    recommendedVibes: ["internet-native", "chaos-energy"],
    typographyProfile: {
      display: "System UI bold",
      body: "UI mono",
      notes: "Windows, tooltips, loading bars, affectionate error pop-ups.",
    },
    motionProfile: motion("expressive", { pageTransition: "cut" }),
    features: ["annotations", "stickers", "guest-messages"],
    recommendedPhotoCount: { min: 6, ideal: 16, max: 40 },
    milestoneTreatment: "typographic-poster",
    suggestedPaletteId: "electric",
    previewKind: "internet-person",
    motionHint: "Elements pop open like tiny windows.",
  },
  "after-dark": {
    id: "after-dark",
    name: "After Dark",
    description:
      "Flash photography at 1am. Dark rooms, bright faces, city noise.",
    recommendedVibes: ["midnight-person", "chaos-energy", "main-character"],
    typographyProfile: {
      display: "Condensed caps",
      body: "Small mono",
      notes: "Flash blowouts, timestamps, venue-style stamps.",
    },
    motionProfile: motion("cinematic", { pageTransition: "fade" }),
    features: ["full-bleed", "grain", "countdown"],
    recommendedPhotoCount: { min: 10, ideal: 22 },
    milestoneTreatment: "typographic-poster",
    suggestedPaletteId: "midnight-flash",
    previewKind: "after-dark",
    motionHint: "Flash frames blink in on scroll.",
  },
  "sunday-morning": {
    id: "sunday-morning",
    name: "Sunday Morning",
    description:
      "Slow light, linen textures, coffee going cold. The gentlest possible website.",
    recommendedVibes: ["soft-sentimental", "romantic", "old-soul"],
    typographyProfile: {
      display: "Warm serif",
      body: "Quiet serif",
      notes: "Wide margins, pressed-flower details, small caps.",
    },
    motionProfile: motion("calm", { scrollDriven: false }),
    features: ["hero-photo", "annotations"],
    recommendedPhotoCount: { min: 5, ideal: 12, max: 20 },
    milestoneTreatment: "archival-chapter",
    suggestedPaletteId: "matcha-paper",
    previewKind: "sunday-morning",
    motionHint: "Everything arrives softly, unhurried.",
  },
  "polaroid-wall": {
    id: "polaroid-wall",
    name: "Polaroid Wall",
    description:
      "A wall of white-framed instant photos, pinned and slightly crooked.",
    recommendedVibes: ["soft-sentimental", "retro-kid", "explorer"],
    typographyProfile: {
      display: "Marker handwriting",
      body: "Typed labels",
      notes: "Handwritten margins under each frame.",
    },
    motionProfile: motion("expressive", { parallax: true }),
    features: ["collage", "annotations", "grain"],
    recommendedPhotoCount: { min: 8, ideal: 18, max: 30 },
    milestoneTreatment: "scrapbook-stamp",
    suggestedPaletteId: "strawberry-milk",
    previewKind: "polaroid-wall",
    motionHint: "Photos pin themselves one by one.",
  },
  archive: {
    id: "archive",
    name: "Archive",
    description:
      "Catalogue cards, accession numbers, acid-free folders. A museum of one person.",
    recommendedVibes: ["old-soul", "minimal-cool", "explorer"],
    typographyProfile: {
      display: "Institutional serif",
      body: "Index mono",
      notes: "File numbers, index cards, stamps, marginalia.",
    },
    motionProfile: motion("calm", { pageTransition: "cut" }),
    features: ["chapters", "annotations", "guest-messages"],
    recommendedPhotoCount: { min: 12, ideal: 25, max: 60 },
    milestoneTreatment: "archival-chapter",
    suggestedPaletteId: "espresso",
    previewKind: "archive",
    motionHint: "Drawers slide; cards flip to face you.",
  },
  dreamscape: {
    id: "dreamscape",
    name: "Dreamscape",
    description:
      "Floating images, soft gradients of thought, weightless composition.",
    recommendedVibes: ["romantic", "creative-soul", "sunshine-human"],
    typographyProfile: {
      display: "Airy italic serif",
      body: "Light sans",
      notes: "Soft masks, drifting layers, generous sky.",
    },
    motionProfile: motion("cinematic", { pageTransition: "fade", parallax: true }),
    features: ["full-bleed", "video-support", "grain"],
    recommendedPhotoCount: { min: 8, ideal: 16 },
    milestoneTreatment: "cinematic-title-card",
    suggestedPaletteId: "lavender-haze",
    previewKind: "dreamscape",
    motionHint: "Images drift on slow currents.",
  },
  "poster-city": {
    id: "poster-city",
    name: "Poster City",
    description:
      "Oversized type, street-poster layering, paste-up walls of celebration.",
    recommendedVibes: ["main-character", "minimal-cool", "sunshine-human"],
    typographyProfile: {
      display: "Massive grotesk",
      body: "Utilitarian sans",
      notes: "Wheatpaste layers, overprints, big numbers.",
    },
    motionProfile: motion("expressive", { pageTransition: "sweep" }),
    features: ["marquee", "full-bleed", "stickers"],
    recommendedPhotoCount: { min: 6, ideal: 15, max: 30 },
    milestoneTreatment: "typographic-poster",
    suggestedPaletteId: "tangerine",
    previewKind: "poster-city",
    motionHint: "Posters paste over each other as you scroll.",
  },
  yearbook: {
    id: "yearbook",
    name: "Yearbook",
    description:
      "Class photo grids, superlatives, signed margins. 'Most likely to…' forever.",
    recommendedVibes: ["soft-sentimental", "chaos-energy", "old-soul"],
    typographyProfile: {
      display: "Collegiate serif",
      body: "Typewriter",
      notes: "Ruled sections, signature scrawls, senior quotes.",
    },
    motionProfile: motion("calm", { pageTransition: "fade" }),
    features: ["chapters", "guest-messages", "annotations"],
    recommendedPhotoCount: { min: 10, ideal: 24, max: 40 },
    milestoneTreatment: "archival-chapter",
    suggestedPaletteId: "mediterranean",
    previewKind: "yearbook",
    motionHint: "Rows fade up like turning pages.",
  },
};

export const TEMPLATE_ORDER: TemplateId[] = [
  "contact-sheet",
  "cut-and-paste",
  "cover-star",
  "cinema",
  "internet-person",
  "after-dark",
  "sunday-morning",
  "polaroid-wall",
  "archive",
  "dreamscape",
  "poster-city",
  "yearbook",
];

export const ALL_TEMPLATES: TemplateDefinition[] = TEMPLATE_ORDER.map(
  (id) => TEMPLATES[id]
);

export const templateById = (id?: TemplateId): TemplateDefinition | undefined =>
  id ? TEMPLATES[id] : undefined;

/** Rank templates for a vibe selection — used to mark “Recommended”. */
export function recommendedTemplatesFor(vibeIds: string[]): TemplateId[] {
  return TEMPLATE_ORDER.filter((id) =>
    TEMPLATES[id].recommendedVibes.some((v) => vibeIds.includes(v))
  );
}


