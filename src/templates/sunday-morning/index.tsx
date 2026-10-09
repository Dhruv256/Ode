"use client";
import { PersonalizedAnswer, memorySlides } from "../system/PersonalizedAnswer";

import { MessageReveal } from "../system/MessageReveal";

import { Scene, MOTION } from "../system/motion";
import { PersonalizationSections } from "../system/PersonalizationSections";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { PhotoAsset } from "@/lib/types";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { AutoCarousel, TextCarousel } from "../system/AutoCarousel";
import { allocatePhotoStory } from "../system/roles";

export default function SundayMorning({ ctx }: { ctx: RenderCtx }) {
  const reduced = useReducedMotion();
  const allocation = allocatePhotoStory(ctx.photos, ctx.hero?.id);
  const twoImageRoll = [allocation.reveal, ...allocation.pair, ...allocation.carousel, ...allocation.secondaryPair, ...allocation.montage].filter(Boolean) as PhotoAsset[];
  const favorites = memorySlides(ctx, ["song","movie","place","thingsTheyLove"]);
  return <div className="tp-paper min-h-screen" style={{ background: ctx.theme.bg, color: ctx.theme.text }}>
    <Scene data-experience-chapter className="relative grid min-h-[72svh] overflow-hidden px-6 py-10 sm:px-12 lg:grid-cols-12 lg:items-end" still><motion.span aria-hidden animate={reduced ? undefined : { x: ["-30%", "20%"] }} transition={{ duration: MOTION.hero, repeat: 0, repeatType: "mirror", ease: "easeInOut" }} className="tp-window-light absolute -inset-y-20 w-[36%] rotate-12" /><div className="relative z-10 lg:col-span-5"><p className="font-mono text-[9px] uppercase tracking-widest2 opacity-40">Sunday · 09:12 · soft light</p><h1 className="mt-8 font-display text-[clamp(4rem,12vw,8rem)] leading-[.78]" style={{ fontFamily: ctx.fonts.display }}>{ctx.name}<br /><em>at {ctx.age ?? "this moment"}.</em></h1></div>{allocation.hero ? <div className="relative z-10 mt-10 lg:col-span-6 lg:col-start-7 lg:mt-0"><Photo photo={allocation.hero} treatment="warm" aspect="w-full" footprint="cinematic" className="shadow-[0_30px_80px_rgba(70,50,20,.16)]" ratio="portrait" priority /></div> : null}</Scene>
    <Scene data-experience-chapter className="grid min-h-[30svh] place-items-center px-6 py-12 text-center"><p className="max-w-3xl font-display text-[clamp(2.2rem,7vw,4.8rem)] italic leading-tight" data-long-copy={(ctx.memories.oneSentence?.length ?? 0) > 160 || undefined}><PersonalizedAnswer field={ctx.memories.oneSentence ? "oneSentence" : undefined}>{ctx.memories.oneSentence || `A quiet morning with ${ctx.name}.`}</PersonalizedAnswer></p></Scene>

    {allocation.feature ? <Scene data-experience-chapter className="mx-auto grid max-w-5xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center" still><Photo photo={allocation.feature} treatment="warm" aspect="w-full" footprint="compact" ratio="postcard" /><blockquote className="font-display text-[clamp(2.3rem,6vw,4.6rem)] italic leading-tight" data-long-copy={(ctx.memories.alwaysSays?.length ?? 0) > 160 || undefined}><PersonalizedAnswer field={ctx.memories.alwaysSays || allocation.feature.caption ? (ctx.memories.alwaysSays ? "alwaysSays" : undefined) : (undefined)}>“{ctx.memories.alwaysSays || allocation.feature.caption || "Some things are best said softly."}”</PersonalizedAnswer></blockquote></Scene> : null}
    {favorites.length ? <Scene data-experience-chapter className="grid min-h-[34svh] place-items-center border-y px-6 py-14 text-center" style={{ borderColor: ctx.theme.line }}><div className="w-full max-w-3xl"><p className="font-mono text-[9px] uppercase tracking-[.36em] opacity-40">a few favourite things</p><TextCarousel items={favorites} kind="fade" autoMs={4800} className="mt-8 font-display text-[clamp(2.5rem,8vw,5.8rem)] italic leading-none" label="Favorite things" /></div></Scene> : null}
    <FoldedNote ctx={ctx} />
    {twoImageRoll.length ? <Scene data-experience-chapter className="mx-auto max-w-6xl px-5 py-16 sm:px-10"><p className="mb-7 font-mono text-[9px] uppercase tracking-[.34em] opacity-40">two images on the table · automatic</p><AutoCarousel items={twoImageRoll} getKey={(photo) => photo.id} kind="fade" visible={ctx.device === "mobile" ? 1 : twoImageRoll.length > 1 ? 2 : 1} autoMs={5400} label="Sunday table photos" renderItem={(photo, index) => <Photo photo={photo} treatment="warm" aspect="w-full" footprint="compact"  ratio="postcard" />} /></Scene> : null}
    <Scene data-experience-chapter className="mx-auto grid max-w-5xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center" still>{allocation.memory ? <Photo photo={allocation.memory} treatment="warm" aspect="w-full" footprint="compact" ratio="postcard" /> : null}<div><p className="font-mono text-[9px] uppercase tracking-widest2 opacity-40">one memory before noon</p><p className="mt-7 font-display text-[clamp(2.2rem,6vw,4.5rem)] italic leading-tight" data-long-copy={(ctx.memories.memory?.length ?? 0) > 160 || undefined}><PersonalizedAnswer field={ctx.memories.memory ? "memory" : undefined}>{ctx.memories.memory || "The kind of morning you remember years later."}</PersonalizedAnswer></p></div></Scene>
    <PersonalizationSections ctx={ctx} />
    <Letter ctx={ctx} />
    <footer className="grid min-h-[34svh] place-items-center px-6 py-14 text-center"><div>{allocation.finale ? <div className="mx-auto mb-7 w-28 sm:w-36"><Photo photo={allocation.finale} treatment="warm" aspect="aspect-[4/5] w-full" footprint="compact" showCaption={false} ratio="postcard" /></div> : null}<p className="font-hand text-[clamp(2.8rem,9vw,6.5rem)] leading-[.86]" data-long-copy={(ctx.memories.ending?.length ?? 0) > 160 || undefined}><PersonalizedAnswer field={ctx.memories.ending ? "ending" : undefined}><MessageReveal text={ctx.memories.ending || "with all our love"} template={ctx.id} /></PersonalizedAnswer></p></div></footer>
  </div>;
}

