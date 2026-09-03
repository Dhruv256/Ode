import { describe, expect, it } from "vitest";
import { HAMPER_LIMITS, HAMPER_ITEM_REGISTRY, ITEM_TYPES } from "../src/features/hamper/config";
import { musicEmbed, safeUrl, suggestSlug, validateContent, validateFile, validateItem, validateSlug, videoEmbed } from "../src/features/hamper/validation";
import { nextOpeningStage } from "../src/features/hamper/recipient/opening";
import { fixtureHamper, fixtureItem } from "./fixtures";
describe("hamper validation", () => {
  it("suggests a valid stable-suffix slug even at a word boundary", () => { const slug = suggestSlug(`${"a".repeat(29)} b`, "abcdef"); expect(validateSlug(slug)).toBe(slug); });
  it.each(ITEM_TYPES)("accepts and strips untrusted fields from %s", type => {
    const input = { ...fixtureItem(type), assetBytes: 999999, owner_id: "attacker", payload: { ...fixtureItem(type).payload, secret: "no" } };
    const item = validateItem(input); expect(item.type).toBe(type); expect(item.assetBytes).toBe(0); expect(item).not.toHaveProperty("owner_id"); expect(item.payload).not.toHaveProperty("secret");
  });
  it.each(["javascript:alert(1)", "data:text/plain,hi", "file:///tmp", "ftp://example.com", "http://example.com", "https://localhost", "https://127.0.0.1", "https://2130706433", "https://[::1]", "https://user:pass@example.com", "https://example.local", "https://example.com:444/"])("rejects unsafe URL %s", value => expect(() => safeUrl(value)).toThrow());
  it("allows any public HTTPS gift host without fetching it", () => expect(safeUrl("https://a-small-independent-shop.example/gift?q=1")).toContain("independent"));
  it.each(["https://share.google/aGoogleMapsShare123", "https://share.google/aGoogleMapsShare123?utm_source=share", "https://maps.app.goo.gl/aMapsShare123", "https://www.google.com/maps/place/Example"])("preserves supported location link %s through item and save validation", url => {
    const item = { ...fixtureItem("location"), payload: { place: "Our meeting place", url } };
    expect(validateItem(item).payload).toMatchObject({ url });
    expect(validateContent({ ...fixtureHamper(), items: [item] }, true).items[0].payload).toMatchObject({ url });
  });
  it.each(["https://share.google.evil.example/place", "https://evil.example/share.google/place", "http://share.google/place", "https://share.google@evil.example/place", "https://share.google/"])("rejects invalid location sharing link %s", url => {
    expect(() => validateItem({ ...fixtureItem("location"), payload: { place: "Our meeting place", url } })).toThrow();
  });
  it.each(["https://evil.example/video", "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ", "https://youtu.be/not-an-id"])("rejects unsupported video %s", value => expect(() => videoEmbed(value)).toThrow());
  it("normalizes safe providers", () => { expect(videoEmbed("https://youtu.be/dQw4w9WgXcQ?t=4")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"); expect(videoEmbed("https://vimeo.com/12345678")).toBe("https://player.vimeo.com/video/12345678"); expect(musicEmbed("https://music.apple.com/us/album/example/1234")).toContain("embed.music.apple.com"); });
  it.each(["admin", "api", "ab", "A-name", "a--b", "a".repeat(49), "../hello"])("rejects slug %s", slug => expect(() => validateSlug(slug)).toThrow());
  it("enforces source image/audio limits and rejects video uploads", () => {
    expect(() => validateFile("photo", HAMPER_LIMITS.maxImageBytes + 1, "image/jpeg")).toThrow("5 MB");
    expect(() => validateFile("voice", HAMPER_LIMITS.maxAudioBytes + 1, "audio/webm")).toThrow("2 MB");
    expect(() => validateFile("photo", 100, "video/mp4")).toThrow();
    expect(() => validateFile("photo", 100, "image/svg+xml")).toThrow();
  });
  it.each(ITEM_TYPES)("enforces %s count", type => { const h = fixtureHamper(); h.items = Array.from({ length: HAMPER_ITEM_REGISTRY[type].max + 1 }, (_, i) => fixtureItem(type, i)); expect(() => validateContent(h)).toThrow("hold up to"); });
  it("enforces total count, unique IDs, and required published content", () => {
    const h = fixtureHamper(); expect(() => validateContent({ ...h, items: Array(31).fill(h.items[0]) })).toThrow();
    expect(() => validateContent({ ...h, items: [h.items[0], h.items[0]] })).toThrow("own ID");
    expect(() => validateContent({ ...h, items: [] }, true)).toThrow(); expect(() => validateContent({ ...h, recipient: "" }, true)).toThrow();
  });
  it("requires three explicit activations and ignores busy input", () => { let stage = nextOpeningStage(0, false); expect(stage).toBe(1); expect(nextOpeningStage(stage, true)).toBe(1); stage = nextOpeningStage(stage, false); expect(stage).toBe(2); stage = nextOpeningStage(stage, false); expect(stage).toBe(3); expect(nextOpeningStage(stage, false)).toBe(3); });
});
