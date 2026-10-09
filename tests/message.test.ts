import { describe, expect, it } from 'vitest';
import { MESSAGE_MODES, messagePace, messageTokens } from '../src/templates/system/message';
import { TEMPLATE_ORDER } from '../src/lib/templates';

describe('personal message choreography',()=>{
  const text='Dear Amara,  thank you!\n\nKeep dreaming. 👩🏽‍🚀 ❤️\nWith love,\tall of us.';
  it('preserves exact whitespace, punctuation and complete emoji sequences in every voice',()=>{
    for(const id of TEMPLATE_ORDER) expect(messageTokens(text,MESSAGE_MODES[id]).join('')).toBe(text);
  });
  it('gives all registered templates their own voice and caps long-message delay',()=>{
    expect(new Set(Object.values(MESSAGE_MODES)).size).toBe(TEMPLATE_ORDER.length);
    expect(messagePace('cinematic',1000)*1000).toBeLessThanOrEqual(12);
    expect(messagePace('cinematic',5)).toBeGreaterThan(messagePace('terminal',5));
  });
});
