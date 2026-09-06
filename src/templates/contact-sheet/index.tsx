"use client";

import { Scene, MOTION } from "../system/motion";
import { PersonalizationSections } from "../system/PersonalizationSections";

import React, { useState } from "react";
import type { RenderCtx } from "../system/types";
import type { PhotoAsset } from "@/lib/types";
import { Photo } from "../system/photo";
import { AutoCarousel, TextCarousel } from "../system/AutoCarousel";
import { allocatePhotoStory } from "../system/roles";

export default function ContactSheet({ ctx }: { ctx: RenderCtx }) {
  const allocation = allocatePhotoStory(ctx.photos, ctx.hero?.id);
  const finalSheet = allocation.montage.length ? allocation.montage : [allocation.finale, ...allocation.secondaryPair].filter(Boolean) as PhotoAsset[];
  const film = [allocation.feature, ...allocation.carousel].filter(Boolean) as PhotoAsset[];

  return <div className="relative bg-[var(--tp-bg)] text-[var(--tp-text)]">
    <Scene data-experience-chapter className="grid min-h-[56svh] place-items-center px-6 py-16 text-center" still>
      <div><p className="font-mono text-[10px] uppercase tracking-[.42em] opacity-50">film leader · roll {String(ctx.age ?? 0).padStart(3, "0")}</p><h1 className="mt-7 font-display text-[clamp(3.75rem,14vw,10rem)] font-black uppercase leading-[.77]" style={{ fontFamily: ctx.fonts.display }}>Property of<br />{ctx.name}</h1><p className="mx-auto mt-8 max-w-lg font-display text-xl italic opacity-70" data-long-copy={(ctx.memories.oneSentence?.length ?? 0) > 160 || undefined}>{ctx.memories.oneSentence || "A life, inspected one exposure at a time."}</p></div>
    </Scene>

    {allocation.hero ? <Scene data-experience-chapter className="grid gap-10 bg-[var(--tp-panel)] px-5 py-16 text-[var(--tp-text)] lg:grid-cols-[minmax(0,1fr)_12rem] lg:px-12">
      <div className="tp-develop-photo mx-auto w-full max-w-3xl" style={{ perspective: 900 }}><Photo photo={allocation.hero} treatment="grain" aspect="w-full" fit="contain" ratio="portrait" priority /></div>
      <dl className="flex flex-col justify-end gap-5 border-l pl-5 font-mono text-[9px] uppercase tracking-widest2"><Meta label="frame" value="001" /><Meta label="place" value={allocation.hero.location || ctx.memories.place || "unrecorded"} /><Meta label="date" value={allocation.hero.dateTaken || "undated"} /><Meta label="known for" value={ctx.memories.knownFor || "kept in focus"} /></dl>
    </Scene> : null}

    {film.length ? <Scene data-experience-chapter className="bg-[var(--tp-bg)] px-5 py-14 sm:px-10"><p className="mb-7 font-mono text-[9px] uppercase tracking-[.36em] opacity-50">automatic film advance</p><AutoCarousel items={film} getKey={(photo) => photo.id} kind="film" visible={ctx.device === "mobile" ? 1 : film.length > 1 ? 2 : 1} autoMs={4800} label="Automatic film roll" renderItem={(photo, index) => <figure className="border-y-[10px] border-black bg-black p-2"><Photo photo={photo} treatment={index === 1 ? "bw" : "grain"} aspect="w-full" footprint="compact" ratio="landscape" /><figcaption className="mt-2 flex justify-between font-mono text-[8px] uppercase tracking-widest text-white/50"><span>frame {String(index + 2).padStart(3, "0")}</span><span>{photo.caption || photo.location || "kept"}</span></figcaption></figure>} /></Scene> : null}

    <Scene data-experience-chapter className="grid min-h-[44svh] place-items-center bg-[var(--tp-panel)] px-6 py-14 text-[var(--tp-text)]" still><TextCarousel items={[ctx.memories.threeWords, ctx.memories.thingsTheyLove, ctx.memories.song ? `on the reel: ${ctx.memories.song}` : ""].filter(Boolean) as string[]} kind="vertical" autoMs={4300} className="w-full max-w-2xl text-center font-hand text-[clamp(2rem,7vw,4.5rem)] leading-tight" label="Handwritten darkroom notes" /></Scene>

    {allocation.pair.length ? <Scene data-experience-chapter className="grid gap-5 px-5 py-16 sm:grid-cols-2 sm:px-10">{allocation.pair.map((photo, index) => <div key={photo.id} className={index ? "sm:mt-16" : ""}><Photo photo={photo} treatment="grain" aspect="w-full" footprint="compact" ratio="landscape" /><p className="mt-2 font-mono text-[8px] uppercase tracking-widest2 opacity-45">{index ? ctx.memories.movie || "second exposure" : ctx.memories.place || "paired exposure"}</p></div>)}</Scene> : null}

    {allocation.reveal ? <LoupeChapter photo={allocation.reveal} ctx={ctx} /> : null}

    {allocation.secondaryPair.length ? <Scene data-experience-chapter className="mx-auto max-w-3xl px-6 py-16"><p className="mb-6 font-mono text-[9px] uppercase tracking-[.34em] opacity-50">vertical strip · advance</p><AutoCarousel items={allocation.secondaryPair} getKey={(photo) => photo.id} kind="vertical" visible={1} autoMs={5200} label="Vertical film strip" viewportClassName="mx-auto max-w-md" renderItem={(photo, index) => <div className="border-x-[12px] border-black bg-black p-2"><Photo photo={photo} treatment={index === 0 ? "bw" : "grain"} aspect="aspect-[4/5] w-full" footprint="compact" ratio="landscape" /></div>} /></Scene> : null}

    <Scene data-experience-chapter className="grid gap-8 bg-[var(--tp-panel)] px-6 py-16 text-[var(--tp-text)] md:grid-cols-2 md:items-center md:px-12" still>{allocation.memory ? <Photo photo={allocation.memory} treatment="grain" aspect="w-full" footprint="compact" ratio="landscape" /> : null}<div><p className="font-mono text-[9px] uppercase tracking-widest2 opacity-45">one memory · do not crop</p><p className="mt-6 font-display text-2xl italic leading-relaxed sm:text-4xl" data-long-copy={(ctx.memories.memory?.length ?? 0) > 160 || undefined}>{ctx.memories.memory || ctx.memories.alwaysSays || "The frame that never left us."}</p></div></Scene>

    {finalSheet.length ? <Scene data-experience-chapter className="px-5 py-16 sm:px-10"><p className="mb-7 font-mono text-[9px] uppercase tracking-[.36em] opacity-50">final contact sheet · {ctx.photos.length >= 21 ? "archive chapter" : "selected proofs"}</p><div className={`grid gap-2 ${ctx.photos.length >= 21 ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-1 sm:grid-cols-3"}`}>{finalSheet.map((photo, index) => <div key={photo.id}><Photo photo={photo} treatment={index < 2 ? "bw" : "grain"} aspect="aspect-[4/5] w-full" footprint="compact" showCaption={false} ratio="landscape" /><span className="mt-1 block font-mono text-[7px] tracking-widest opacity-40">{String(index + 70).padStart(3, "0")}</span></div>)}</div></Scene> : null}

    <Scene data-experience-chapter className="bg-[var(--tp-panel)] px-6 py-16 text-center text-[var(--tp-text)]"><p className="mx-auto max-w-3xl font-hand text-[clamp(2.25rem,7vw,5rem)] leading-tight" data-long-copy={(ctx.memories.message?.length ?? 0) > 160 || undefined}>{ctx.memories.message || `Happy birthday, ${ctx.name}. Every version of you was worth keeping.`}</p></Scene>
    <PersonalizationSections ctx={ctx} />
    <footer className="grid min-h-[42svh] place-items-center px-6 py-14 text-center"><div><p className="font-mono text-[9px] uppercase tracking-[.42em] opacity-50">end of roll</p><h2 className="mt-6 font-hand text-[clamp(3rem,10vw,7rem)] leading-[.82]" data-long-copy={(ctx.memories.ending?.length ?? 0) > 160 || undefined}>{ctx.memories.ending || "NOT THE END OF THE STORY."}</h2></div></footer>
  </div>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div><dt className="opacity-45">{label}</dt><dd className="mt-1 normal-case tracking-normal">{value}</dd></div>; }

