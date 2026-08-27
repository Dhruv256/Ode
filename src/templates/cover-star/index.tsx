"use client";

import React from "react";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { Reveal } from "../system/Reveal";
import { Finale } from "../system/finale";
import { DistributedStory } from "../system/DistributedStory";
import { byRole } from "../system/roles";
import { AgeMark } from "../system/motifs";

/**
 * 03 · COVER STAR — fashion editorial / independent magazine.
 * This webpage IS the magazine — not a mockup. Giant didone type, issue
 * numbering, sticky portrait sections, narrow editorial columns, whitespace,
 * a full-screen portrait moment, partial outside-viewport letters.
 */
export default function CoverStar({ ctx }: { ctx: RenderCtx }) {
  const { theme, photos, memories, name, age, title } = ctx;
  const hero = ctx.hero ?? photos[0];
  const cards = byRole(ctx.roles, "card");
  const strips = byRole(ctx.roles, "strip");

  return (
    <div className="relative overflow-x-hidden">
      {/* ── Issue cover spread ── */}
      <section className="grid min-h-[100svh] grid-cols-1 lg:min-h-screen lg:grid-cols-12">
        {/* Sticky left: masthead + giant number */}
        <div className="relative flex flex-col justify-between px-6 py-10 lg:col-span-5 lg:sticky lg:top-0 lg:h-screen lg:px-12">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest2" style={{ color: theme.muted }}>
            <span>THE BIRTHDAY EDITION</span>
            <span>ISSUE {String(age ?? 0).padStart(3, "0")}</span>
          </div>

          <div className="py-10">
            <p className="font-mono text-[11px] uppercase tracking-widest2" style={{ color: theme.accent }}>
              {ctx.milestone?.label ?? "This season's star"}
            </p>
            <h1 className="mt-3 font-didone text-[clamp(5.75rem,25vw,9rem)] font-black leading-[0.85] tracking-tightest lg:text-[11rem]" style={{ fontFamily: ctx.fonts.display }}>
              {age ?? "?"}
            </h1>
            <AgeMark ctx={ctx} />
          </div>

          <div className="max-w-xs">
            <p className="font-display text-2xl font-light italic leading-snug">
              {memories.oneSentence || `A birthday edition for ${name}.`}
            </p>
          </div>
        </div>

        {/* Right: cover portrait */}
        <div className="relative lg:col-span-7">
          {hero && (
            <div className="relative h-[72svh] lg:h-full">
              <Photo photo={hero} treatment={ctx.treatment} className="h-full w-full" fit="cover" />
              <div
                className="absolute right-4 top-6 rotate-90 origin-top-right font-mono text-[9px] uppercase tracking-widest2"
                style={{ color: theme.panel }}
              >
                {ctx.milestone?.label ?? "COVER"}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Marquee strip ── */}
      <section className="border-t px-6 py-14 sm:px-12" style={{ borderColor: theme.line }}>
        <div className="tp-marquee-wrap">
          <div className="tp-marquee font-didone text-6xl font-black uppercase tracking-tightest sm:text-8xl" style={{ fontFamily: ctx.fonts.display, color: theme.text }}>
            <span className="px-6">{name} · issue {String(age ?? 0).padStart(3, "0")} · {title} ·</span>
            <span className="px-6">{name} · issue {String(age ?? 0).padStart(3, "0")} · {title} ·</span>
          </div>
        </div>
      </section>

      {/* ── Sticky portrait section with moving text ── */}
      <section className="grid grid-cols-1 gap-0 lg:grid-cols-12">
        {cards[0] && (
          <div className="lg:sticky lg:top-0 lg:h-screen lg:col-span-6">
            <Photo photo={cards[0]} treatment={ctx.treatment} className="h-full w-full" />
          </div>
        )}
        <div className="flex flex-col gap-12 px-6 py-16 lg:col-span-6 lg:gap-16 lg:px-12 lg:py-20">
          <NumberedNote n="01" label="the interview" text={memories.knownFor || "Add what they are known for."} theme={theme} />
          <NumberedNote n="02" label="a favourite" text={memories.place || memories.song || "Add a favourite place or song."} theme={theme} />
          <NumberedNote n="03" label="on repeat" text={memories.song || memories.movie || "Add a song, film, or current obsession."} theme={theme} />
          {memories.memory && <NumberedNote n="04" label="a keepsake" text={memories.memory} theme={theme} />}
        </div>
      </section>

      {/* ── Full-width strip of cards ── */}
      {cards.length > 0 && (
        <section className="mt-10 grid grid-cols-2 gap-1 sm:grid-cols-4">
          {cards.map((p) => (
            <Photo key={p.id} photo={p} treatment={ctx.treatment} aspect="aspect-[3/4] w-full" />
          ))}
        </section>
      )}

      <DistributedStory ctx={ctx} />
      <Finale ctx={ctx} />
    </div>
  );
}

function NumberedNote({ n, label, text, theme }: { n: string; label: string; text: string; theme: RenderCtx["theme"] }) {
  return (
    <Reveal>
      <p className="font-mono text-[10px] uppercase tracking-widest2" style={{ color: theme.accent }}>
        {n} — {label}
      </p>
      <p className="mt-3 max-w-md font-didone text-2xl font-light leading-snug sm:text-3xl">
        {text}
      </p>
    </Reveal>
  );
}
