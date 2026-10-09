"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CAROUSEL_AUTOPLAY_MS } from "@/lib/birthdayCapabilities";
import { MOTION, useTemplateMotion } from "./motion";
import { TEMPLATE_FRAMES } from './frames';
import { PhotoFrameContext } from './PhotoFrameContext';
import type { PersonalAnswer } from '@/lib/personalization';
import { PersonalizedAnswer } from './PersonalizedAnswer';

export type CarouselKind = "film" | "editorial" | "fade" | "vertical" | "stack" | "window" | "orbit" | "poster" | "spread";

const initialByKind: Record<CarouselKind, { opacity: number; x?: number; y?: number; scale?: number; rotateY?: number; rotateZ?: number }> = {
  film: { opacity: .45, x: 28 },
  editorial: { opacity: .4, rotateY: 8 },
  fade: { opacity: .2, scale: .98 },
  vertical: { opacity: .35, y: 24 },
  stack: { opacity: .35, y: 18, rotateZ: -2 },
  window: { opacity: .4, scale: .96, y: 12 },
  orbit: { opacity: .3, scale: .9, rotateZ: 4 },
  poster: { opacity: .3, rotateY: -9 },
  spread: { opacity: .35, rotateY: 10 },
};

export function AutoCarousel<T>({
  items,
  renderItem,
  getKey,
  kind = "fade",
  visible = 1,
  autoMs = CAROUSEL_AUTOPLAY_MS,
  resumeDelay = 3200,
  className,
  viewportClassName,
  itemClassName,
  controlsClassName,
  label = "Memory carousel",
  showControls = true,
  sizer,
  reading = false,
}: {
  items: readonly T[];
  renderItem: (item: T, index: number, slot: number) => React.ReactNode;
  getKey: (item: T, index: number) => React.Key;
  kind?: CarouselKind;
  visible?: 1 | 2 | 3;
  autoMs?: number;
  resumeDelay?: number;
  className?: string;
  viewportClassName?: string;
  itemClassName?: string;
  controlsClassName?: string;
  label?: string;
  showControls?: boolean;
  sizer?: React.ReactNode;
  reading?: boolean;
}) {
  const reduced = useReducedMotion();
  const {id:templateId} = useTemplateMotion();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [manual, setManual] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [visibleOnScreen, setVisibleOnScreen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const root = useRef<HTMLElement>(null);
  const paused = hovered || focused || manual || interacting || hidden || !visibleOnScreen;
  const pointerStart = useRef<number | null>(null);
  const resumeTimer = useRef<number>();
  const count = items.length;
  const shown = Math.min(visible, Math.max(1, count));
  // Photo rhythm stays fixed; question/answer slides need time to be read.
  const effectiveAutoMs = reading ? autoMs : CAROUSEL_AUTOPLAY_MS;

  const next = useCallback(() => setActive((value) => count ? (value + 1) % count : 0), [count]);
  const previous = useCallback(() => setActive((value) => count ? (value - 1 + count) % count : 0), [count]);

  useEffect(() => {
    if (count < 2 || paused || reduced) return;
    const interval = window.setInterval(next, effectiveAutoMs);
    return () => window.clearInterval(interval);
  }, [effectiveAutoMs, count, next, paused, reduced]);

  useEffect(()=>{const node=root.current;if(!node)return;const observer=new IntersectionObserver(([entry])=>setVisibleOnScreen(entry.isIntersecting),{threshold:.2});observer.observe(node);const visibility=()=>setHidden(document.hidden);visibility();document.addEventListener("visibilitychange",visibility);return()=>{observer.disconnect();document.removeEventListener("visibilitychange",visibility);};},[]);

  useEffect(() => () => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
  }, []);

  const slots = useMemo(() => Array.from({ length: shown }, (_, slot) => {
    const index = count ? (active + slot) % count : 0;
    return { item: items[index], index, slot };
  }), [active, count, items, shown]);

  if (!count) return null;

  const pauseTemporarily = () => {
    // A reader's explicit interaction cannot be undone by a hover/blur timeout.
    setManual(true);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerStart.current = event.clientX;
    setInteracting(true);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    setInteracting(false);
    if (start !== null) {
      const delta = event.clientX - start;
      if (Math.abs(delta) > 36) delta > 0 ? previous() : next();
    }
    pauseTemporarily();
  };

  return <section
    ref={root}
    className={cn("tp-auto-carousel", className)}
    aria-roledescription="carousel"
    aria-label={label}
    data-carousel-count={count}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={(event) => {
      if((event.target as HTMLElement).closest('.tp-auto-carousel')!==event.currentTarget || (event.target as HTMLElement).matches('input,textarea,select'))return;
      if (event.key === "ArrowRight") { event.preventDefault(); next(); pauseTemporarily(); }
      if (event.key === "ArrowLeft") { event.preventDefault(); previous(); pauseTemporarily(); }
    }}
  >
    <div
      className={cn("tp-carousel-viewport touch-pan-y", viewportClassName)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { pointerStart.current = null; setInteracting(false); }}
      style={sizer ? {display:"grid"} : undefined}
    >
      {sizer && <div aria-hidden="true" className="invisible pointer-events-none" style={{gridArea:"1 / 1"}}>{sizer}</div>}
      <PhotoFrameContext.Provider value={TEMPLATE_FRAMES[templateId].repeated}><div style={sizer ? {gridArea:"1 / 1",alignSelf:"center"} : undefined} className={cn("tp-carousel-track grid gap-[var(--image-gap)]", shown === 2 && "grid-cols-2", shown === 3 && "grid-cols-3", kind === "vertical" && "grid-cols-1")}>
        {slots.map(({ item, index, slot }) => <motion.div
          key={`${getKey(item, index)}-${active}-${slot}`}
          initial={reduced ? false : initialByKind[kind]}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotateY: 0, rotateZ: kind === "stack" ? (slot - 1) * 1.5 : 0 }}
          transition={{ duration: reduced ? 0 : MOTION.carousel, ease: MOTION.entrance }}
          className={cn("min-w-0", itemClassName)}
          aria-hidden={slot > 0 ? undefined : false}
        >{renderItem(item, index, slot)}</motion.div>)}
      </div></PhotoFrameContext.Provider>
    </div>
    {showControls && count > 1 ? <div role="group" aria-label={`${label} controls`} className={cn("mt-4 flex items-center justify-between gap-4", controlsClassName)}>
      <button type="button" onClick={() => { previous(); pauseTemporarily(); }} aria-label="Previous item" className="tp-carousel-control">←</button>
      <span className="font-mono text-[10px] uppercase tracking-widest2" aria-live={manual ? "polite" : "off"}>{String(active % count + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
      {!reduced && <button type="button" className="tp-carousel-play" onClick={()=>setManual(value=>!value)} aria-label={manual ? "Play slideshow" : "Pause slideshow"}>{manual ? "Play" : "Pause"}</button>}
      <button type="button" onClick={() => { next(); pauseTemporarily(); }} aria-label="Next item" className="tp-carousel-control">→</button>
    </div> : null}
  </section>;
}

export function TextCarousel({ items, kind = "vertical", className, autoMs = CAROUSEL_AUTOPLAY_MS, label = "Rotating words" }: { items: readonly PersonalAnswer[]; kind?: CarouselKind; className?: string; autoMs?: number; label?: string }) {
  const words=items.filter(item=>item.answer.trim() && item.question);
  if(!words.length)return null;
  // Reserve enough time for the longest pair; controls/hover/focus let readers linger.
  const readingMs=Math.max(5000,autoMs,...words.map(item=>1200+item.answer.split(/\s+/).length*350));
  return <div data-creator-values={JSON.stringify(words.map(item=>item.answer))}><AutoCarousel items={words} getKey={item=>item.key} renderItem={item=><p data-long-copy={item.answer.length>160||undefined}><PersonalizedAnswer field={item.key}>{item.answer}</PersonalizedAnswer></p>} kind={kind} visible={1} autoMs={readingMs} reading className={cn("tp-text-carousel",className)} label={label} sizer={<div className="grid">{words.map(item=><p key={item.key} data-long-copy={item.answer.length>160||undefined} style={{gridArea:"1 / 1"}}><span className="tp-question">{item.question}</span><span className="tp-answer">{item.answer}</span></p>)}</div>} /></div>;
}
