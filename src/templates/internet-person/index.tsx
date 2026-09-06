"use client";

import { Scene, MOTION } from "../system/motion";
import { PersonalizationSections } from "../system/PersonalizationSections";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { AutoCarousel, TextCarousel } from "../system/AutoCarousel";
import { AgeMark } from "../system/motifs";

type AppKey = "photos" | "favorites" | "memory" | "messages" | "birthday";
const APPS: Array<{ id: AppKey; icon: string; label: string }> = [
  { id: "photos", icon: "▧", label: "photos" }, { id: "favorites", icon: "☆", label: "favorites" }, { id: "memory", icon: "⌁", label: "memory" }, { id: "messages", icon: "✉", label: "messages" }, { id: "birthday", icon: "▶", label: "birthday.exe" },
];

export default function InternetPerson({ ctx }: { ctx: RenderCtx }) {
  const [booted, setBooted] = useState(false);
  const [active, setActive] = useState<AppKey>("photos");
  const reduced = useReducedMotion();
  useEffect(() => { const timer = window.setTimeout(() => setBooted(true), reduced ? 0 : 350); return () => window.clearTimeout(timer); }, [reduced]);
  return <div className="relative min-h-screen overflow-hidden" style={{ background: ctx.theme.bg }}>
    <AnimatePresence mode="wait">{!booted ? <motion.section key="boot" exit={{ opacity: 0 }} className="grid min-h-[72svh] place-items-center px-6 text-center"><div><p className="font-mono text-xs uppercase tracking-[.38em]" style={{ color: ctx.theme.accent }}>booting {ctx.name.toUpperCase()} {ctx.age ?? "latest"}.0</p><div className="mx-auto mt-5 h-px w-48 overflow-hidden" style={{ background: ctx.theme.line }}><motion.span className="block h-full" style={{ background: ctx.theme.accent }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduced ? 0 : 1 }} /></div><p className="mt-4 font-mono text-[9px] uppercase tracking-widest2 opacity-45">restoring the good files…</p><button type="button" className="min-h-11 mt-3 px-4" onClick={()=>setBooted(true)}>Open desktop now →</button></div></motion.section> : <motion.main key="desktop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-experience-chapter className="mx-auto flex min-h-[88svh] max-w-7xl flex-col px-3 py-4 sm:px-7 sm:py-8">
      <div className="flex items-center justify-between border px-3 py-2 font-mono text-[9px] uppercase tracking-widest2" style={{ borderColor: ctx.theme.line, background: ctx.theme.panel }}><h1 className="!text-base !leading-normal">{ctx.fullName} / personal desktop</h1><span>{ctx.project.birthdayDate?.slice(0,4) || "ODE"} · online</span></div>
      <div className="mt-3 grid flex-1 gap-3 lg:grid-cols-[8rem_minmax(0,1fr)]">
        <nav aria-label="Desktop apps" className="grid grid-cols-5 gap-2 rounded-[2rem] border p-2 lg:block lg:space-y-3 lg:rounded-none lg:border-0">{APPS.map((app) => <button type="button" key={app.id} onClick={() => setActive(app.id)} className={`group flex min-w-0 flex-col items-center gap-1 p-2 text-center ${active === app.id ? "bg-[color:var(--tp-panel)]" : ""}`} aria-pressed={active === app.id}><span className="grid h-10 w-10 place-items-center border text-xl transition-transform group-hover:-translate-y-1" style={{ borderColor: ctx.theme.line, background: app.id === "birthday" ? ctx.theme.accent : ctx.theme.panel, color: app.id === "birthday" ? ctx.theme.bg : ctx.theme.text }}>{app.icon}</span><span className="max-w-full truncate font-mono text-[7px] uppercase tracking-wide sm:text-[8px]">{app.label}</span></button>)}</nav>
        <div className="relative min-h-[36rem] overflow-hidden rounded-[1.8rem] border p-2 sm:rounded-none sm:p-5" style={{ borderColor: ctx.theme.line, background: `linear-gradient(145deg, ${ctx.theme.panel}, ${ctx.theme.bg})` }}><div className="absolute right-4 top-4"><AgeMark ctx={ctx} /></div><AnimatePresence mode="wait"><motion.section key={active} initial={reduced ? false : { opacity: 0, y: 14, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduced ? undefined : { opacity: 0, y: -8 }} className="mx-auto mt-12 w-full max-w-4xl border shadow-[8px_8px_0_var(--tp-line)]" style={{ borderColor: ctx.theme.text, background: ctx.theme.panel }}><div className="flex items-center justify-between border-b px-3 py-2 font-mono text-[9px] uppercase tracking-widest2" style={{ borderColor: ctx.theme.text }}><span>{APPS.find((app) => app.id === active)?.label}.app</span><span>— □ ×</span></div><AppBody active={active} ctx={ctx} /></motion.section></AnimatePresence></div>
      </div>
      <p className="mt-4 text-center font-mono text-[8px] uppercase tracking-[.32em] opacity-40">one window at a time · the rest stay safely minimized</p>
    </motion.main>}</AnimatePresence>
    <PersonalizationSections ctx={ctx} />
    <footer className="tp-desktop-ending"><p>&gt; birthday.exe · update complete</p><h2>{ctx.memories.ending || "The best part is next."}</h2></footer>
  </div>;
}

