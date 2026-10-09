import type { HamperTheme, ItemType } from "./types";

export const MAX_ITEMS_PER_TYPE = 20;
export const MAX_TOTAL_ITEMS_PER_HAMPER = 120;
export const HAMPER_LIMITS = {
  maxActiveHampersPerUser: 10, maxItemsPerType: MAX_ITEMS_PER_TYPE, maxItemsPerHamper: MAX_TOTAL_ITEMS_PER_HAMPER,
  maxImageBytes: 5 * 1024 * 1024, maxAudioBytes: 2 * 1024 * 1024,
  maxTotalAssetBytesPerHamper: 25 * 1024 * 1024, maxTotalHamperAssetBytesPerUser: 200 * 1024 * 1024,
  maxRecordingSeconds: 90, maxStrokes: 200, maxPoints: 12000,
} as const;
export type ItemField = { key: string; label: string; recipientLabel?: string; max: number; required?: boolean; multiline?: boolean; kind?: "url" | "date" };
export type ItemVariant = { id: string; label: string };
export type ItemDefinition = { label: string; object: string; max: number; path: string; variants: readonly ItemVariant[]; fields: ItemField[]; media?: "photo" | "voice"; drawing?: boolean };
export const HAMPER_MESSAGE_FIELD = { key: 'message', label: 'Opening message', recipientLabel: 'A message tucked in for you' } as const;
export const HAMPER_ITEM_REGISTRY: Record<ItemType, ItemDefinition> = {
  note: { label: "Note", object: "A letter", max: HAMPER_LIMITS.maxItemsPerType, path: "M4 6h24v20H4z M4 7l12 10L28 7", variants: [{ id: "typewriter", label: "Typewriter" }, { id: "folded-letter", label: "Folded letter" }, { id: "postcard", label: "Postcard" }, { id: "notebook", label: "Notebook note" }], fields: [{ key: "title", label: "Little title", max: 80 }, { key: "body", label: "Your note", max: 1500, required: true, multiline: true }] },
  photo: { label: "Photo", object: "A camera", max: HAMPER_LIMITS.maxItemsPerType, path: "M5 3h22v26H5z M8 6h16v16H8z M9 20l5-7 4 4 3-3 3 6", variants: [{ id: "camera", label: "Camera" }, { id: "polaroids", label: "Polaroid stack" }, { id: "photo-strip", label: "Photo booth strip" }], media: "photo", fields: [{ key: "caption", label: "Caption", max: 300 }] },
  song: { label: "Song", object: "A record", max: HAMPER_LIMITS.maxItemsPerType, path: "M29 16a13 13 0 1 1-26 0 13 13 0 0 1 26 0 M20 16a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M6 16a10 10 0 0 1 10-10", variants: [{ id: "record", label: "Vinyl record" }, { id: "cassette", label: "Cassette" }, { id: "cd", label: "Compact disc" }], fields: [{ key: "url", label: "Song URL", max: 2048, required: true, kind: "url" }, { key: "title", label: "Song title", max: 80 }] },
  video: { label: "Video", object: "A camcorder", max: HAMPER_LIMITS.maxItemsPerType, path: "M3 7h26v19H3z M7 11h18v11H7z M12 2l4 5 5-5 M14 13l6 4-6 3z", variants: [{ id: "camcorder", label: "Camcorder" }, { id: "television", label: "Tiny television" }, { id: "film-screen", label: "Film screen" }], fields: [{ key: "url", label: "YouTube or Vimeo URL", max: 2048, required: true, kind: "url" }, { key: "caption", label: "Caption", max: 300 }] },
  voice: { label: "Voice", object: "A recorder", max: HAMPER_LIMITS.maxItemsPerType, path: "M7 3h18v26H7z M11 7h10v7H11z M12 21h1 M19 21h1 M12 10h8", variants: [{ id: "telephone", label: "Old telephone" }, { id: "recorder", label: "Cassette recorder" }, { id: "microphone", label: "Microphone" }], media: "voice", fields: [{ key: "title", label: "Voice note title", max: 80 }] },
  drawing: { label: "Drawing", object: "A pencil", max: HAMPER_LIMITS.maxItemsPerType, path: "M7 4h20v25H7z M3 8h7 M3 14h7 M3 20h7 M13 21l2-6L25 5l4 4-10 10z", variants: [{ id: "pencil", label: "Pencil" }, { id: "sketchbook", label: "Sketchbook" }, { id: "spiral-pad", label: "Spiral pad" }], drawing: true, fields: [{ key: "caption", label: "Caption", max: 300 }] },
  gift: { label: "Gift", object: "A parcel", max: HAMPER_LIMITS.maxItemsPerType, path: "M4 12h24v6H4z M6 18v11h20V18 M16 12v17 M16 12C2 11 8-2 16 12 M16 12C30 11 24-2 16 12", variants: [{ id: "parcel", label: "Paper parcel" }, { id: "wrapped-box", label: "Wrapped gift" }, { id: "bow", label: "Ribbon bow" }], fields: [{ key: "url", label: "Gift URL", max: 2048, required: true, kind: "url" }, { key: "note", label: "A note with your gift", max: 500, multiline: true }] },
  location: { label: "Location", object: "A folded map", max: HAMPER_LIMITS.maxItemsPerType, path: "M3 7l9-4 9 4 8-4v22l-8 4-9-4-9 4z M12 3v22 M21 7v22 M6 18l4-4 6 4 9-9", variants: [{ id: "map", label: "Folded map" }, { id: "place-postcard", label: "Place postcard" }, { id: "luggage-tag", label: "Luggage tag" }], fields: [{ key: "place", label: "Place name", max: 120, required: true }, { key: "url", label: "Google Maps URL (optional)", max: 2048, kind: "url" }, { key: "note", label: "Why this place?", max: 500, multiline: true }] },
  coupon: { label: "Coupon / Pass", object: "A ticket", max: HAMPER_LIMITS.maxItemsPerType, path: "M3 7h26v6a3 3 0 0 0 0 6v6H3v-6a3 3 0 0 0 0-6z M22 7v3 M22 13v3 M22 19v6 M8 12h9 M8 19h9", variants: [{ id: "ticket", label: "Admit-one ticket" }, { id: "voucher", label: "Voucher" }, { id: "pass", label: "Keepsake pass" }], fields: [{ key: "title", label: "Coupon title", max: 80, required: true }, { key: "description", label: "Description", max: 500, multiline: true }, { key: "code", label: "Code (optional)", max: 80 }, { key: "url", label: "URL (optional)", max: 2048, kind: "url" }, { key: "expiry", label: "Expiry (optional)", max: 10, kind: "date" }] },
  news: { label: "News", object: "A newspaper", max: HAMPER_LIMITS.maxItemsPerType, path: "M4 3h24v26H4z M8 7h16 M8 11h16 M8 15h7v7H8z M19 15h5 M19 19h5 M8 25h16", variants: [{ id: "newspaper", label: "Folded newspaper" }, { id: "clipping", label: "Press clipping" }, { id: "magazine", label: "Magazine cutting" }], fields: [{ key: "url", label: "Article URL", max: 2048, required: true, kind: "url" }, { key: "headline", label: "Headline", max: 160 }, { key: "note", label: "A note from you", max: 500, multiline: true }] },
};
export const ITEM_TYPES = Object.keys(HAMPER_ITEM_REGISTRY) as ItemType[];

