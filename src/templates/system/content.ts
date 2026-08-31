import type { RenderCtx } from "./types";
import type { MemoryKey } from "@/lib/types";

export type ContentModule = "caption" | "pullquote" | "note" | "label" | "secret" | "intertitle" | "window" | "archive";

export interface StoryItem {
  key: string;
  label: string;
  value: string;
  module: ContentModule;
}

const RAW: Array<[keyof RenderCtx["memories"], string]> = [
  ["oneSentence", "IN ONE LINE"], ["threeWords", "THREE WORDS"], ["thingsTheyLove", "THEY LOVE"],
  ["place", "FAVOURITE PLACE"], ["song", "FAVOURITE SONG"], ["movie", "FAVOURITE FILM"],
  ["insideJoke", "INSIDE JOKE"], ["alwaysSays", "ALWAYS SAYS"], ["obsession", "CURRENT OBSESSION"],
  ["knownFor", "KNOWN FOR"], ["memory", "ONE MEMORY"],
];

const KEY_TO_MEMORY: Record<MemoryKey, keyof RenderCtx["memories"]> = {
  "one-sentence": "oneSentence",
  "three-words": "threeWords",
  "things-they-love": "thingsTheyLove",
  "favorite-place": "place",
  "favorite-song": "song",
  "favorite-movie": "movie",
  "inside-joke": "insideJoke",
  "always-says": "alwaysSays",
  "current-obsession": "obsession",
  "known-for": "knownFor",
  "unforgettable-memory": "memory",
  "birthday-message": "message",
  "ending-line": "ending",
};

const LABELS: Record<MemoryKey, string> = {
  "one-sentence": "IN ONE LINE",
  "three-words": "THREE WORDS",
  "things-they-love": "THEY LOVE",
  "favorite-place": "FAVOURITE PLACE",
  "favorite-song": "CURRENT ROTATION",
  "favorite-movie": "FAVOURITE FILM",
  "inside-joke": "YOU HAD TO BE THERE",
  "always-says": "ALWAYS SAYS",
  "current-obsession": "CURRENT OBSESSION",
  "known-for": "KNOWN FOR",
  "unforgettable-memory": "ONE MEMORY",
  "birthday-message": "A LETTER",
  "ending-line": "LAST WORD",
};

/** Low-level content lookup. Templates still own placement and composition. */
export function storyFor(ctx: RenderCtx, order: readonly MemoryKey[]) {
  return order.flatMap((key) => {
    const value = ctx.memories[KEY_TO_MEMORY[key]];
    return value ? [{ key, label: LABELS[key], value }] : [];
  });
}

const MAP: Record<RenderCtx["id"], ContentModule[]> = {
  "contact-sheet": ["caption", "label", "note", "caption", "label", "caption", "secret", "note", "label", "caption", "pullquote"],
  "cut-and-paste": ["note", "label", "note", "label", "caption", "caption", "secret", "note", "label", "pullquote", "note"],
  "cover-star": ["pullquote", "intertitle", "caption", "caption", "label", "caption", "secret", "pullquote", "label", "intertitle", "pullquote"],
  cinema: ["intertitle", "intertitle", "caption", "caption", "intertitle", "caption", "secret", "intertitle", "label", "pullquote", "intertitle"],
  "internet-person": ["window", "window", "window", "label", "window", "window", "secret", "window", "label", "window", "window"],
  archive: ["archive", "archive", "archive", "label", "archive", "archive", "secret", "archive", "label", "archive", "pullquote"],
  "after-dark": ["intertitle", "label", "caption", "caption", "label", "caption", "secret", "pullquote", "label", "intertitle", "pullquote"],
  "sunday-morning": ["pullquote", "note", "note", "caption", "caption", "caption", "secret", "note", "caption", "pullquote", "pullquote"],
  "polaroid-wall": ["caption", "note", "caption", "label", "caption", "caption", "secret", "note", "label", "caption", "pullquote"],
  dreamscape: ["intertitle", "note", "label", "caption", "caption", "label", "secret", "note", "label", "intertitle", "pullquote"],
  "poster-city": ["intertitle", "intertitle", "caption", "label", "caption", "caption", "secret", "pullquote", "label", "intertitle", "pullquote"],
  yearbook: ["caption", "label", "caption", "caption", "label", "caption", "secret", "note", "label", "caption", "pullquote"],
};

/** Deterministic content casting: templates get a coherent, non-random story beat sequence. */
export function distributeContent(ctx: RenderCtx): StoryItem[] {
  const modules = MAP[ctx.id];
  const story: StoryItem[] = RAW.flatMap(([key, label], index) => {
    const value = ctx.memories[key];
    return value ? [{ key, label, value, module: modules[index] }] : [];
  });

  // Interests already seed small visual motifs. They also deserve a visible
  // place in the story, so a creator never supplies words that only affect
  // styling behind the scenes.
  if (ctx.interests.length > 0) {
    story.splice(Math.min(3, story.length), 0, {
      key: "interests",
      label: "CURRENTLY INTO",
      value: ctx.interests.join(" / "),
      module: modules[2],
    });
  }

  return story;
}

export const STORY_LABEL: Record<RenderCtx["id"], string> = {
  "contact-sheet": "NOTES FROM THE ROLL", "cut-and-paste": "THINGS THAT STUCK", "cover-star": "THE COVER STORY",
  cinema: "SCENES WE KEPT", "internet-person": "OPEN FILES", archive: "UNCATALOGUED DETAILS", "after-dark": "AFTER THE FLASH",
  "sunday-morning": "SMALL THINGS, KEPT", "polaroid-wall": "WRITTEN ON THE BACK", dreamscape: "THINGS THAT RETURN",
  "poster-city": "PASTED INTO THE CITY", yearbook: "SIGNED IN THE MARGINS",
};
