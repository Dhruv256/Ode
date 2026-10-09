"use client";

import { useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { MESSAGE_MODES, messagePace, messageTokens } from './message';
import type { TemplateId } from '@/lib/types';

/** Text alone owns its timeline, independent of the enclosing scene entrance. */
export function MessageReveal({ text, template, enabled = true }: { text: string; template: TemplateId; enabled?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const entered = useInView(ref, { once:true, amount:'some', margin:'0px 0px -32px 0px' });
  const reduced = useReducedMotion();
  const mode = MESSAGE_MODES[template];
  const tokens = messageTokens(text, mode);
  const pace = messagePace(mode, tokens.filter(t=>t.trim()).length);
  let index = 0;
  return <span ref={ref} className="tp-message" data-message-mode={mode} data-message-started={Boolean(enabled && (reduced || entered))}>
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">{tokens.map((token,i)=>token.trim() ? <span key={i} className="tp-message-unit" style={{ transitionDelay:reduced ? '0s' : `${.65 + index++ * pace}s` }}>{token}</span> : token)}</span>
  </span>;
}
