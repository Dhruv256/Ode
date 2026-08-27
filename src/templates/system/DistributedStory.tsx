"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { RenderCtx } from "./types";
import { distributeContent, STORY_LABEL, type StoryItem } from "./content";
import { Photo } from "./photo";

/** Template-native story beats, interleaving every provided word with real photos. */
export function DistributedStory({ ctx }: { ctx: RenderCtx }) {
  const items = distributeContent(ctx);
  const reduced = useReducedMotion();
  if (items.length === 0 && ctx.photos.length === 0) return null;
  return <section className="relative px-[var(--page-gutter)] py-[var(--section-gap)]" style={{ background: ctx.id === "cinema" || ctx.id === "after-dark" ? "#090909" : ctx.theme.bg, color: ctx.id === "cinema" || ctx.id === "after-dark" ? "#f4f0e7" : ctx.theme.text }}>
    <div className="mx-auto max-w-6xl"><div className="flex items-center gap-4"><span className="h-px flex-1 opacity-30" style={{ background: "currentColor" }} /><p className="font-mono text-[10px] uppercase tracking-widest2">{STORY_LABEL[ctx.id]}</p><span className="h-px flex-1 opacity-30" style={{ background: "currentColor" }} /></div>
      <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{items.map((item, i) => <StoryBeat key={item.key} ctx={ctx} item={item} photo={ctx.photos[i % Math.max(ctx.photos.length, 1)]} index={i} reduced={Boolean(reduced)} />)}</div>
      {ctx.photos.length > 0 && <PhotoWall ctx={ctx} items={items} reduced={Boolean(reduced)} />}
    </div>
  </section>;
}

function StoryBeat({ ctx, item, photo, index, reduced }: { ctx: RenderCtx; item: StoryItem; photo: RenderCtx["photos"][number] | undefined; index: number; reduced: boolean }) {
  const [open, setOpen] = useState(false);
  const dark = ctx.id === "cinema" || ctx.id === "after-dark";
  const base = dark ? "border-white/25" : "border-black/15";
  if (item.module === "secret") return <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={`group relative min-h-0 border ${base} p-5 text-left sm:min-h-40 ${open ? "" : "cursor-pointer"}`}><span className="font-mono text-[9px] uppercase tracking-widest2 opacity-60">{open ? item.label : "Psst… open this"}</span><motion.p initial={false} animate={{ opacity: open ? 1 : 0.24, y: open ? 0 : 8 }} className="mt-5 pr-10 font-hand text-3xl leading-none">{open ? item.value : "a note is tucked underneath"}</motion.p><span className="absolute bottom-4 right-4 font-mono text-[9px] uppercase tracking-widest2 opacity-60">{open ? "close" : "tap"}</span></button>;
  if (item.module === "window") return <motion.article whileHover={reduced ? undefined : { y: -5 }} className={`border ${base} bg-black/10 p-1`}><div className={`flex items-center justify-between border-b ${base} px-3 py-2 font-mono text-[9px] uppercase tracking-widest2`}><span>/{item.label.toLowerCase().replace(/\s+/g, "-")}.txt</span><span>● ●</span></div><p className="p-4 font-mono text-sm leading-relaxed">{item.value}</p></motion.article>;
  if (item.module === "archive") return <article className={`border ${base} p-5`}><p className="font-mono text-[9px] uppercase tracking-widest2 opacity-60">ARCHIVE NOTE {String(index + 1).padStart(3, "0")} / {item.label}</p><p className="mt-7 font-serif text-xl italic leading-snug">{item.value}</p></article>;
  if (item.module === "intertitle") return <article className="flex min-h-0 flex-col justify-end border-t-4 pt-5 sm:min-h-48" style={{ borderColor: ctx.theme.accent }}><p className="font-mono text-[9px] uppercase tracking-widest2 opacity-60">{item.label}</p><p className="mt-4 font-display text-4xl leading-[.9]" style={{ fontFamily: ctx.fonts.display }}>{item.value}</p></article>;
  if (item.module === "pullquote") return <article className="sm:col-span-2 lg:col-span-2"><p className="font-mono text-[9px] uppercase tracking-widest2 opacity-60">{item.label}</p><p className="mt-4 max-w-4xl font-display text-3xl italic leading-[1.02] sm:text-5xl" style={{ fontFamily: ctx.fonts.display }}>“{item.value}”</p></article>;
  if (item.module === "note") return <article className="relative rotate-[-1deg] border p-5 shadow-[5px_6px_0_rgba(0,0,0,.12)]" style={{ background: ctx.theme.panel, borderColor: ctx.theme.line }}><span className="absolute -top-2 left-8 h-4 w-16 -rotate-2 bg-[#f9df8c]/70" /><p className="font-mono text-[9px] uppercase tracking-widest2 opacity-60">{item.label}</p><p className="mt-5 font-hand text-3xl leading-none">{item.value}</p></article>;
  if (item.module === "label") return <article className="flex min-h-0 flex-col justify-between border p-5 sm:min-h-40" style={{ borderColor: "currentColor" }}><span className="font-mono text-[9px] uppercase tracking-widest2 opacity-60">{item.label}</span><p className="mt-6 font-mono text-lg uppercase tracking-wide">{item.value}</p></article>;
  return <article className="group relative overflow-hidden border" style={{ borderColor: ctx.theme.line }}>{photo && <Photo photo={photo} treatment={ctx.treatment} aspect="aspect-[4/3] w-full" showCaption={false} />}<div className="relative bg-[color:var(--tp-panel)] p-4"><p className="font-mono text-[9px] uppercase tracking-widest2 opacity-60">{item.label}</p><p className="mt-2 font-display text-xl italic leading-snug" style={{ fontFamily: ctx.fonts.display }}>{item.value}</p></div></article>;
}

function PhotoWall({ ctx, items, reduced }: { ctx: RenderCtx; items: StoryItem[]; reduced: boolean }) {
  const [focused, setFocused] = useState<string | null>(null);
  return <div className="mt-20"><p className="font-mono text-[10px] uppercase tracking-widest2 opacity-60">EVERY FRAME, STILL HERE</p><div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">{ctx.photos.map((photo, i) => { const open = focused === photo.id; const note = items[i % Math.max(items.length, 1)]; return <article key={photo.id} className="relative"><div role="button" tabIndex={0} aria-label={`Open note for image ${i + 1}`} onClick={() => setFocused(open ? null : photo.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFocused(open ? null : photo.id); } }} className="cursor-pointer overflow-hidden"><motion.div whileHover={reduced ? undefined : { scale: 1.04 }} transition={{ type: "spring", stiffness: 240, damping: 20 }}><Photo photo={photo} treatment={ctx.treatment} aspect={i % 5 === 0 ? "aspect-[3/2] w-full" : "aspect-square w-full"} showCaption={false} /></motion.div></div>{open && note && <div className="absolute inset-x-1 bottom-1 z-10 bg-black/80 p-3 text-white"><p className="font-mono text-[8px] uppercase tracking-widest2 opacity-60">{note.label}</p><p className="mt-1 text-sm leading-snug">{note.value}</p></div>}</article>; })}</div></div>;
}
