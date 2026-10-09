import { resolveMemoryKey } from "./questionIds";
import type { MemoryKey } from "./types";

export interface MemoryQuestion {
  key: MemoryKey;
  question: string;
  recipientQuestion: string;
  placeholder?: string;
  multiline: boolean;
}

/**
 * Step 07 — conversational pacing. Every question is optional; the UI
 * renders an explicit "Skip" affordance for each. Order is intentional:
 * light facts first, memories in the middle, the message last.
 */
export const MEMORY_QUESTIONS: MemoryQuestion[] = [
  { key: "one-sentence", question: "Describe them in one sentence.", recipientQuestion: "If I had to describe you in one sentence…", placeholder: "Go on, one line.", multiline: false },
  { key: "three-words", question: "Three words that describe them.", recipientQuestion: "Three words that describe you", placeholder: "loud · loyal · always late", multiline: false },
  { key: "things-they-love", question: "Things they love.", recipientQuestion: "Things you love", placeholder: "rainy day drives, their dog, extra garlic…", multiline: true },
  { key: "favorite-place", question: "Favorite place.", recipientQuestion: "Your favourite place", placeholder: "real or imagined", multiline: false },
  { key: "favorite-song", question: "Favorite song.", recipientQuestion: "Your favourite song", placeholder: "the one they play every single time", multiline: false },
  { key: "favorite-movie", question: "Favorite movie.", recipientQuestion: "Your favourite movie", placeholder: "the one they can quote start to finish", multiline: false },
  { key: "inside-joke", question: "An inside joke.", recipientQuestion: "An inside joke between us", placeholder: "you had to be there — explain it anyway", multiline: true },
  { key: "always-says", question: "Something they always say.", recipientQuestion: "Something you always say", placeholder: "their catchphrase, in their voice", multiline: false },
  { key: "current-obsession", question: "Their current obsession.", recipientQuestion: "Your current obsession", placeholder: "this month's hyperfixation", multiline: false },
  { key: "known-for", question: "One thing everyone knows them for.", recipientQuestion: "What everyone knows you for", placeholder: "the thing that is just… Them", multiline: false },
  { key: "unforgettable-memory", question: "A memory you never want to forget.", recipientQuestion: "A memory I never want to forget", placeholder: "take your time with this one", multiline: true },
  { key: "birthday-message", question: "Your birthday message.", recipientQuestion: "A birthday message for you", placeholder: "say it like you'd say it out loud", multiline: true },
  { key: "ending-line", question: "What should the ending say?", recipientQuestion: "One last thing for you", placeholder: "the last line they'll read", multiline: false },
];

export const memoryAnswerOf = (
  memories: Array<{ key?: string; id?: string; answer: string; skipped?: boolean }>,
  key: MemoryKey
): string | undefined => {
  const m = memories.find((mem) => (resolveMemoryKey(mem.key) ?? resolveMemoryKey(mem.id)) === key && !mem.skipped && typeof mem.answer==='string' && mem.answer.trim());
  if (!m || m.skipped) return undefined;
  return m.answer.trim() ? m.answer : undefined;
};
