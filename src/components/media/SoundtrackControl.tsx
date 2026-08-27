"use client";

import React, { useRef, useState } from "react";
import type { SoundtrackAsset, TemplateId } from "@/lib/types";

export function SoundtrackControl({ soundtrack, templateId }: { soundtrack?: SoundtrackAsset; templateId: TemplateId }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  if (!soundtrack || soundtrack.needsRelink) return null;
  const labels: Partial<Record<TemplateId, string>> = { cinema: "play film soundtrack", "internet-person": "play_media.mp3", archive: "listen to archive audio", "cut-and-paste": "play cassette" };
  const toggle = async () => {
    const audio = ref.current;
    if (!audio) return;
    if (audio.paused) { await audio.play(); setPlaying(true); } else { audio.pause(); setPlaying(false); }
  };
  return <div className="absolute right-4 top-4 z-30 sm:right-8 sm:top-8"><audio ref={ref} src={soundtrack.previewUrl} preload="metadata" onEnded={() => setPlaying(false)} /><button type="button" onClick={() => void toggle()} aria-pressed={playing} className="border border-current bg-black/25 px-3 py-2 font-mono text-[9px] uppercase tracking-widest2 backdrop-blur-sm">{playing ? "pause soundtrack" : labels[templateId] ?? "play soundtrack"}</button></div>;
}
