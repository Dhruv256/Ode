import type { RenderCtx } from "./types";

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
