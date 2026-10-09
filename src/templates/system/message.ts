import type { TemplateId } from '@/lib/types';

export type MessageMode = 'develop' | 'paper' | 'editorial' | 'cinematic' | 'terminal' | 'flash' | 'letter' | 'pin' | 'catalogue' | 'drift' | 'poster' | 'signature';
export const MESSAGE_MODES: Record<TemplateId, MessageMode> = {
  'contact-sheet':'develop', 'cut-and-paste':'paper', 'cover-star':'editorial', cinema:'cinematic',
  'internet-person':'terminal', 'after-dark':'flash', 'sunday-morning':'letter', 'polaroid-wall':'pin',
  archive:'catalogue', dreamscape:'drift', 'poster-city':'poster', yearbook:'signature',
};

/** Whitespace remains a literal token: punctuation, emoji and paragraphs are never rebuilt. */
export function messageTokens(text: string, mode: MessageMode) {
  return text.split(mode === 'letter' || mode === 'catalogue' ? /((?<=[.!?])\s+|\n+)/ : /(\s+)/).filter(Boolean);
}
export function messagePace(mode: MessageMode, units: number) {
  const beat = mode === 'cinematic' ? .18 : mode === 'letter' || mode === 'catalogue' ? .65 : mode === 'terminal' ? .09 : .12;
  return Math.min(beat, 12 / Math.max(1, units));
}
