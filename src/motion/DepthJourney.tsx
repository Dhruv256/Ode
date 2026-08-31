"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { PhotoAsset } from "@/lib/types";
import type { Treatment } from "@/templates/system/types";
import { Photo } from "@/templates/system/photo";
import { AutoCarousel } from "@/templates/system/AutoCarousel";
import { useMobileComposition } from "@/templates/system/responsive";

/** CSS 3D fallback: spatial photo planes without downloading a WebGL runtime. */
export function DepthJourney({ photos, treatment, name }: { photos: PhotoAsset[]; treatment: Treatment; name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mobile = useMobileComposition();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const hero = photos[0];
  const heroScale = useTransform(scrollYProgress, [0, 0.8], reduced ? [1, 1] : [0.45, 1.55]);
  const heroZ = useTransform(scrollYProgress, [0, 1], reduced ? ["0px", "0px"] : ["-340px", "140px"]);
  if (mobile) return <section className="relative px-5 py-20" aria-label="Dream sequence"><p className="font-mono text-[10px] uppercase tracking-widest2 opacity-60">drifting toward {name}</p><AutoCarousel className="mt-8" items={photos.slice(0, 6)} getKey={(photo) => photo.id} kind="orbit" visible={1} label="Dream sequence" renderItem={(photo) => <div className="mx-auto w-[72vw]"><Photo photo={photo} treatment={treatment} aspect="aspect-[3/4] w-full" footprint="compact" /></div>} /></section>;
  return <section ref={ref} className="relative h-[190vh] overflow-hidden" style={{ perspective: "1100px" }}>
    <div className="sticky top-0 h-screen overflow-hidden">
      <p className="absolute left-6 top-8 z-20 font-mono text-[10px] uppercase tracking-widest2 sm:left-12">drifting toward {name}</p>
      {photos.slice(1, 6).map((p, i) => <Plane key={p.id} photo={p} treatment={treatment} i={i} progress={scrollYProgress} reduced={Boolean(reduced)} />)}
      {hero && <motion.div style={{ scale: heroScale, z: heroZ, transformStyle: "preserve-3d" }} className="absolute left-1/2 top-1/2 w-[54vw] max-w-xl -translate-x-1/2 -translate-y-1/2 shadow-2xl will-change-transform"><Photo photo={hero} treatment={treatment} aspect="aspect-[3/4] w-full" /></motion.div>}
    </div>
  </section>;
}

function Plane({ photo, treatment, i, progress, reduced }: { photo: PhotoAsset; treatment: Treatment; i: number; progress: ReturnType<typeof useScroll>["scrollYProgress"]; reduced: boolean }) {
  const left = ["4%", "68%", "12%", "72%", "38%"][i];
  const top = ["20%", "15%", "68%", "62%", "8%"][i];
  const z = useTransform(progress, [0, 1], reduced ? ["0px", "0px"] : [`${-500 + i * 70}px`, `${200 + i * 40}px`]);
  const opacity = useTransform(progress, [0, 0.15, 0.9, 1], reduced ? [0.75, 0.75, 0.75, 0.75] : [0, 0.8, 0.8, 0]);
  return <motion.div style={{ left, top, z, opacity, transformStyle: "preserve-3d" }} className="absolute w-[18vw] min-w-28 max-w-56 will-change-transform"><Photo photo={photo} treatment={treatment} aspect="aspect-[4/5] w-full" /></motion.div>;
}
