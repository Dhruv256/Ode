"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CAROUSEL_AUTOPLAY_MS } from "@/lib/birthdayCapabilities";

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
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const resumeTimer = useRef<number>();
  const count = items.length;
  const shown = Math.min(visible, Math.max(1, count));
  // One product-wide rhythm: callers may keep legacy hints, but published
  // birthday carousels advance at the promised 2.5 second cadence.
  const effectiveAutoMs = CAROUSEL_AUTOPLAY_MS;

  const next = useCallback(() => setActive((value) => count ? (value + 1) % count : 0), [count]);
  const previous = useCallback(() => setActive((value) => count ? (value - 1 + count) % count : 0), [count]);

  useEffect(() => {
    if (count < 2 || paused || reduced) return;
    const interval = window.setInterval(next, effectiveAutoMs);
    return () => window.clearInterval(interval);
  }, [effectiveAutoMs, count, next, paused, reduced]);

  useEffect(() => () => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
  }, []);

  const slots = useMemo(() => Array.from({ length: shown }, (_, slot) => {
    const index = count ? (active + slot) % count : 0;
    return { item: items[index], index, slot };
  }), [active, count, items, shown]);

  if (!count) return null;

  const pauseTemporarily = () => {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), resumeDelay);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerStart.current = event.clientX;
    setPaused(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (start !== null) {
      const delta = event.clientX - start;
      if (Math.abs(delta) > 36) delta > 0 ? previous() : next();
    }
    pauseTemporarily();
  };

  return <section
    className={cn("tp-auto-carousel", className)}
    aria-roledescription="carousel"
    aria-label={label}
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
    onFocusCapture={() => setPaused(true)}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
    onKeyDown={(event) => {
      if (event.key === "ArrowRight") { event.preventDefault(); next(); pauseTemporarily(); }
      if (event.key === "ArrowLeft") { event.preventDefault(); previous(); pauseTemporarily(); }
    }}
  >
    <div
      className={cn("tp-carousel-viewport touch-pan-y overflow-hidden", viewportClassName)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { pointerStart.current = null; pauseTemporarily(); }}
    >
      <div className={cn("grid gap-[var(--image-gap)]", shown === 2 && "grid-cols-2", shown === 3 && "grid-cols-3", kind === "vertical" && "grid-cols-1")}>
        {slots.map(({ item, index, slot }) => <motion.div
          key={`${getKey(item, index)}-${active}-${slot}`}
          initial={reduced ? false : initialByKind[kind]}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotateY: 0, rotateZ: kind === "stack" ? (slot - 1) * 1.5 : 0 }}
          transition={{ duration: reduced ? 0 : .62, ease: [.16, 1, .3, 1] }}
          className={cn("min-w-0", itemClassName)}
          aria-hidden={slot > 0 ? undefined : false}
        >{renderItem(item, index, slot)}</motion.div>)}
      </div>
    </div>
    {showControls && count > 1 ? <div className={cn("mt-4 flex items-center justify-between gap-4", controlsClassName)}>
      <button type="button" onClick={() => { previous(); pauseTemporarily(); }} aria-label="Previous item" className="tp-carousel-control">←</button>
      <span className="font-mono text-[9px] uppercase tracking-widest2 opacity-55" aria-live="polite">{String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")} {paused ? "· paused" : reduced ? "· manual" : "· playing"}</span>
      <button type="button" onClick={() => { next(); pauseTemporarily(); }} aria-label="Next item" className="tp-carousel-control">→</button>
    </div> : null}
  </section>;
}

export function TextCarousel({ items, kind = "vertical", className, autoMs = CAROUSEL_AUTOPLAY_MS, label = "Rotating words" }: { items: readonly string[]; kind?: CarouselKind; className?: string; autoMs?: number; label?: string }) {
  return <AutoCarousel items={items.filter(Boolean)} getKey={(item) => item} renderItem={(item) => <p>{item}</p>} kind={kind} visible={1} autoMs={autoMs} className={className} label={label} />;
}
