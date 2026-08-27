"use client";

import React from "react";
import type { RenderCtx } from "./types";

/**
 * Interest micro-personalization.
 * Interests seed SMALL details only (lap numbers, chapter digits, coordinates,
 * level marks, track counts, checkered/scoreboard/coffee-ring stamps…). The
 * site is never redesigned as a "racing website" or a "gaming site" — these
 * are quiet gifts the recipient notices gradually.
 */

export function hasAny(ctx: RenderCtx, labels: string[]): boolean {
  return ctx.interests.some((i) => labels.includes(i));
}

function Label({ children, accent, className }: { children: React.ReactNode; accent?: boolean; className?: string }) {
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-widest2 mix-blend-normal ${className ?? ""}`}
      style={{ color: accent ? "var(--tp-accent, #B4502A)" : "inherit", opacity: accent ? 1 : 0.7 }}
    >
      {children}
    </span>
  );
}

/** The primary "age mark" — adapts how the age is written to their interests. */
export function AgeMark({ ctx, className }: { ctx: RenderCtx; className?: string }) {
  const age = ctx.age ?? 21;
  const name = ctx.name.toUpperCase();
  if (hasAny(ctx, ["formula 1", "football"]))
    return <Label className={className} accent>LAP {age}</Label>;
  if (hasAny(ctx, ["books", "art"]))
    return <Label className={className} accent>CH.{String(age).padStart(2, "0")}</Label>;
  if (hasAny(ctx, ["gaming"]))
    return <Label className={className} accent>LEVEL {age}</Label>;
  if (hasAny(ctx, ["music", "movies"]))
    return <Label className={className} accent>TRACK {age} · {name}</Label>;
  if (hasAny(ctx, ["travel", "photography"]))
    return <Label className={className} accent>COORD {age}° {name.slice(0, 3)}</Label>;
  return <Label className={className} accent>{String(age).padStart(3, "0")}</Label>;
}

/** Checkered / timing micro-detail for F1 + football. */
export function CheckeredMark({ size = 3 }: { size?: number }) {
  const cells = size * size;
  return (
    <span className="inline-grid shrink-0" style={{ gridTemplateColumns: `repeat(${size}, 4px)`, gap: 0 }}>
      {Array.from({ length: cells }).map((_, i) => {
        const row = Math.floor(i / size);
        const on = (row + (i % size)) % 2 === 0;
        return <span key={i} className="block h-1 w-1" style={{ background: on ? "#fff" : "#000" }} />;
      })}
    </span>
  );
}

/** Coffee-ring / steam line for chai & coffee. */
export function CoffeeRing() {
  return (
    <span aria-hidden className="inline-block h-6 w-6 rounded-full" style={{ border: "2px solid rgba(0,0,0,0.28)", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)" }} />
  );
}

/** A waveform squiggle for music interests. */
export function Waveform({ color }: { color?: string }) {
  const bars = [6, 14, 9, 18, 12, 20, 8, 15, 10, 5];
  return (
    <span aria-hidden className="inline-flex items-end gap-[2px]" style={{ height: 18 }}>
      {bars.map((h, i) => (
        <span key={i} className="block w-[2px]" style={{ height: h, background: color ?? "var(--tp-text)" }} />
      ))}
    </span>
  );
}

/** Small set of subtle interest motifs for a quiet corner. */
export function InterestMotifs({ ctx }: { ctx: RenderCtx }) {
  const bits: React.ReactNode[] = [];
  if (hasAny(ctx, ["formula 1", "football"])) bits.push(<CheckeredMark key="check" />);
  if (hasAny(ctx, ["chai", "coffee"])) bits.push(<CoffeeRing key="ring" />);
  if (hasAny(ctx, ["music"])) bits.push(<Waveform key="wave" color="var(--tp-accent)" />);
  return <>{bits}</>;
}
