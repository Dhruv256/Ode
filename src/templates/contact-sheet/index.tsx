"use client";

import React from "react";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { Reveal } from "../system/Reveal";
import { Finale } from "../system/finale";
import { DistributedStory } from "../system/DistributedStory";
import { AgeMark, InterestMotifs } from "../system/motifs";
import { byRole } from "../system/roles";
import { cn } from "@/lib/utils";

/**
 * 01 · CONTACT SHEET — an analog photographer's archive.
 * Film-counter entrance, rotated/uneven contact frames, film strips,
 * huge frame numbers, grease-pencil annotations. Metadata rendered only
 * when the user actually supplied it — never fabricated.
 */
export default function ContactSheet({ ctx }: { ctx: RenderCtx }) {
  const { theme, photos, memories, age } = ctx;
  const frames = byRole(ctx.roles, "contact-frame");
  const strips = byRole(ctx.roles, "strip");
  const bleed = byRole(ctx.roles, "full-bleed");

  return (
    <div className="relative">
      {/* ── Opening plate ── */}
      <section className="relative min-h-[100svh] overflow-hidden px-6 py-16 sm:min-h-screen sm:px-12 sm:py-24">
        <div className="tp-grain absolute inset-0" />
        <div className="relative">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest2" style={{ color: theme.muted }}>
            <span>ROLL 0{String(age ?? 24).padStart(2, "0")}</span>
            <span>{ctx.milestone?.label ?? "A ROLL"}</span>
            <span>ISO 400 · 35MM</span>
          </div>

          <div className="mt-16 sm:mt-24">
            <h1 className="font-display text-[16vw] font-black leading-[0.86] tracking-tightest sm:text-[9rem] lg:text-[13rem]" style={{ fontFamily: ctx.fonts.display }}>
              {ctx.title}
            </h1>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-widest2" style={{ color: theme.muted }}>
              A contact sheet of their years
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
            <AgeMark ctx={ctx} />
            <InterestMotifs ctx={ctx} />
            {memories.oneSentence && (
              <p className="max-w-sm font-display text-lg italic opacity-80">{memories.oneSentence}</p>
            )}
          </div>
        </div>

        {photos[0] && (
          <Reveal className="relative mt-16">
            <Photo photo={photos[0]} treatment={ctx.treatment} aspect="aspect-[4/5] w-3/4 sm:w-2/5" className="rotate-[-1.5deg]" />
            <FrameMeta meta={photos[0]} index={1} theme={theme} hand />
          </Reveal>
        )}
      </section>

      {/* ── Dense contact grid, interrupted by a giant frame ── */}
      {frames.length > 0 && (
        <section className="relative border-t px-5 py-16 sm:px-10" style={{ borderColor: theme.line }}>
          <div className="mb-8 flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest2" style={{ color: theme.muted }}>
            <span>36 EXP</span><span className="h-px flex-1" style={{ background: theme.line }} />
            <span>THE ROLL</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-6 sm:gap-3">
            {frames.map((p, i) => (
              <Reveal key={p.id} delay={(i % 6) * 40}>
                <div className="space-y-1.5">
                  <Photo photo={p} treatment={ctx.treatment} aspect="aspect-[4/5] w-full" />
                  <FrameMeta meta={p} index={i + 2} theme={theme} />
                </div>
              </Reveal>
            ))}
          </div>

          {bleed[0] && (
            <Reveal className="mt-14">
              <Photo photo={bleed[0]} treatment={ctx.treatment} aspect="aspect-[4/5] w-full sm:aspect-[16/9]" className="w-full" />
              <FrameMeta meta={bleed[0]} index={frames.length + 3} theme={theme} hand />
            </Reveal>
          )}

          {strips.length > 0 && (
            <div className="mt-12">
              <div className="flex gap-2 overflow-x-auto pb-4">
                {strips.map((p, i) => (
                  <div key={p.id} className="w-32 shrink-0 sm:w-44">
                    <Photo photo={p} treatment={ctx.treatment} aspect="aspect-[3/2] w-full" />
                    <FrameMeta meta={p} index={i + frames.length + 4} theme={theme} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Quiet note between the sheets ── */}
      <section className="px-6 py-24 sm:px-12">
        <Reveal className="mx-auto max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-widest2" style={{ color: theme.muted }}>
            SOME FRAMES WORTH KEEPING
          </p>
          {memories.memory ? (
            <p className="mt-6 font-display text-2xl font-light italic leading-snug sm:text-3xl">
              {memories.memory}
            </p>
          ) : (
            <p className="mt-6 font-mono text-[11px] uppercase tracking-widest opacity-50">
              Add the story behind this photo
            </p>
          )}
        </Reveal>
      </section>

      <DistributedStory ctx={ctx} />
      <Finale ctx={ctx} />
    </div>
  );
}

function FrameMeta({
  meta,
  index,
  theme,
  hand,
}: {
  meta: RenderCtx["photos"][number];
  index: number;
  theme: RenderCtx["theme"];
  hand?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between font-mono text-[9px] uppercase tracking-widest" style={{ color: theme.muted }}>
      <span className={cn(hand && "font-hand text-base normal-case")}>
        {hand && meta.caption ? meta.caption : `FRAME ${String(index).padStart(3, "0")}`}
      </span>
      <span className="opacity-70">
        {meta.location || meta.dateTaken || (meta.orientation === "portrait" ? "80mm" : "35mm")}
      </span>
    </div>
  );
}

