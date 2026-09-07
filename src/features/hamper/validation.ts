import { DRAWING_COLORS, HAMPER_ITEM_REGISTRY, HAMPER_LIMITS, HAMPER_THEMES, RESERVED_SLUGS } from "./config";
import type { DrawingStroke, HamperContent, HamperItem, HamperTheme, ItemType } from "./types";

export class ValidationError extends Error { constructor(message: string) { super(message); this.name = "ValidationError"; } }
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ValidationError("This hamper needs a little more information.");
  return value as Record<string, unknown>;
}
export function string(value: unknown, max: number, required = false): string {
  if (value === undefined && !required) return "";
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new ValidationError(`Please use ${required ? "1–" : "up to "}${max} characters.`);
  return value.trim();
}
export function safeUrl(value: unknown) {
  const raw = string(value, 2048, true);
  let url: URL;
  try { url = new URL(raw); } catch { throw new ValidationError("Please enter a complete HTTPS link."); }
  const h = url.hostname.toLowerCase().replace(/\.$/, "");
  if (url.protocol !== "https:" || url.username || url.password || url.port && url.port !== "443" || !h.includes(".") ||
    h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal") ||
    /^[\d.]+$/.test(h) || h.includes(":")) throw new ValidationError("Use a public HTTPS link without a username or password.");
  return url.href;
}
export function videoEmbed(value: unknown) {
  const url = new URL(safeUrl(value));
  const host = url.hostname.toLowerCase();
  if (["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"].includes(host)) {
    const id = host === "youtu.be" ? url.pathname.slice(1) : url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)$/)?.[1];
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
    const match = url.pathname.match(/^\/(?:video\/)?(\d{5,12})(?:\/([a-zA-Z0-9]+))?$/);
    if (match) return `https://player.vimeo.com/video/${match[1]}${match[2] ? `?h=${match[2]}` : ""}`;
  }
  throw new ValidationError("Choose a YouTube or Vimeo video link.");
}
export function musicEmbed(value: string): string | undefined {
  const url = new URL(safeUrl(value));
  if (url.hostname === "open.spotify.com") {
    const match = url.pathname.match(/^\/(?:intl-[a-z]+\/)?(track|album|playlist)\/([a-zA-Z0-9]+)$/);
    if (match) return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
  }
  if (url.hostname === "music.apple.com") return `https://embed.music.apple.com${url.pathname}${url.search}`;
  try { return videoEmbed(value); } catch { return undefined; }
}
export function validateSlug(value: unknown) {
  const slug = string(value, 48, true);
  if (slug.length < 3 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || RESERVED_SLUGS.has(slug)) throw new ValidationError("Choose 3–48 lowercase letters, numbers or hyphens, outside reserved names.");
  return slug;
}
export function suggestSlug(name: string, suffix = crypto.randomUUID().slice(0, 6)) { return `${name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30).replace(/-$/, "") || "for-you"}-${suffix}`; }
export function validateStrokes(value: unknown): DrawingStroke[] {
  if (!Array.isArray(value) || !value.length || value.length > HAMPER_LIMITS.maxStrokes) throw new ValidationError("Draw something small and lovely (up to 200 strokes).");
  let points = 0;
  return value.map(v => {
    const s = record(v);
    if (!DRAWING_COLORS.includes(String(s.color)) || ![2, 5, 9].includes(Number(s.width)) || !Array.isArray(s.points) || !s.points.length) throw new ValidationError("This drawing could not be read.");
    points += s.points.length;
    if (points > HAMPER_LIMITS.maxPoints) throw new ValidationError("This drawing is full. Undo a few strokes to keep going.");
    return { color: s.color as string, width: Number(s.width), points: s.points.map(p => {
      if (!Array.isArray(p) || p.length !== 2 || p.some(n => typeof n !== "number" || !Number.isFinite(n) || n < 0 || n > 1000)) throw new ValidationError("A drawing point is outside the paper.");
      return [p[0], p[1]] as [number, number];
    }) };
  });
}
export function validateItem(value: unknown, position = 0): HamperItem {
  const item = record(value);
  if (typeof item.type !== "string" || !Object.hasOwn(HAMPER_ITEM_REGISTRY, item.type)) throw new ValidationError("Choose one of the ten keepsakes.");
  const type = item.type as ItemType, definition = HAMPER_ITEM_REGISTRY[type];
  const id = string(item.id, 36, true);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new ValidationError("This item needs a valid ID.");
  const input = record(item.payload), payload: Record<string, unknown> = {};
  for (const f of definition.fields) {
    const value = string(input[f.key], f.max, f.required);
    if (value) payload[f.key] = f.kind === "url" ? safeUrl(value) : value;
    if (value && f.kind === "date") {
      const parsed = new Date(`${value}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new ValidationError("Choose a valid expiry date.");
    }
  }
  if (type === "video") {
    const embed = videoEmbed(payload.url);
    payload.url = embed.includes("youtube-nocookie") ? `https://www.youtube.com/watch?v=${embed.split("/").pop()}` : String(payload.url);
  }
  if (type === "location" && payload.url) {
    const url = new URL(String(payload.url));
    // Places shared from the Google app use an opaque share.google shortlink.
    // Keep the original URL for the recipient; never crawl its redirect here.
    const googleAppShare = url.hostname === "share.google" && /^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname);
    if (!(googleAppShare || url.hostname === "maps.app.goo.gl" || url.hostname === "maps.google.com" || (["google.com", "www.google.com"].includes(url.hostname) && url.pathname.startsWith("/maps")) || url.hostname === "goo.gl" && url.pathname.startsWith("/maps"))) throw new ValidationError("Use a Google Maps or Google sharing link.");
  }
  if (definition.media) payload.assetId = string(input.assetId, 36, true);
  if (definition.drawing) payload.strokes = validateStrokes(input.strokes);
  const visualVariant = string(input.visualVariant, 40);
  if (visualVariant && !definition.variants.some(variant => variant.id === visualVariant)) throw new ValidationError("Choose an available object appearance.");
  if (visualVariant) payload.visualVariant = visualVariant;
  return { id, type, position, payload, assetBytes: 0 } as HamperItem;
}
export function validateContent(value: unknown, publish = false): HamperContent {
  const h = record(value);
  const recipient = string(h.recipient, 80, publish), sender = string(h.sender, 80, publish), message = string(h.message, 500);
  if (typeof h.theme !== "string" || !Object.hasOwn(HAMPER_THEMES, h.theme) || !["burst", "scene"].includes(String(h.openingStyle))) throw new ValidationError("Choose a wrapping and opening style.");
  if (!Array.isArray(h.items)) throw new ValidationError("This hamper needs a list of keepsakes.");
  if (h.items.length > HAMPER_LIMITS.maxItemsPerHamper) throw new ValidationError(`This hamper can hold up to ${HAMPER_LIMITS.maxItemsPerHamper} items.`);
  if (publish && !h.items.length) throw new ValidationError(`Tuck in between 1 and ${HAMPER_LIMITS.maxItemsPerHamper} items before publishing.`);
  const counts = new Map<ItemType, number>(), ids = new Set<string>();
  const items = h.items.map((value, index) => {
    const item = validateItem(value, index), count = (counts.get(item.type) || 0) + 1;
    if (count > HAMPER_ITEM_REGISTRY[item.type].max) throw new ValidationError(`This hamper can hold up to ${HAMPER_ITEM_REGISTRY[item.type].max} ${HAMPER_ITEM_REGISTRY[item.type].label.toLowerCase()} items.`);
    if (ids.has(item.id)) throw new ValidationError("Each keepsake needs its own ID.");
    ids.add(item.id); counts.set(item.type, count); return item;
  });
  return { recipient, sender, message, theme: h.theme as HamperTheme, openingStyle: h.openingStyle as "burst" | "scene", items };
}
export function validateFile(kind: "photo" | "voice", size: number, mime: string) {
  const allowed = kind === "photo" ? ["image/jpeg", "image/png", "image/webp"] : ["audio/mpeg", "audio/mp4", "audio/ogg", "audio/webm", "audio/wav", "audio/x-wav"];
  if (!allowed.includes(mime.split(";")[0])) throw new ValidationError(kind === "photo" ? "Choose a JPEG, PNG or WebP photo." : "Choose MP3, M4A, OGG, WebM or WAV audio.");
  if (!Number.isInteger(size) || size <= 0 || size > (kind === "photo" ? HAMPER_LIMITS.maxImageBytes : HAMPER_LIMITS.maxAudioBytes)) throw new ValidationError(`${kind === "photo" ? "Photos need to be under 5 MB" : "Voice messages need to be under 2 MB"}.`);
}
