"use client";

import React, { useEffect, useState } from "react";
import type { RenderCtx } from "./types";

export function CountdownGate({ ctx, children }: { ctx: RenderCtx; children: React.ReactNode }) {
  const unlockAt = ctx.project.publishing.unlockAt;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!unlockAt) return; const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, [unlockAt]);
  if (!unlockAt || new Date(unlockAt).getTime() <= now) return <>{children}</>;
  const delta = Math.max(0, new Date(unlockAt).getTime() - now);
  const days = Math.floor(delta / 86_400_000); const hours = Math.floor(delta / 3_600_000) % 24; const minutes = Math.floor(delta / 60_000) % 60;
  const labels: Record<string, string> = { cinema: "PREMIERING IN", archive: "ARCHIVE OPENS IN", "internet-person": "VERSION DEPLOYS IN", "cover-star": "ISSUE DROPS IN" };
  return <main className="flex min-h-[100svh] items-center justify-center px-6 text-center sm:min-h-screen" style={{ background: ctx.theme.bg, color: ctx.theme.text }}><div><p className="font-mono text-[10px] uppercase tracking-widest2 opacity-60">{labels[ctx.id] ?? "OPENS IN"}</p><h1 className="mt-5 font-display text-[18vw] leading-none sm:text-8xl" style={{ fontFamily: ctx.fonts.display }}>{days}<span className="text-[.35em]">d</span> {String(hours).padStart(2, "0")}<span className="text-[.35em]">h</span> {String(minutes).padStart(2, "0")}<span className="text-[.35em]">m</span></h1><p className="mt-6 font-mono text-[10px] uppercase tracking-widest2 opacity-60">this world unlocks on the birthday</p></div></main>;
}
