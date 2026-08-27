"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { Finale } from "../system/finale";
import { DistributedStory } from "../system/DistributedStory";

const DepthJourney = dynamic(() => import("@/motion/DepthJourney").then((m) => m.DepthJourney), { ssr: false });

export default function Dreamscape({ ctx }: { ctx: RenderCtx }) {
  const hero = ctx.hero ?? ctx.photos[0];
  return <div className="min-h-screen overflow-hidden" style={{ background: ctx.theme.bg, color: ctx.theme.text }}>
    <section className="relative flex min-h-[100svh] flex-col justify-between px-6 py-16 sm:min-h-screen sm:px-12"><span className="absolute -right-24 top-16 h-96 w-96 rounded-full blur-3xl opacity-30" style={{ background: ctx.theme.accent }} /><span className="absolute -left-28 bottom-10 h-80 w-80 rounded-full blur-3xl opacity-20" style={{ background: ctx.theme.accent2 }} />
      <div className="relative z-10 max-w-4xl"><p className="font-mono text-[10px] uppercase tracking-widest2 opacity-60">somewhere between a dream and a record</p><h1 className="mt-8 font-display text-[18vw] leading-[.75] sm:text-[11rem]" style={{ fontFamily: ctx.fonts.display }}>{ctx.name}<br /><em>{ctx.age ?? "now"}</em></h1></div>{hero && <div className="relative z-10 mt-10 ml-auto w-[62vw] max-w-md rotate-6 shadow-2xl sm:absolute sm:bottom-8 sm:right-[8%] sm:mt-0 sm:w-[44vw]"><Photo photo={hero} treatment="cool" aspect="aspect-[3/4] w-full" /></div>}</section>
    {ctx.photos.length > 1 && <DepthJourney photos={ctx.photos} treatment="cool" name={ctx.name} />}
    <section className="relative mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-20 sm:grid-cols-3 sm:gap-6 sm:py-24">{ctx.photos.slice(1, 10).map((p, i) => <div className={i % 3 === 1 ? "translate-y-8 sm:translate-y-16" : i % 3 === 2 ? "-translate-y-4 sm:-translate-y-8" : ""} key={p.id}><Photo photo={p} treatment="cool" aspect={i % 2 ? "aspect-square w-full" : "aspect-[3/4] w-full"} className="shadow-xl" /></div>)}</section>
    <DistributedStory ctx={ctx} />
    <Finale ctx={ctx} />
  </div>;
}
