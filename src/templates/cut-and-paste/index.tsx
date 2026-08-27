"use client";

import React from "react";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { Reveal } from "../system/Reveal";
import { Finale } from "../system/finale";
import { DistributedStory } from "../system/DistributedStory";
import { byRole } from "../system/roles";
import { cn } from "@/lib/utils";

/**
 * 02 · CUT & PASTE — art-school scrapbook / indie culture publication.
 * Layered physical depth: torn edges, tape, overlapping photos, stickers,
 * handwritten marks. The opening assembles live (empty → one photo → tape →
 * second overlaps). Milestones stamp the structure; playful copy only when
 * the vibes invite it.
 */
export default function CutAndPaste({ ctx }: { ctx: RenderCtx }) {
  const { theme, photos, memories, name, age } = ctx;
  const cards = byRole(ctx.roles, "card");
  const flips = byRole(ctx.roles, "floating");
  const strips = byRole(ctx.roles, "strip");

  const playful = ctx.project.vibes.vibes.some((v) =>
    ["chaos-energy", "main-character", "internet-native"].includes(v)
  );
  const headline = `${age ?? 21} pieces of evidence that ${name.toUpperCase()} is ${playful ? "iconic" : "worth keeping"}`;

  const tape = (deg = -2) => (
    <span
      aria-hidden
      className="absolute -top-2 left-1/2 z-[4] h-5 w-16 -translate-x-1/2 rotate-[-3deg]"
      style={{ background: "rgba(255,244,214,0.55)", boxShadow: "0 1px 2px rgba(0,0,0,0.12)", opacity: 0.85 }}
    />
  );

  return (
    <div className="tp-paper relative min-h-screen overflow-hidden px-4 py-10 sm:px-8" style={{ background: theme.bg }}>
      {/* ── First photo arrives, tape appears ── */}
      <section className="relative mt-6">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-widest2" style={{ color: theme.muted }}>
            having gathered the evidence —
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-black uppercase leading-[0.92] tracking-tightest sm:text-6xl lg:text-7xl" style={{ fontFamily: ctx.fonts.display }}>
            {name}
            <span className="block text-6xl text-[var(--tp-accent)] sm:text-8xl lg:text-9xl">{age ?? 21}</span>
          </h1>
        </Reveal>

        {photos[0] && (
          <Reveal className="relative mt-10 w-64 sm:w-80">
            {tape(-2)}
            <Photo photo={photos[0]} treatment={ctx.treatment} aspect="aspect-[4/5] w-full" className="rotate-[-1.2deg] shadow-[8px_10px_24px_rgba(0,0,0,0.18)]" />
            <Note meta={photos[0]} theme={theme} />
          </Reveal>
        )}
      </section>
{/* ── Sequence: second photo overlaps the type ── */}
      <section className="relative mt-14 grid gap-10 sm:grid-cols-12">
        <Reveal className="relative sm:col-span-7">
          {photos[1] ? (
            <>
              {tape(1)}
              <Photo photo={photos[1]} treatment={ctx.treatment} aspect="aspect-[4/3] w-full" className="rotate-[1.3deg] shadow-[8px_10px_24px_rgba(0,0,0,0.18)]" />
              <Note meta={photos[1]} theme={theme} overlap />
            </>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center border border-dashed px-6 text-center font-hand text-xl opacity-60" style={{ borderColor: theme.line }}>
              the next memory tapes here
            </div>
          )}
        </Reveal>
        <div className="flex flex-col justify-end gap-6 sm:col-span-5">
          <p className="text-sm font-sans" style={{ color: theme.muted }}>
            The overlap is the point. Nothing sits straight.
          </p>
          <div className="-rotate-1 border border-[#00000018] bg-[color:var(--tp-panel)] p-5 font-hand text-2xl leading-snug">
            {memories.alwaysSays || memories.insideJoke || "the caption tapes over the corner"}
          </div>
        </div>
      </section>

      {/* ── Dense wall of memories ── */}
      {cards.length > 0 && (
        <section className="relative mt-20">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-widest2" style={{ color: theme.muted }}>
            {memories.threeWords || "the wall"}
          </p>
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {cards.map((p, i) => (
              <div key={p.id} className="mb-4 break-inside-avoid">
                <div className={cn("relative", rotations[i % rotations.length])}>
                  {tape(i % 2 === 0 ? -2 : 2)}
                  <Photo photo={p} treatment={ctx.treatment} aspect="aspect-square w-full" className="shadow-[6px_8px_20px_rgba(0,0,0,0.15)]" />
                  <Note meta={p} theme={theme} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Static of floating photos ── */}
      {flips.length > 0 && (
        <section className="relative mt-16 flex flex-wrap items-end gap-6">
          {flips.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <Photo
                photo={p}
                treatment={ctx.treatment}
                aspect="aspect-[4/5] w-40"
                className={i % 2 ? "rotate-[1.5deg]" : "rotate-[-1.5deg]"}
              />
            </Reveal>
          ))}
        </section>
      )}

      {/* ── Milestone stamp ── */}
      <div className="relative mt-24 text-center">
        <span
          className="inline-block -rotate-6 border-4 border-double px-6 py-3 font-hand text-3xl uppercase"
          style={{ borderColor: theme.accent, color: theme.accent }}
        >
          {ctx.milestone?.label ?? age} · {age}
        </span>
      </div>

      {/* ── Finale strips everything away except the favorite photo ── */}
      <DistributedStory ctx={ctx} />
      <Finale ctx={ctx} />
    </div>
  );
}

const rotations = [
  "rotate-[-1.2deg]",
  "rotate-[1.4deg]",
  "rotate-[-0.8deg]",
  "rotate-[0.6deg]",
  "rotate-[1.1deg]",
  "rotate-[-1.6deg]",
];

function Note({
  meta,
  overlap,
  theme,
}: {
  meta: RenderCtx["photos"][number];
  theme: RenderCtx["theme"];
  overlap?: boolean;
}) {
  return (
    <span
      className={cn("block px-1 pt-1.5 font-hand text-xl leading-none", overlap && "mt-1 -rotate-2")}
      style={{ color: theme.muted }}
    >
      {meta.caption || "the tape says it all"}
    </span>
  );
}
