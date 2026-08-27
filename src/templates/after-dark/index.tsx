"use client";

import React from "react";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { Finale } from "../system/finale";
import { DistributedStory } from "../system/DistributedStory";
import { byRole } from "../system/roles";
import { CheckeredMark } from "../system/motifs";

/** A nocturnal photo journal: flash frames, a poster-like opening and no nightlife assumptions. */
export default function AfterDark({ ctx }: { ctx: RenderCtx }) {
  const shots = byRole(ctx.roles, "card");
  const hero = ctx.hero ?? ctx.photos[0];
  return <div className="min-h-screen bg-[#090909] text-[#f4f0e7]" style={{ background: ctx.theme.text, color: ctx.theme.bg }}>
    <section className="relative min-h-[100svh] overflow-hidden px-6 py-10 sm:min-h-screen sm:px-12">
      <div className="absolute inset-0 opacity-20 tp-grain" />
      <div className="relative flex justify-between font-mono text-[10px] uppercase tracking-widest2"><span>flash diary</span><CheckeredMark /></div>
      <div className="relative mt-[20svh] max-w-4xl sm:mt-[28vh]">
        <p className="font-mono text-[10px] uppercase tracking-widest2" style={{ color: ctx.theme.accent }}>the late edition</p>
        <h1 className="mt-3 font-display text-[17vw] leading-[.78] sm:text-[10rem]" style={{ fontFamily: ctx.fonts.display }}>{ctx.age ?? "?"}<br />AFTER<br />DARK</h1>
        <p className="mt-7 max-w-sm text-lg italic opacity-70">{ctx.memories.oneSentence || "A collection that stays up a little longer."}</p>
      </div>
      {hero && <div className="relative mt-8 ml-auto w-[62vw] max-w-sm rotate-2 border-4 border-white/80 sm:absolute sm:bottom-8 sm:right-12 sm:mt-0 sm:w-[47vw]"><Photo photo={hero} treatment="flash" aspect="aspect-[3/4] w-full" /></div>}
    </section>
    <section className="px-4 py-16 sm:px-12"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{shots.slice(0, 12).map((p, i) => <div className={i % 3 === 0 ? "col-span-2" : ""} key={p.id}><Photo photo={p} treatment="flash" aspect={i % 3 === 0 ? "aspect-[16/10] w-full" : "aspect-[3/4] w-full"} /><p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-white/50">frame {String(i + 1).padStart(2, "0")}</p></div>)}</div></section>
    <DistributedStory ctx={ctx} />
    <Finale ctx={ctx} />
  </div>;
}
