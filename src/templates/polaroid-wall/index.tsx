"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { RenderCtx } from "../system/types";
import { PolaroidCard } from "../system/collage";
import { Finale } from "../system/finale";
import { DistributedStory } from "../system/DistributedStory";

/** A walkable, tactile wall on desktop; a readable layered journey on small screens. */
export default function PolaroidWall({ ctx }: { ctx: RenderCtx }) {
  const rotations = [-7, 4, -2, 8, -4, 2, 6, -6, 3, -1];
  const [wallKey, setWallKey] = useState(0);
  const reduced = useReducedMotion();
  return <div className="min-h-screen tp-paper overflow-hidden px-4 py-10 sm:px-10" style={{ background: ctx.theme.panel, color: ctx.theme.text }}>
    <section className="mx-auto max-w-6xl"><div className="flex justify-between font-mono text-[10px] uppercase tracking-widest2 opacity-60"><span>the {ctx.name} wall</span><span>{ctx.photos.length} pinned moments</span></div><div className="mt-5 flex items-end justify-between gap-6"><h1 className="max-w-3xl font-display text-[14vw] leading-[.79] sm:text-8xl" style={{ fontFamily: ctx.fonts.display }}>{ctx.age ?? "?"} shots<br />of <em>{ctx.name}</em></h1>{ctx.device === "desktop" && <button type="button" onClick={() => setWallKey((n) => n + 1)} className="mb-2 border border-current px-2 py-1 font-mono text-[9px] uppercase tracking-widest2">reset wall</button>}</div>
      <div key={wallKey} className="relative mt-12 grid grid-cols-1 items-start gap-y-8 lg:mt-16 lg:block lg:min-h-[125vh]">{ctx.photos.map((p, i) => <motion.div key={p.id} drag={ctx.device === "desktop" && !reduced} dragConstraints={{ left: -100, right: 100, top: -80, bottom: 80 }} dragElastic={0.06} whileHover={reduced ? undefined : { scale: 1.04, zIndex: 20 }} className={`relative w-[84%] ${i % 2 ? "ml-auto" : "ml-1"} lg:absolute lg:w-[18%]`} style={{ left: ctx.device === "desktop" ? `${4 + (i * 19) % 78}%` : undefined, top: ctx.device === "desktop" ? `${4 + (i * 29) % 78}%` : undefined, rotate: rotations[i % rotations.length] }}><PolaroidCard photo={p} treatment="warm" rotation={0} note={p.caption || `memory ${String(i + 1).padStart(2, "0")}`} /></motion.div>)}</div></section>
    <DistributedStory ctx={ctx} />
    <Finale ctx={ctx} />
  </div>;
}
