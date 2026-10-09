"use client";
import { PersonalizedAnswer } from "../system/PersonalizedAnswer";

import { MessageReveal } from "../system/MessageReveal";

import { Scene, MOTION } from "../system/motion";
import { PersonalizationSections } from "../system/PersonalizationSections";

import React, { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PhotoAsset } from "@/lib/types";
import type { RenderCtx } from "../system/types";
import { PhotoViewer } from "../system/PhotoViewer";
import { PolaroidCard } from "../system/collage";
import { AutoCarousel } from "../system/AutoCarousel";
import { allocatePhotoStory } from "../system/roles";

export default function PolaroidWall({ ctx }: { ctx: RenderCtx }) {
  const [selected, setSelected] = useState<PhotoAsset | null>(null);
  const reduced = useReducedMotion();
  const allocation = allocatePhotoStory(ctx.photos, ctx.hero?.id);
  const clusterOne = [allocation.hero, ...allocation.pair].filter(Boolean).slice(0, 3) as PhotoAsset[];
  const clusterTwo = [allocation.feature, allocation.reveal, allocation.memory].filter(Boolean).slice(0, 3) as PhotoAsset[];
  const orbit = [...allocation.carousel, ...allocation.secondaryPair];
  return <div className="tp-paper relative min-h-screen overflow-hidden px-4 py-8" style={{ background: ctx.theme.panel, color: ctx.theme.text }}>
    <header data-experience-chapter className="mx-auto flex min-h-[38svh] max-w-7xl items-end justify-between gap-8 px-2 pb-10"><div><p className="font-mono text-[9px] uppercase tracking-widest2 opacity-45">a spatial wall · drag clusters · pull a photo</p><h1 className="mt-5 font-display text-[clamp(4rem,13vw,9rem)] leading-[.75]" style={{ fontFamily: ctx.fonts.display }}>{ctx.age ?? "all"} frames<br /><em>of {ctx.name}</em></h1></div><span className="hidden font-mono text-[9px] uppercase tracking-widest2 opacity-40 sm:block">{ctx.photos.length} memories connected</span></header>
    {clusterOne.length ? <WallCluster items={clusterOne} label="cluster one" ctx={ctx} onSelect={setSelected} /> : null}
    <Scene data-experience-chapter className="grid min-h-[30svh] place-items-center px-6 py-12 text-center" still><p className="max-w-4xl font-hand text-[clamp(2.8rem,9vw,6.5rem)] leading-[.88]" data-long-copy={(ctx.memories.oneSentence?.length ?? 0) > 160 || undefined}><PersonalizedAnswer field={ctx.memories.oneSentence ? "oneSentence" : undefined}>{ctx.memories.oneSentence || "Every wall begins with one frame worth pulling closer."}</PersonalizedAnswer></p></Scene>
    {clusterTwo.length ? <WallCluster items={clusterTwo} label="cluster two" ctx={ctx} onSelect={setSelected} reverse /> : null}
    {orbit.length ? <Scene data-experience-chapter className="mx-auto max-w-6xl py-16"><p className="mb-8 font-mono text-[9px] uppercase tracking-[.35em] opacity-45">orbital rail · three frames at most</p><AutoCarousel items={orbit} getKey={(photo) => photo.id} kind="orbit" visible={ctx.device === "mobile" ? 1 : orbit.length >= 3 ? 3 : orbit.length > 1 ? 2 : 1} autoMs={5000} label="Orbiting polaroid memories" renderItem={(photo, index) => <button type="button" onClick={() => setSelected(photo)} className={`block w-full text-left ${index % 2 ? "rotate-2" : "-rotate-2"}`}><PolaroidCard photo={photo} treatment="warm" rotation={0} note={photo.caption || `memory ${String(index + 1).padStart(2, "0")}`} /></button>} /></Scene> : null}
    <Scene data-experience-chapter className="mx-auto max-w-4xl py-16"><div className="-rotate-1 border p-7 shadow-[12px_14px_0_var(--tp-text)] sm:p-11" style={{ background: ctx.theme.bg, borderColor: ctx.theme.text }}><p className="font-mono text-[9px] uppercase tracking-widest2 opacity-45">note pinned under the wall</p><p className="mt-7 font-hand text-[clamp(2.2rem,7vw,5rem)] leading-tight" data-long-copy={(ctx.memories.message?.length ?? 0) > 160 || undefined}><PersonalizedAnswer field={ctx.memories.message ? "message" : undefined}><MessageReveal text={ctx.memories.message || `Happy birthday, ${ctx.name}. Every frame is better because you are in it.`} template={ctx.id} /></PersonalizedAnswer></p></div></Scene>
    {allocation.montage.length ? <Scene data-experience-chapter className="mx-auto max-w-7xl py-16" still><p className="mb-8 font-mono text-[9px] uppercase tracking-[.34em] opacity-45">whole wall pullback · archive chapter</p><div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{allocation.montage.map((photo, index) => <button type="button" key={photo.id} onClick={() => setSelected(photo)} className={index % 2 ? "rotate-2" : "-rotate-2"}><PolaroidCard photo={photo} treatment="warm" rotation={0} note={photo.caption || `${index + 1}`} /></button>)}</div></Scene> : null}
    <PersonalizationSections ctx={ctx} />
    <footer className="grid min-h-[38svh] place-items-center py-14 text-center">{allocation.finale ? <div><button type="button" onClick={() => setSelected(allocation.finale!)} className="mx-auto block w-36 -rotate-3 sm:w-48"><PolaroidCard photo={allocation.finale} treatment="warm" rotation={0} note="last one for now" /></button><h2 className="mt-8 font-display text-[clamp(3rem,10vw,7rem)] italic leading-none" data-long-copy={(ctx.memories.ending?.length ?? 0) > 160 || undefined}><PersonalizedAnswer field={ctx.memories.ending ? "ending" : undefined}><MessageReveal text={ctx.memories.ending || "Every frame, still becoming."} template={ctx.id} /></PersonalizedAnswer></h2></div> : <h2 className="font-display text-3xl"><PersonalizedAnswer field={ctx.memories.ending ? "ending" : undefined}><MessageReveal text={ctx.memories.ending || `Happy birthday, ${ctx.name}.`} template={ctx.id} /></PersonalizedAnswer></h2>}</footer>
    {selected && <PhotoViewer photo={selected} onClose={()=>setSelected(null)} />}
  </div>;
}

function WallCluster({ items, label, ctx, onSelect, reverse = false }: { items: PhotoAsset[]; label: string; ctx: RenderCtx; onSelect: (photo: PhotoAsset) => void; reverse?: boolean }) { const reduced = useReducedMotion(); return <Scene data-experience-chapter className="mx-auto max-w-6xl py-16"><p className="mb-7 font-mono text-[9px] uppercase tracking-[.34em] opacity-45">{label} · drag to nudge</p><motion.div drag={ctx.device === "desktop" && !reduced} dragConstraints={{ left: -12, right: 12, top: -8, bottom: 8 }} dragElastic={.08} className={`grid grid-cols-2 cursor-grab gap-5 active:cursor-grabbing sm:grid-cols-3 ${reverse ? "sm:rotate-1" : "sm:-rotate-1"}`}>{items.map((photo, index) => <button type="button" key={photo.id} onClick={() => onSelect(photo)} className={`text-left ${index === 1 ? "sm:mt-14" : ""}`}><PolaroidCard photo={photo} treatment="warm" rotation={index % 2 ? 3 : -3} note={photo.caption || `pull frame ${index + 1}`} /></button>)}</motion.div></Scene>; }
