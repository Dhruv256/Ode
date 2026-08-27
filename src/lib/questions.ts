import type { MemoryKey } from "./types";

export interface MemoryQuestion {
  key: MemoryKey;
  question: string;
  placeholder?: string;
  multiline: boolean;
}

/**
 * Step 07 — conversational pacing. Every question is optional; the UI
 * renders an explicit "Skip" affordance for each. Order is intentional:
 * light facts first, memories in the middle, the message last.
 */
export const MEMORY_QUESTIONS: MemoryQuestion[] = [
  { key: "one-sentence", question: "Describe them in one sentence.", placeholder: "Go on, one line.", multiline: false },
  { key: "three-words", question: "Three words that describe them.", placeholder: "loud · loyal · always late", multiline: false },
  { key: "things-they-love", question: "Things they love.", placeholder: "rainy day drives, their dog, extra garlic…", multiline: true },
  { key: "favorite-place", question: "Favorite place.", placeholder: "real or imagined", multiline: false },
  { key: "favorite-song", question: "Favorite song.", placeholder: "the one they play every single time", multiline: false },
  { key: "favorite-movie", question: "Favorite movie.", placeholder: "the one they can quote start to finish", multiline: false },
  { key: "inside-joke", question: "An inside joke.", placeholder: "you had to be there — explain it anyway", multiline: true },
  { key: "always-says", question: "Something they always say.", placeholder: "their catchphrase, in their voice", multiline: false },
  { key: "current-obsession", question: "Their current obsession.", placeholder: "this month's hyperfixation", multiline: false },
  { key: "known-for", question: "One thing everyone knows them for.", placeholder: "the thing that is just… Them", multiline: false },
  { key: "unforgettable-memory", question: "A memory you never want to forget.", placeholder: "take your time with this one", multiline: true },
  { key: "birthday-message", question: "Your birthday message.", placeholder: "say it like you'd say it out loud", multiline: true },
  { key: "ending-line", question: "What should the ending say?", placeholder: "the last line they'll read", multiline: false },
];

export const memoryAnswerOf = (
  memories: Array<{ key: MemoryKey; answer: string; skipped: boolean }>,
  key: MemoryKey
): string | undefined => {
  const m = memories.find((mem) => mem.key === key);
  if (!m || m.skipped) return undefined;
  return m.answer.trim() ? m.answer : undefined;
};