function FoldedNote({ ctx }: { ctx: RenderCtx }) { return <Scene className="px-6 py-8" still><details className="tp-folded-note mx-auto max-w-xl border p-6" style={{background:ctx.theme.panel,borderColor:ctx.theme.line}}><summary className="min-h-11 cursor-pointer font-mono text-xs">A note between us · open</summary><p className="mt-5 font-hand text-3xl" data-long-copy={(ctx.memories.insideJoke?.length??0)>160||undefined}><PersonalizedAnswer field={ctx.memories.insideJoke ? "insideJoke" : undefined}>{ctx.memories.insideJoke||"A small joke folded into the quiet."}</PersonalizedAnswer></p></details></Scene>; }
function Letter({ ctx }: { ctx: RenderCtx }) { return <Scene className="px-6 py-12" still><details open className="mx-auto max-w-2xl border p-7 shadow-lg sm:p-12" style={{background:ctx.theme.panel,borderColor:ctx.theme.line}}><summary className="min-h-11 cursor-pointer font-mono text-xs">A birthday letter for {ctx.name}</summary><p className="mt-7 font-display text-2xl leading-relaxed" data-long-copy><PersonalizedAnswer field={ctx.memories.message ? "message" : undefined}><MessageReveal text={ctx.memories.message||`Happy birthday, ${ctx.name}. There is so much good still ahead.`} template={ctx.id} /></PersonalizedAnswer></p></details></Scene>; }
