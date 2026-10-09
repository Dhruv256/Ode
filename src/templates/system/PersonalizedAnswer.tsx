"use client";

import { useRef, type ReactNode } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { MEMORY_FIELDS, resolveMemoryKey, recipientQuestion, type MemoryField, type PersonalAnswer } from '@/lib/personalization';
import type { MemoryKey } from '@/lib/types';
import type { RenderCtx } from './types';

/** An inline story annotation: the template still owns its type, frame and placement. */
export function PersonalizedAnswer({ field, children }: { field?: MemoryField | MemoryKey; children: ReactNode }) {
  const ref=useRef<HTMLSpanElement>(null);
  const entered=useInView(ref,{once:true,amount:'some',margin:'0px 0px -32px 0px'});
  const reduced=useReducedMotion();
  const question = recipientQuestion(field);
  if (!field || !question) return <>{children}</>;
  return <span ref={ref} className="tp-personal-answer" data-personalization-key={resolveMemoryKey(field)} data-context-entered={Boolean(reduced||entered)}>
    <span className="tp-question">{question}</span>
    <span className="tp-answer">{children}</span>
  </span>;
}

export function memorySlides(ctx: RenderCtx, fields: readonly MemoryField[]): PersonalAnswer[] {
  return fields.flatMap(field => {
    const answer = ctx.memories[field];
    const question = recipientQuestion(field);
    return answer && question ? [{ key: MEMORY_FIELDS[field], question, answer }] : [];
  });
}
