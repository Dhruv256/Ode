import type { MemoryKey } from './types';

/** Original schema keys and renderer aliases. These never depend on answer text. */
export const MEMORY_FIELDS = {
  oneSentence: 'one-sentence', threeWords: 'three-words', thingsTheyLove: 'things-they-love',
  place: 'favorite-place', song: 'favorite-song', movie: 'favorite-movie', insideJoke: 'inside-joke',
  alwaysSays: 'always-says', obsession: 'current-obsession', knownFor: 'known-for',
  memory: 'unforgettable-memory', message: 'birthday-message', ending: 'ending-line',
} as const satisfies Record<string, MemoryKey>;
export type MemoryField = keyof typeof MEMORY_FIELDS;
export function resolveMemoryKey(field: unknown): MemoryKey | undefined {
  if (typeof field !== 'string') return undefined;
  if (Object.values(MEMORY_FIELDS).some(key=>key===field)) return field as MemoryKey;
  return Object.hasOwn(MEMORY_FIELDS,field) ? MEMORY_FIELDS[field as MemoryField] : undefined;
}
