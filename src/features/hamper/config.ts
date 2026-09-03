import type { HamperTheme, ItemType } from "./types";

export const HAMPER_LIMITS = {
  maxActiveHampersPerUser: 10, maxItemsPerHamper: 30,
  maxImageBytes: 5 * 1024 * 1024, maxAudioBytes: 2 * 1024 * 1024,
  maxTotalAssetBytesPerHamper: 25 * 1024 * 1024, maxTotalHamperAssetBytesPerUser: 200 * 1024 * 1024,
  maxRecordingSeconds: 90, maxStrokes: 200, maxPoints: 12000,
} as const;
export type ItemField = { key: string; label: string; max: number; required?: boolean; multiline?: boolean; kind?: "url" | "date" };
export type ItemDefinition = { label: string; object: string; max: number; path: string; fields: ItemField[]; media?: "photo" | "voice"; drawing?: boolean };
export const HAMPER_ITEM_REGISTRY: Record<ItemType, ItemDefinition> = {
  note: { label: "Note", object: "A folded letter", max: 10, path: "M4 6h24v20H4z M4 7l12 10L28 7", fields: [{ key: "title", label: "Little title", max: 80 }, { key: "body", label: "Your note", max: 1500, required: true, multiline: true }] },
  photo: { label: "Photo", object: "A photo print", max: 10, path: "M5 3h22v26H5z M8 6h16v16H8z M9 20l5-7 4 4 3-3 3 6", media: "photo", fields: [{ key: "caption", label: "Caption", max: 300 }] },
  song: { label: "Song", object: "A little record", max: 5, path: "M29 16a13 13 0 1 1-26 0 13 13 0 0 1 26 0 M20 16a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M6 16a10 10 0 0 1 10-10", fields: [{ key: "url", label: "Song URL", max: 2048, required: true, kind: "url" }, { key: "title", label: "Song title", max: 80 }] },
  video: { label: "Video", object: "A miniature screen", max: 5, path: "M3 7h26v19H3z M7 11h18v11H7z M12 2l4 5 5-5 M14 13l6 4-6 3z", fields: [{ key: "url", label: "YouTube or Vimeo URL", max: 2048, required: true, kind: "url" }, { key: "caption", label: "Caption", max: 300 }] },
  voice: { label: "Voice", object: "A voice recorder", max: 5, path: "M7 3h18v26H7z M11 7h10v7H11z M12 21h1 M19 21h1 M12 10h8", media: "voice", fields: [{ key: "title", label: "Voice note title", max: 80 }] },
  drawing: { label: "Drawing", object: "A sketchbook", max: 5, path: "M7 4h20v25H7z M3 8h7 M3 14h7 M3 20h7 M13 21l2-6L25 5l4 4-10 10z", drawing: true, fields: [{ key: "caption", label: "Caption", max: 300 }] },
  gift: { label: "Gift", object: "A wrapped present", max: 5, path: "M4 12h24v6H4z M6 18v11h20V18 M16 12v17 M16 12C2 11 8-2 16 12 M16 12C30 11 24-2 16 12", fields: [{ key: "url", label: "Gift URL", max: 2048, required: true, kind: "url" }, { key: "note", label: "A note with your gift", max: 500, multiline: true }] },
  location: { label: "Location", object: "A folded map", max: 5, path: "M3 7l9-4 9 4 8-4v22l-8 4-9-4-9 4z M12 3v22 M21 7v22 M6 18l4-4 6 4 9-9", fields: [{ key: "place", label: "Place name", max: 120, required: true }, { key: "url", label: "Google Maps URL (optional)", max: 2048, kind: "url" }, { key: "note", label: "Why this place?", max: 500, multiline: true }] },
  coupon: { label: "Coupon", object: "A keepsake ticket", max: 5, path: "M3 7h26v6a3 3 0 0 0 0 6v6H3v-6a3 3 0 0 0 0-6z M22 7v3 M22 13v3 M22 19v6 M8 12h9 M8 19h9", fields: [{ key: "title", label: "Coupon title", max: 80, required: true }, { key: "description", label: "Description", max: 500, multiline: true }, { key: "code", label: "Code (optional)", max: 80 }, { key: "url", label: "URL (optional)", max: 2048, kind: "url" }, { key: "expiry", label: "Expiry (optional)", max: 10, kind: "date" }] },
  news: { label: "News", object: "A newspaper clipping", max: 5, path: "M4 3h24v26H4z M8 7h16 M8 11h16 M8 15h7v7H8z M19 15h5 M19 19h5 M8 25h16", fields: [{ key: "url", label: "Article URL", max: 2048, required: true, kind: "url" }, { key: "headline", label: "Headline", max: 160 }, { key: "note", label: "A note from you", max: 500, multiline: true }] },
};
export const ITEM_TYPES = Object.keys(HAMPER_ITEM_REGISTRY) as ItemType[];
export const HAMPER_THEMES: Record<HamperTheme, { name: string; description: string; paper: string; accent: string; soft: string; box: string; scene: string }> = {
  "soft-parcel": { name: "Soft Parcel", description: "Cream paper, red stamps & a little care.", paper: "#faf3e7", accent: "#9c3e2e", soft: "#efcbb3", box: "#c8a37b", scene: "The writing desk" },
  "berry-letter": { name: "Berry Letter", description: "Strawberry ribbons & love-letter pink.", paper: "#fcf3ed", accent: "#a43d50", soft: "#efd0d4", box: "#deabb2", scene: "The bedside table" },
  "buttercup-picnic": { name: "Buttercup Picnic", description: "Butter yellow & a patch of gingham.", paper: "#fff9df", accent: "#59683b", soft: "#dbe1bf", box: "#e3cb78", scene: "The picnic blanket" },
  "cloud-ribbon": { name: "Cloud Ribbon", description: "Blue postage & a ribbon of sky.", paper: "#f1f7f8", accent: "#3c607d", soft: "#d1e0eb", box: "#adc9dc", scene: "The window-side scrapbook" },
};
export const DRAWING_COLORS = ["#42342c", "#a43d50", "#c88632", "#59683b", "#3c607d", "#946d94"];
export const RESERVED_SLUGS = new Set(["admin", "api", "dashboard", "create", "login", "sign-in", "sign-up", "settings", "hamper", "website", "www", "new", "edit"]);
