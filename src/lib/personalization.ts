import { MEMORY_QUESTIONS } from './questions';
import type { MemoryKey } from './types';

import { resolveMemoryKey } from './questionIds';
export { MEMORY_FIELDS, resolveMemoryKey, type MemoryField } from './questionIds';

export function recipientQuestion(field: unknown): string | undefined {
  const key = resolveMemoryKey(field);
  return MEMORY_QUESTIONS.find(q => q.key === key)?.recipientQuestion;
}

export interface PersonalAnswer { key: MemoryKey; question: string; answer: string }
/** Legacy records may store the original schema key in id rather than key. */
export function personalAnswers(memories: readonly { key?: unknown; id?: unknown; answer?: unknown; skipped?: boolean }[]): PersonalAnswer[] {
  const seen = new Set<MemoryKey>();
  return memories.flatMap(memory => {
    const key = resolveMemoryKey(memory.key) ?? resolveMemoryKey(memory.id);
    const question = recipientQuestion(key);
    if (!key || !question || seen.has(key) || memory.skipped || typeof memory.answer !== 'string' || !memory.answer.trim()) return [];
    seen.add(key);
    return [{ key, question, answer: memory.answer }];
  });
}
