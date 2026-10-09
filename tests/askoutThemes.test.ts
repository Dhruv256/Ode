import { statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ASK_OUT_THEMES, MINI_GAMES, funnyDayOptions, funnyTimeOptions } from "../src/features/askout/config";
import { ASK_OUT_VOICE, interestCallbacks, suggestedCopy } from "../src/features/askout/copy";
import { EMPTY_ASK_OUT, type AskOutContent } from "../src/features/askout/types";
import { validateAskOut } from "../src/features/askout/validation";

describe("Ask Out theme system", () => {
  it("ships exactly five distinct worlds with four curated defaults each", () => {
    const themes = Object.entries(ASK_OUT_THEMES);
    expect(themes).toHaveLength(5);
    expect(new Set(themes.map(([, theme]) => theme.asset)).size).toBe(5);
    expect(new Set(themes.map(([, theme]) => theme.exampleFlow)).size).toBe(5);

    for (const [themeId, theme] of themes) {
      expect(theme.interactions).toHaveLength(4);
      expect(new Set(theme.interactions).size).toBe(4);
      for (const interactionId of theme.interactions) {
        expect(MINI_GAMES.find(item => item.id === interactionId)?.themes).toContain(themeId);
      }
    }
  });

  it("keeps generated art lightweight for mobile delivery", () => {
    for (const theme of Object.values(ASK_OUT_THEMES)) {
      const asset = resolve(process.cwd(), "public", theme.asset.replace(/^\//, ""));
      const size = statSync(asset).size;
      expect(size).toBeGreaterThan(10_000);
      expect(size).toBeLessThan(250_000);
    }
  });

  it("rejects cross-theme and oversized interaction sets", () => {
    expect(() => validateAskOut({ ...EMPTY_ASK_OUT, miniGames: ["cat-pet"] })).toThrow("belong to this theme");
    expect(() => validateAskOut({
      ...EMPTY_ASK_OUT,
      theme: "magical-message",
      miniGames: ["owl-catch", "envelope-open", "wand-trail", "floating-note", "seal-break", "page-flip"],
    })).toThrow("up to five");
  });

  it("defaults playful mode off and normalizes unknown intensity safely", () => {
    const value = validateAskOut({ ...EMPTY_ASK_OUT, playfulJourney: true, playfulIntensity: "unexpected" });
    expect(EMPTY_ASK_OUT.playfulJourney).toBe(false); expect(value.playfulJourney).toBe(true); expect(value.playfulIntensity).toBe("mischievous");
  });

  it("writes each theme in a distinct voice with clear semantic logistics", () => {
    expect(new Set(Object.values(ASK_OUT_VOICE).map(voice => voice.storyTitle)).size).toBe(5);
    for (const theme of Object.keys(ASK_OUT_THEMES) as Array<keyof typeof ASK_OUT_THEMES>) {
      const days = funnyDayOptions("Sunday", 0, theme), times = funnyTimeOptions("19:00", theme);
      expect(days).toHaveLength(3); expect(days.every(option => option.label.includes("Sunday") || option.label.includes("Saturday") || option.label.includes("Monday"))).toBe(true);
      expect(times).toHaveLength(3); expect(times.every(option => option.value === "19:00")).toBe(true);
    }
  });

  it("personalizes writer-room suggestions without leaking placeholders", () => {
    const content: AskOutContent = { ...EMPTY_ASK_OUT, recipientName:"Anoli", recipientTag:"@anoli", creatorName:"Dhruv", interests:["cats","coffee"] };
    const result = suggestedCopy(content, "funnier");
    expect(JSON.stringify(result)).toContain("anoli"); expect(JSON.stringify(result)).toContain("Dhruv"); expect(JSON.stringify(result)).not.toMatch(/\{(?:tag|recipient|creator)\}/);
    expect(interestCallbacks(content)).toHaveLength(2);
  });
});
