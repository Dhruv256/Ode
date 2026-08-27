"use client";

import React from "react";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { Finale } from "../system/finale";
import { DistributedStory } from "../system/DistributedStory";

export default function Yearbook({ ctx }: { ctx: RenderCtx }) {
  const hero = ctx.hero ?? ctx.photos[0];
  const notes = [ctx.memories.threeWords, ctx.memories.knownFor, ctx.memories.insideJoke, ctx.memories.alwaysSays].filter(Boolean) as string[];
  return <div className="min-h-screen px-5 py-8 sm:px-10" style={{ background: ctx.theme.bg, color: ctx.theme.text }}><section className="mx-auto max-w-6xl border-2 p-4 sm:p-8" style={{ borderColor: ctx.theme.text }}><header className="flex items-end justify-between border-b-2 pb-4" style={{ borderColor: ctx.theme.text }}><h1 className="font-display text-4xl uppercase sm:text-6xl" style={{ fontFamily: ctx.fonts.display }}>Class of<br />forever</h1><span className="font-mono text-[10px] uppercase tracking-widest2">{ctx.name} · {ctx.age ?? "—"}</span></header>
    <div className="mt-8 grid gap-8 lg:grid-cols-12">{hero && <div className="lg:col-span-5"><Photo photo={hero} treatment="photocopy" aspect="aspect-[4/5] w-full" /><p className="mt-2 text-center font-hand text-2xl">{ctx.name}, obviously.</p></div>}<div className="space-y-7 lg:col-span-7">{notes.length ? notes.map((note, i) => <div key={note} className="border-b pb-5" style={{ borderColor: ctx.theme.line }}><p className="font-mono text-[9px] uppercase tracking-widest2 opacity-50">{["Known for", "Most likely to", "Quote", "Margin note"][i]}</p><p className="mt-2 font-display text-2xl italic" style={{ fontFamily: ctx.fonts.display }}>{note}</p></div>) : <p className="font-hand text-3xl opacity-60">Add a quote, a superlative, an inside joke.</p>}</div></div>
    <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-6 sm:gap-2">{ctx.photos.slice(1, 13).map((p, i) => <div key={p.id}><Photo photo={p} treatment="photocopy" aspect="aspect-[4/5] w-full" /><p className="mt-1 font-mono text-[8px] uppercase tracking-widest opacity-50">{String(i + 1).padStart(2, "0")}</p></div>)}</div></section><DistributedStory ctx={ctx} /><Finale ctx={ctx} /></div>;
}
