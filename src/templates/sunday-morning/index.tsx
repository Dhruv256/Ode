"use client";

import React from "react";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { Finale } from "../system/finale";
import { DistributedStory } from "../system/DistributedStory";
import { byRole } from "../system/roles";

export default function SundayMorning({ ctx }: { ctx: RenderCtx }) {
  const photos = ctx.photos;
  const cards = byRole(ctx.roles, "card");
  const hero = ctx.hero ?? photos[0];
  return <div className="min-h-screen" style={{ background: ctx.theme.bg, color: ctx.theme.text }}>
    <section className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-between px-6 py-10 sm:min-h-screen sm:px-12">
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest2 opacity-55"><span>Sunday morning</span><span>{ctx.age ?? "—"} years, held gently</span></div>
      <div className="grid items-end gap-10 lg:grid-cols-12"><div className="lg:col-span-5"><p className="font-display text-3xl italic leading-tight sm:text-5xl" style={{ fontFamily: ctx.fonts.display }}>{ctx.memories.oneSentence || `A softer look at ${ctx.name}.`}</p><p className="mt-8 max-w-xs font-hand text-2xl opacity-70">{ctx.memories.alwaysSays || "leave a small note here"}</p></div>{hero && <div className="order-first lg:order-none lg:col-span-6 lg:col-start-7"><Photo photo={hero} treatment="warm" aspect="aspect-[4/5] w-full" /></div>}</div>
      <h1 className="max-w-4xl font-display text-[15vw] leading-[.78] tracking-tightest sm:text-[9rem]" style={{ fontFamily: ctx.fonts.display }}>{ctx.name}<br /><em>at {ctx.age ?? "this"}.</em></h1>
    </section>
    <section className="mx-auto max-w-5xl px-6 py-20 sm:px-12"><p className="font-mono text-[10px] uppercase tracking-widest2 opacity-50">small things, deliberately kept</p><div className="mt-10 grid gap-12 sm:grid-cols-2">{cards.slice(0, 6).map((p, i) => <div key={p.id} className={i % 2 ? "sm:translate-y-16" : ""}><Photo photo={p} treatment="warm" aspect={i % 3 ? "aspect-[4/5] w-full" : "aspect-[3/2] w-full"} /><p className="mt-3 max-w-xs font-serif italic opacity-70">{p.caption || "Add the story behind this photo"}</p></div>)}</div></section>
    <DistributedStory ctx={ctx} />
    <Finale ctx={ctx} />
  </div>;
}