function LoupeChapter({ photo, ctx }: { photo: PhotoAsset; ctx: RenderCtx }) {
  const [open, setOpen] = useState(false);
  return <Scene data-experience-chapter className="grid gap-8 bg-[var(--tp-panel)] px-6 py-16 text-[var(--tp-text)] md:grid-cols-[minmax(0,1fr)_minmax(15rem,24rem)] md:items-center md:px-12" still><button type="button" onClick={() => setOpen((value) => !value)} className="group relative mx-auto block w-full max-w-2xl cursor-crosshair text-left" aria-expanded={open}><Photo photo={photo} treatment="grain" aspect="w-full" fit="contain" ratio="landscape" /><span className={`pointer-events-none absolute left-1/2 top-1/2 grid h-36 w-36 -translate-x-1/2 -translate-y-1/2 place-items-end overflow-hidden rounded-full border-4 border-white bg-black/70 p-3 text-center font-mono text-[8px] uppercase tracking-widest text-white shadow-2xl transition-opacity ${open ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} style={{ backgroundImage: `url(${photo.previewUrl})`, backgroundPosition: `${(photo.focalPoint?.x ?? .5) * 100}% ${(photo.focalPoint?.y ?? .5) * 100}%`, backgroundSize: "230%" }}>{photo.caption || photo.location || "inspect"}</span></button><div><p className="font-mono text-[9px] uppercase tracking-widest2 opacity-45">photographer&apos;s loupe · tap to inspect</p><p className="mt-6 font-hand text-3xl leading-snug" data-long-copy={(ctx.memories.insideJoke?.length ?? 0) > 160 || undefined}>{ctx.memories.insideJoke || ctx.memories.obsession || "There is always more in the detail."}</p></div></Scene>;
}