/** Recipient copy is attached to the same schema fields the item editor uses. */
const recipientLabels: Partial<Record<ItemType, Record<string, string>>> = {
  note: { title: 'A letter for you', body: 'A note for you' }, photo: { caption: 'Written on this photo' },
  song: { title: 'A song chosen for you' }, video: { caption: 'About this video' },
  voice: { title: 'A voice note for you' }, drawing: { caption: 'About this drawing' },
  gift: { note: 'A note with your gift' }, location: { place: 'A place chosen for you', note: 'Why this place?' },
  coupon: { title: 'Your coupon', description: 'What this promise includes', code: 'Your coupon code' },
  news: { headline: 'An article chosen for you', note: 'A note for you' },
};
for (const type of ITEM_TYPES) for (const field of HAMPER_ITEM_REGISTRY[type].fields) {
  field.recipientLabel = recipientLabels[type]?.[field.key] ?? field.label;
}

export function hamperFieldLabel(type: ItemType, key: string) {
  return HAMPER_ITEM_REGISTRY[type].fields.find(field=>field.key===key)?.recipientLabel;
}
export function resolveVisualVariant(type: ItemType, requested: string | undefined, instanceIndex: number, theme?: HamperTheme) {
  const variants = HAMPER_ITEM_REGISTRY[type].variants;
  const explicit = variants.find(variant => variant.id === requested);
  if (explicit) return explicit.id;
  const themeOffset = theme ? (["soft-parcel", "berry-letter", "buttercup-picnic", "cloud-ribbon", "proper-retro"] as HamperTheme[]).indexOf(theme) : 0;
  return variants[(instanceIndex + Math.max(0, themeOffset)) % variants.length].id;
}
export const HAMPER_THEMES: Record<HamperTheme, { name: string; description: string; paper: string; accent: string; soft: string; box: string; scene: string }> = {
  "soft-parcel": { name: "Soft Parcel", description: "Cream paper, red stamps & a little care.", paper: "#faf3e7", accent: "#9c3e2e", soft: "#efcbb3", box: "#c8a37b", scene: "The writing desk" },
  "berry-letter": { name: "Berry Letter", description: "Strawberry ribbons & love-letter pink.", paper: "#fcf3ed", accent: "#a43d50", soft: "#efd0d4", box: "#deabb2", scene: "The bedside table" },
  "buttercup-picnic": { name: "Buttercup Picnic", description: "Butter yellow & a patch of gingham.", paper: "#fff9df", accent: "#59683b", soft: "#dbe1bf", box: "#e3cb78", scene: "The picnic blanket" },
  "cloud-ribbon": { name: "Cloud Ribbon", description: "Blue postage & a ribbon of sky.", paper: "#f1f7f8", accent: "#3c607d", soft: "#d1e0eb", box: "#adc9dc", scene: "The window-side scrapbook" },
  "proper-retro": { name: "Proper Retro", description: "Postal ephemera, warm print ink & a whole analog world.", paper: "#e8d7b5", accent: "#9d3826", soft: "#d19a45", box: "#a85a32", scene: "The postal-room listening den" },
};
export const DRAWING_COLORS = ["#42342c", "#a43d50", "#c88632", "#59683b", "#3c607d", "#946d94"];
export const RESERVED_SLUGS = new Set(["admin", "api", "dashboard", "create", "login", "sign-in", "sign-up", "settings", "hamper", "website", "www", "new", "edit"]);
