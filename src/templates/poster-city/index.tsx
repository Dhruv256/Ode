"use client";

import React from "react";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { Finale } from "../system/finale";
import { DistributedStory } from "../system/DistributedStory";

/** Swiss-poster structure, with every supplied memory becoming real copy rather than hidden metadata. */
export default function PosterCity({ ctx }: { ctx: RenderCtx }) {
  const hero = ctx.hero ?? ctx.photos[0];
  const m = ctx.memories;
  const facts = [
    ["PLACE", m.place], ["ON REPEAT", m.song], ["SCREEN TIME", m.movie],
    ["CURRENT OBSESSION", m.obsession], ["KNOWN FOR", m.knownFor],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  const privateNotes = [["THE QUOTE", m.alwaysSays], ["YOU HAD TO BE THERE", m.insideJoke]].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return <div className="min-h-screen overflow-hidden" style={{ background: ctx.theme.bg, color: ctx.theme.text }}>
    <section className="grid grid-cols-1 border-b-8 sm:min-h-[92vh] sm:grid-cols-12" style={{ borderColor: ctx.theme.text }}>
      <div className="flex min-h-[58svh] flex-col justify-between border-b-8 p-5 sm:col-span-8 sm:min-h-0 sm:border-b-0 sm:border-r-8 sm:p-10" style={{ borderColor: ctx.theme.text }}>
        <span className="font-mono text-[10px] uppercase tracking-widest2">poster no. {String(ctx.age ?? 0).padStart(3, "0")}</span>
        <div><h1 className="font-display text-[28vw] leading-[.68] sm:text-[16rem]" style={{ fontFamily: ctx.fonts.display }}>{ctx.age ?? "?"}</h1>{m.oneSentence && <p className="mt-8 max-w-xl border-l-4 pl-4 font-display text-xl italic leading-snug sm:text-3xl" style={{ borderColor: ctx.theme.accent, fontFamily: ctx.fonts.display }}>{m.oneSentence}</p>}</div>
        <span className="font-mono text-[10px] uppercase tracking-widest2">{ctx.name} / one night only / always</span>
      </div>
      <div className="relative min-h-[56svh] overflow-hidden sm:col-span-4 sm:min-h-0">{hero && <Photo photo={hero} treatment="halftone" className="h-full w-full" />}<span className="tp-vertical absolute bottom-6 right-3 font-mono text-[10px] tracking-widest2">{m.threeWords || "A NEW CHAPTER"}</span></div>
    </section>

    {(m.thingsTheyLove || facts.length > 0) && <section className="grid border-b-8 sm:grid-cols-12" style={{ borderColor: ctx.theme.text }}>
      <div className="border-b-4 p-6 sm:col-span-5 sm:border-b-0 sm:border-r-4 sm:p-10" style={{ borderColor: ctx.theme.text }}><p className="font-mono text-[10px] uppercase tracking-widest2 opacity-60">THE SMALL PRINT / THE BIG THINGS</p>{m.thingsTheyLove && <p className="mt-6 font-display text-3xl leading-[.95] sm:text-5xl" style={{ fontFamily: ctx.fonts.display }}>{m.thingsTheyLove}</p>}</div>
      <dl className="grid sm:col-span-7 sm:grid-cols-2">{facts.map(([label, value], i) => <div key={label} className={`min-h-32 border-b-4 p-6 ${i % 2 === 0 ? "sm:border-r-4" : ""}`} style={{ borderColor: ctx.theme.text }}><dt className="font-mono text-[9px] uppercase tracking-widest2 opacity-60">{label}</dt><dd className="mt-4 font-display text-2xl italic leading-tight" style={{ fontFamily: ctx.fonts.display }}>{value}</dd></div>)}</dl>
    </section>}

    {privateNotes.length > 0 && <section className="grid border-b-8 sm:grid-cols-2" style={{ borderColor: ctx.theme.text }}>{privateNotes.map(([label, value], i) => <div key={label} className={`p-8 sm:p-12 ${i === 0 ? "border-b-8 sm:border-b-0 sm:border-r-8" : ""}`} style={{ background: i ? ctx.theme.accent : ctx.theme.panel, borderColor: ctx.theme.text, color: i ? ctx.theme.bg : ctx.theme.text }}><p className="font-mono text-[10px] uppercase tracking-widest2 opacity-65">{label}</p><p className="mt-10 font-display text-4xl italic leading-[.95] sm:text-6xl" style={{ fontFamily: ctx.fonts.display }}>“{value}”</p></div>)}</section>}

    {m.memory && <section className="grid grid-cols-1 border-b-8 sm:min-h-[62vh] sm:grid-cols-12" style={{ borderColor: ctx.theme.text }}><div className="border-b-4 p-4 font-mono text-[9px] uppercase tracking-widest2 sm:col-span-2 sm:border-b-0 sm:border-r-8" style={{ borderColor: ctx.theme.text }}>MEMORY / {String(ctx.age ?? 0).padStart(3, "0")}</div><div className="flex items-center p-7 sm:col-span-10 sm:p-14"><p className="max-w-5xl font-display text-[clamp(2.75rem,11vw,5rem)] leading-[.88] sm:text-7xl" style={{ fontFamily: ctx.fonts.display }}>{m.memory}</p></div></section>}

    {ctx.photos.length > 1 && <section className="grid grid-cols-2 border-b-8 sm:grid-cols-4" style={{ borderColor: ctx.theme.text }}>{ctx.photos.filter((p) => p.id !== hero?.id).slice(0, 8).map((p, i) => <div className={i % 4 === 2 ? "col-span-2" : "border-r-4"} style={{ borderColor: ctx.theme.text }} key={p.id}><Photo photo={p} treatment="halftone" aspect={i % 4 === 2 ? "aspect-[2/1] w-full" : "aspect-[3/4] w-full"} /></div>)}</section>}
    <DistributedStory ctx={ctx} />
    <Finale ctx={ctx} />
  </div>;
}
