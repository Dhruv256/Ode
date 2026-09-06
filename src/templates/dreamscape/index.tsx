"use client";

import { Scene, MOTION } from "../system/motion";
import { PersonalizationSections } from "../system/PersonalizationSections";

import React, { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PhotoAsset } from "@/lib/types";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { PhotoViewer } from "../system/PhotoViewer";
import { AutoCarousel, TextCarousel } from "../system/AutoCarousel";
import { allocatePhotoStory } from "../system/roles";

export default function Dreamscape({ ctx }: { ctx: RenderCtx }) {
  const [portal, setPortal] = useState<PhotoAsset | null>(null);
  const [liquid, setLiquid] = useState(false);
  const reduced = useReducedMotion();
  const allocation = allocatePhotoStory(ctx.photos, ctx.hero?.id);
  const orbit = [...allocation.carousel, ...allocation.secondaryPair, ...allocation.montage];
  return <div className="relative min-h-screen overflow-hidden" style={{ background: ctx.theme.bg, color: ctx.theme.text }}>
    <Scene data-experience-chapter className="relative grid min-h-[72svh] place-items-center px-6 py-14 text-center" still><div aria-hidden className="tp-dream-aurora absolute inset-0" /><div className="relative"><p className="font-mono text-[9px] uppercase tracking-[.4em] opacity-45">approach slowly · island 00</p><h1 className="mt-8 font-display text-[clamp(4.8rem,19vw,13rem)] italic leading-[.66]" style={{ fontFamily: ctx.fonts.display }}>{ctx.name}<br />dreaming</h1><p className="mx-auto mt-9 max-w-lg font-display text-xl italic opacity-65" data-long-copy={(ctx.memories.oneSentence?.length ?? 0) > 160 || undefined}>{ctx.memories.oneSentence || "Some memories return as places."}</p></div></Scene>
    {allocation.hero ? <Island photo={allocation.hero} label="island 01 · first light" ctx={ctx} side="left" /> : null}
    {allocation.feature ? <Portal photo={allocation.feature} label="portal 01" ctx={ctx} onOpen={setPortal} /> : null}
    <Scene data-experience-chapter className="grid min-h-[34svh] place-items-center px-6 py-12 text-center"><p className="max-w-5xl font-display text-[clamp(2.8rem,9vw,6.8rem)] italic leading-[.87]" data-long-copy={(ctx.memories.alwaysSays?.length ?? 0) > 160 || undefined}>{ctx.memories.alwaysSays || "Nothing here needs a straight edge."}</p></Scene>
    {allocation.memory ? <Island photo={allocation.memory} label="island 02 · remembered ground" ctx={ctx} side="right" /> : null}
    <Scene data-experience-chapter className="grid min-h-[38svh] place-items-center px-6 py-14"><button type="button" onClick={() => setLiquid((value) => !value)} className="relative grid min-h-64 w-full max-w-md p-8 place-items-center overflow-hidden rounded-[46%_54%_63%_37%/42%_58%_42%_58%] border text-center" style={{ borderColor: ctx.theme.line, background: `linear-gradient(135deg, ${ctx.theme.accent}55, ${ctx.theme.accent2}66)` }}><motion.span animate={reduced ? undefined : { rotate: liquid ? 180 : 0, scale: liquid ? 1.24 : 1 }} transition={{ duration: MOTION.hero }} className="absolute inset-8 rounded-[60%_40%_45%_55%]" style={{ background: ctx.theme.panel, filter: "blur(8px)" }} /><span className="relative font-mono text-sm leading-relaxed">{liquid ? ctx.memories.insideJoke || "the surface remembers" : "touch the liquid"}</span></button></Scene>
    {orbit.length ? <Scene data-experience-chapter className="mx-auto max-w-6xl px-5 py-16" still><TextCarousel items={[ctx.memories.threeWords, ctx.memories.obsession, ctx.memories.song].filter(Boolean) as string[]} kind="orbit" className="mb-10 text-center font-display text-[clamp(2rem,7vw,4.8rem)] italic" label="Orbiting text" /><AutoCarousel items={orbit} getKey={(photo) => photo.id} kind="orbit" visible={ctx.device === "mobile" ? 1 : orbit.length > 1 ? 2 : 1} autoMs={5600} label="Dream orbit" renderItem={(photo, index) => <Photo photo={photo} treatment="none" aspect="w-full" footprint="compact" className={index % 2 ? "rounded-[44%_56%_48%_52%]" : "rounded-[55%_45%_58%_42%]"} ratio="portrait" />} /></Scene> : null}
    {allocation.reveal ? <Portal photo={allocation.reveal} label="portal 02" ctx={ctx} onOpen={setPortal} /> : null}
    {allocation.pair.length ? <Scene data-experience-chapter className="relative mx-auto min-h-[58svh] max-w-5xl px-6 py-16"><p className="font-mono text-[9px] uppercase tracking-[.34em] opacity-45">one overlap · two remembered skies</p><div className="relative mx-auto mt-8 grid grid-cols-2 items-start gap-5 max-w-3xl">{allocation.pair.slice(0, 2).map((photo, index) => <div key={photo.id} className={`relative w-full min-w-0 ${index ? "mt-10 rotate-1" : "-rotate-1"}`}><Photo photo={photo} treatment="none" aspect="w-full" footprint="compact" ratio="portrait" /></div>)}</div></Scene> : null}
    <Scene data-experience-chapter className="grid min-h-[34svh] place-items-center border-y px-6 py-14 text-center" style={{ borderColor: ctx.theme.line }}><p className="max-w-4xl font-display text-[clamp(2.4rem,7vw,5.2rem)] italic leading-tight" data-long-copy={(ctx.memories.message?.length ?? 0) > 160 || undefined}>{ctx.memories.message || `Happy birthday, ${ctx.name}. May the next dream know your name.`}</p></Scene>
    <PersonalizationSections ctx={ctx} />
    <footer className="grid min-h-[48svh] place-items-center px-6 py-14 text-center">{allocation.finale ? <div><motion.div whileInView={reduced ? undefined : { borderRadius: ["24%", "50%"] }} transition={{ duration: MOTION.hero }} className="mx-auto w-44 overflow-hidden rounded-[36%] sm:w-60"><Photo photo={allocation.finale} treatment="none" aspect="aspect-square w-full" footprint="compact" showCaption={false} ratio="portrait" /></motion.div><p className="mt-7 font-mono text-[9px] uppercase tracking-[.4em] opacity-40">final object · keep the light on</p><h2 className="mt-6 font-display text-[clamp(2.8rem,9vw,6.4rem)] italic leading-none" data-long-copy={(ctx.memories.ending?.length ?? 0) > 160 || undefined}>{ctx.memories.ending || "The dream keeps a light on."}</h2></div> : null}</footer>
    {portal && <PhotoViewer photo={portal} onClose={()=>setPortal(null)} />}
  </div>;
}