function AppBody({ active, ctx }: { active: AppKey; ctx: RenderCtx }) {
  const [ran, setRan] = useState(false);
  if (active === "photos") return <div className="p-4 sm:p-7"><p className="mb-5 font-mono text-[8px] uppercase tracking-widest2 opacity-45">{ctx.photos.length} saved files · automatic preview</p>{ctx.photos.length ? <AutoCarousel items={ctx.photos} getKey={(photo) => photo.id} kind="window" visible={ctx.device === "mobile" ? 1 : ctx.photos.length > 1 ? 2 : 1} label="Saved photo files" renderItem={(photo) => <Photo photo={photo} treatment="none" aspect="w-full" footprint="compact" ratio="landscape" />} /> : <Empty text="No photos have been linked yet." />}</div>;
  if (active === "favorites") return <div className="grid min-h-96 place-items-center p-7 text-center"><div className="w-full max-w-2xl"><p className="font-mono text-[8px] uppercase tracking-widest2 opacity-45">favorites.json</p><TextCarousel items={[ctx.memories.song && `song / ${ctx.memories.song}`, ctx.memories.movie && `movie / ${ctx.memories.movie}`, ctx.memories.place && `place / ${ctx.memories.place}`, ctx.memories.obsession && `on repeat / ${ctx.memories.obsession}`].filter(Boolean) as string[]} kind="vertical" className="mt-8 font-display text-[clamp(2rem,7vw,4.5rem)] italic leading-tight" label="Favorite things" /></div></div>;
  if (active === "memory") return <div className="grid min-h-96 place-items-center p-7"><div className="max-w-2xl"><p className="font-mono text-[8px] uppercase tracking-widest2 opacity-45">memory.txt · read only</p><p className="mt-7 font-display text-[clamp(2.2rem,7vw,4.6rem)] italic leading-tight" data-long-copy={(ctx.memories.memory?.length ?? 0) > 160 || undefined}>{ctx.memories.memory || ctx.memories.oneSentence || "This memory is waiting for its words."}</p><p className="mt-7 font-mono text-xs opacity-55" data-long-copy={(ctx.memories.insideJoke?.length ?? 0) > 160 || undefined}>&gt; {ctx.memories.insideJoke || "the private note stays private"}</p></div></div>;
  if (active === "messages") return <div className="grid min-h-96 place-items-center p-7"><div className="max-w-2xl rounded-[1.5rem] p-6 sm:p-9" style={{ background: ctx.theme.bg }}><p className="font-mono text-[8px] uppercase tracking-widest2 opacity-45">message from everyone who loves you</p><p className="mt-7 font-display text-[clamp(2.2rem,7vw,4.8rem)] italic leading-tight" data-long-copy={(ctx.memories.message?.length ?? 0) > 160 || undefined}>{ctx.memories.message || `Happy birthday, ${ctx.name}. The internet is better with you in it.`}</p></div></div>;
  return <div className="min-h-96 p-7 font-mono text-sm leading-8"><p>&gt; birthday.exe --upgrade {ctx.name.toLowerCase()}</p><button type="button" onClick={() => setRan(true)} className="mt-6 border px-4 py-2 text-[9px] uppercase tracking-widest2" style={{ borderColor: ctx.theme.text }}>{ran ? "RUN AGAIN" : "RUN UPDATE"}</button>{ran ? <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8"><p>[████████████████] 100%</p><p className="mt-4 text-xl">UPDATE COMPLETE</p><p>{ctx.name.toUpperCase()} {ctx.age ?? "LATEST"}.0 RUNNING SUCCESSFULLY</p><p className="mt-8 font-sans text-[clamp(2rem,7vw,4.5rem)] italic leading-tight" data-long-copy={(ctx.memories.ending?.length ?? 0) > 160 || undefined}>{ctx.memories.ending || "STAY ONLINE. THE BEST PART IS NEXT."}</p></motion.div> : <p className="mt-8 opacity-45">waiting for user permission…</p>}</div>;
}
function Empty({ text }: { text: string }) { return <div className="grid min-h-72 place-items-center border border-dashed p-8 text-center font-mono text-[9px] uppercase tracking-widest2 opacity-45"><p>{text}</p></div>; }
