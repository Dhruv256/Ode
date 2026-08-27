"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { Finale } from "../system/finale";
import { DistributedStory } from "../system/DistributedStory";
import { HorizontalMemories, ScrollZoom } from "@/motion/ScrollScenes";

/** A scroll-directed film: title cards, a camera move into the hero, then an edit of memories. */
export default function Cinema({ ctx }: { ctx: RenderCtx }) {
  const { theme, photos, memories, name, age } = ctx;
  const hero = ctx.hero ?? photos[0];
  // Cinema treats every uploaded photo as a potential edit, not just a role subset.
  const shots = photos.filter((photo) => photo.id !== hero?.id).slice(0, 12);
  const reduced = useReducedMotion();

  return <div className="relative overflow-hidden" style={{ background: theme.bg, color: theme.text }}>
    <section className="flex min-h-[100svh] flex-col items-center justify-center bg-black px-6 text-center text-[#e8e4da] sm:min-h-screen"><motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 0.7 }} viewport={{ once: true }} className="max-w-md font-mono text-[11px] uppercase leading-relaxed tracking-widest2">A film by the people who love {name.toLowerCase()}</motion.p></section>

    <section className="relative flex min-h-[78svh] items-center justify-center overflow-hidden bg-black text-[#e8e4da] sm:min-h-[86vh]"><span className="absolute left-4 top-4 font-mono text-[9px] uppercase tracking-widest2 opacity-50">scene 02 / a new number</span><motion.span initial={{ scale: 0.82, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: reduced ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }} className="font-display text-[clamp(8rem,38vw,15rem)] leading-none tracking-tightest sm:text-[25rem]" style={{ fontFamily: ctx.fonts.display }}>{age ?? 21}</motion.span><span className="absolute bottom-8 px-6 text-center font-mono text-[10px] uppercase tracking-widest2 opacity-60">{ctx.title}</span></section>

    {hero && <ScrollZoom className="bg-black"><Photo photo={hero} treatment={ctx.treatment} className="h-full w-full" /><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/75 via-transparent to-black/25 pb-12 text-[#f4f0e7]"><p className="font-mono text-[10px] uppercase tracking-[0.45em]">now starring</p><h1 className="mt-4 font-display text-[15vw] leading-none sm:text-8xl" style={{ fontFamily: ctx.fonts.display }}>{name}</h1><p className="mt-5 font-mono text-[9px] uppercase tracking-widest2 opacity-70">keep scrolling to move closer</p></div></ScrollZoom>}

    {shots.length > 0 && <section className="bg-black py-12 text-[#e8e4da]"><div className="flex items-center gap-4 px-6 sm:px-12"><span className="h-px flex-1 bg-white/30" /><span className="font-mono text-[10px] uppercase tracking-widest2">scene 08 / memory montage</span><span className="h-px flex-1 bg-white/30" /></div><p className="mt-3 px-6 font-mono text-[9px] uppercase tracking-widest2 text-white/45 sm:px-12">Swipe sideways to view the full edit</p><HorizontalMemories className="mt-7"><div className="flex gap-3 px-6 pb-4 sm:gap-5 sm:px-12">{shots.map((p, i) => <motion.figure key={p.id} whileHover={reduced ? undefined : { y: -8 }} className="w-[76vw] max-w-xl shrink-0 snap-start border-y-4 border-black sm:w-[48vw]"><Photo photo={p} treatment={ctx.treatment} aspect="aspect-[16/10] w-full" /><figcaption className="mt-2 font-mono text-[9px] uppercase tracking-widest text-white/55">{p.caption || `frame ${String(i + 1).padStart(2, "0")}`}{p.dateTaken ? ` · ${p.dateTaken}` : ""}</figcaption></motion.figure>)}</div></HorizontalMemories></section>}

    <section className="flex min-h-[42svh] items-center justify-center px-6 py-16 text-center sm:min-h-[52vh]"><div className="max-w-2xl"><p className="font-mono text-[10px] uppercase tracking-widest2 opacity-60">scene 10 / hold the shot</p><p className="mt-6 font-display text-3xl italic leading-snug sm:text-5xl" style={{ fontFamily: ctx.fonts.display }}>{memories.memory || memories.oneSentence || "Add the line that belongs to this moment."}</p></div></section>

    <section className="flex min-h-[48svh] items-center justify-center bg-black px-6 py-16 text-center text-[#f9e9da] sm:min-h-[45vh]"><div><span className="font-mono text-[10px] uppercase tracking-widest2 opacity-60">scene 11</span><h2 className="mt-5 font-display text-[13vw] leading-[.82] sm:text-8xl" style={{ fontFamily: ctx.fonts.display }}>{ctx.title}</h2><p className="mt-6 font-mono text-[10px] uppercase tracking-widest2 opacity-60">a film still in motion</p></div></section>
    <DistributedStory ctx={ctx} />
    <Finale ctx={ctx} />
  </div>;
}