function Island({ photo, label, ctx, side }: { photo: PhotoAsset; label: string; ctx: RenderCtx; side: "left" | "right" }) { return <Scene data-experience-chapter className={`flex min-h-[52svh] items-center px-5 py-14 sm:px-10 ${side === "right" ? "justify-end" : "justify-start"}`} still><div className="w-full max-w-2xl"><p className="mb-5 font-mono text-[9px] uppercase tracking-[.35em] opacity-40">{label}</p><Photo photo={photo} treatment="none" aspect="w-full" footprint="cinematic" className="rounded-[48%_52%_58%_42%/45%_55%_45%_55%]" ratio="portrait" /></div></Scene>; }
function Portal({ photo, label, ctx, onOpen }: { photo: PhotoAsset; label: string; ctx: RenderCtx; onOpen: (photo: PhotoAsset) => void }) { return <Scene data-experience-chapter className="grid min-h-[44svh] place-items-center px-6 py-14"><button type="button" onClick={() => onOpen(photo)} className="tp-portal relative w-full max-w-xl overflow-hidden rounded-[48%_52%_60%_40%/45%_55%_45%_55%] p-2" style={{ background: `linear-gradient(130deg, ${ctx.theme.accent}, ${ctx.theme.accent2})` }}><Photo photo={photo} treatment="none" aspect="w-full" footprint="compact" className="rounded-[inherit]" showCaption={false} ratio="portrait" /><span className="absolute inset-0 grid place-items-end p-6 font-mono text-[9px] uppercase tracking-[.38em] text-white">{label} · enter</span></button></Scene>; }
