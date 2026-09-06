"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { MotionConfig, motion, useReducedMotion, type Target } from "framer-motion";
import type { TemplateId, VibeId } from "@/lib/types";

export const MOTION = {
  micro: .15, control: .22, content: .38, section: .58, hero: .85, carousel: .55,
  autoplay: 2500,
  expressive: [.22, 1, .36, 1] as const,
  entrance: [.16, 1, .3, 1] as const,
  controlled: [.4, 0, .2, 1] as const,
  pickup: { type: "spring" as const, stiffness: 260, damping: 28, mass: .7 },
};

export const MOTION_PROFILES: Record<TemplateId, { name: string; from: Target; to: Target }> = {
  "contact-sheet": { name: "darkroom-development", from: { opacity: .35 }, to: { opacity: 1 } },
  "cut-and-paste": { name: "paper-placement", from: { opacity: .65, rotate: -.8, y: 10 }, to: { opacity: 1, rotate: 0, y: 0 } },
  "cover-star": { name: "editorial-unmask", from: { clipPath: "inset(0 8% 0 0)" }, to: { clipPath: "inset(0 0% 0 0)" } },
  cinema: { name: "aperture-opening", from: { clipPath: "inset(7% 0 7% 0)", opacity: .75 }, to: { clipPath: "inset(0% 0 0% 0)", opacity: 1 } },
  "internet-person": { name: "window-expand", from: { scale: .985, transformOrigin: "top left", opacity: .7 }, to: { scale: 1, opacity: 1 } },
  archive: { name: "catalogue-slide", from: { x: -12, opacity: .8 }, to: { x: 0, opacity: 1 } },
  "after-dark": { name: "exposure-hold", from: { opacity: .55, scale: 1.008 }, to: { opacity: 1, scale: 1 } },
  "sunday-morning": { name: "light-settle", from: { opacity: .8 }, to: { opacity: 1 } },
  "polaroid-wall": { name: "print-placement", from: { rotate: .7, scale: .985 }, to: { rotate: 0, scale: 1 } },
  dreamscape: { name: "island-surface", from: { scale: .97, opacity: .65 }, to: { scale: 1, opacity: 1 } },
  "poster-city": { name: "poster-unroll", from: { clipPath: "inset(0 0 4% 0)" }, to: { clipPath: "inset(0 0 0% 0)" } },
  yearbook: { name: "page-settle", from: { rotateY: 3, transformOrigin: "left center" }, to: { rotateY: 0 } },
};

/** Every selected vibe contributes; minimal takes precedence for motion restraint. */
export const VIBE_MODIFIERS: Record<VibeId, { pace: number; density: number; accent: string }> = {
  "main-character": { pace: 1.15, density: 1.05, accent: "Premiere edition" },
  "soft-sentimental": { pace: 1.08, density: 1.05, accent: "A little keepsake" },
  "chaos-energy": { pace: .85, density: .9, accent: "Good trouble" },
  "old-soul": { pace: 1.05, density: 1, accent: "Collected with care" },
  "minimal-cool": { pace: .65, density: .85, accent: "Only the essentials" },
  "sunshine-human": { pace: .9, density: .95, accent: "The golden hours" },
  "midnight-person": { pace: 1.1, density: 1, accent: "After hours" },
  "creative-soul": { pace: .95, density: .95, accent: "From the studio" },
  explorer: { pace: 1, density: .95, accent: "Places still to go" },
  "retro-kid": { pace: .85, density: .9, accent: "An original pressing" },
  romantic: { pace: 1.1, density: 1.05, accent: "With feeling" },
  "internet-native": { pace: .8, density: .9, accent: "Saved to favourites" },
};

export function vibeDirection(vibes: readonly VibeId[]) {
  const selected = vibes.map(v=>VIBE_MODIFIERS[v]).filter(Boolean);
  return { pace: selected.length ? selected.reduce((n,v)=>n+v.pace,0)/selected.length : 1,
    density: selected.length ? selected.reduce((n,v)=>n+v.density,0)/selected.length : 1,
    minimal: vibes.includes("minimal-cool"), playful: vibes.includes("chaos-energy") || vibes.includes("sunshine-human") };
}
const MotionContext = createContext({ id: "contact-sheet" as TemplateId, vibes: [] as VibeId[] });
export function TemplateMotion({ id, vibes, children }: { id: TemplateId; vibes: VibeId[]; children: ReactNode }) {
  return <MotionContext.Provider value={{id,vibes}}><MotionConfig reducedMotion="user" transition={{duration:MOTION.content,ease:MOTION.expressive}}>{children}</MotionConfig></MotionContext.Provider>;
}

/** Alternate moving scenes with still anchors; nothing controls scroll speed. */
export function Scene({ children, className, style, still = false }: { children: ReactNode; className?: string; style?: CSSProperties; still?: boolean }) {
  const {id,vibes}=useContext(MotionContext); const reduced=useReducedMotion();
  const direction=vibeDirection(vibes); const profile=MOTION_PROFILES[id];
  const quiet=Boolean(reduced || still || direction.minimal);
  return <motion.section data-experience-chapter data-motion-scene={quiet ? "still" : profile.name}
    initial={quiet ? false : profile.from} whileInView={profile.to}
    viewport={{once:true,amount:"some",margin:"0px 0px -48px 0px"}}
    transition={{duration:reduced ? 0 : MOTION.section*direction.pace,ease:id==="poster-city"||id==="contact-sheet"?MOTION.controlled:MOTION.entrance}}
    className={className} style={style}>{children}</motion.section>;
}
