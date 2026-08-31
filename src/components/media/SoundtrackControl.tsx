"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { SoundtrackAsset, TemplateId } from "@/lib/types";
import { experienceFor } from "@/lib/experience";

function rampVolume(audio: HTMLAudioElement, to: number, duration = 500) {
  const from = audio.volume;
  const started = performance.now();
  const tick = (now: number) => {
    const progress = Math.min(1, (now - started) / Math.max(1, duration));
    audio.volume = from + (to - from) * progress;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function SoundtrackControl({ soundtrack, templateId, preview = false }: { soundtrack?: SoundtrackAsset; templateId: TemplateId; preview?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const profile = experienceFor(templateId).soundProfile;
  const [choiceMade, setChoiceMade] = useState(preview);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const targetVolume = Math.max(0, Math.min(1, soundtrack?.volume ?? profile.defaultVolume));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !soundtrack) return;
    audio.loop = soundtrack.loop ?? true;
    audio.volume = 0;
    if (soundtrack.startAt && Number.isFinite(soundtrack.startAt)) audio.currentTime = soundtrack.startAt;
    const onVisibility = () => {
      if (document.hidden && !audio.paused) {
        rampVolume(audio, 0, 250);
        window.setTimeout(() => audio.pause(), 260);
        setPlaying(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      audio.pause();
    };
  }, [soundtrack]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0;
    try {
      await audio.play();
      rampVolume(audio, muted ? 0 : targetVolume, (soundtrack?.fadeIn ?? 1.2) * 1000);
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, [muted, soundtrack?.fadeIn, targetVolume]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const fadeMs = Math.max(180, Math.min(5000, (soundtrack?.fadeOut ?? .35) * 1000));
    rampVolume(audio, 0, fadeMs);
    window.setTimeout(() => audio.pause(), fadeMs + 20);
    setPlaying(false);
  }, [soundtrack?.fadeOut]);

  if (!soundtrack || soundtrack.needsRelink) return null;
  const experience = experienceFor(templateId);

  const enter = (withSound: boolean) => {
    setChoiceMade(true);
    if (withSound) void play();
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    setMuted(next);
    rampVolume(audio, next ? 0 : targetVolume, 320);
  };

  return <>
    <audio ref={audioRef} src={soundtrack.previewUrl} preload="metadata" onEnded={() => setPlaying(false)} aria-hidden />
    {!choiceMade && <div className="fixed inset-0 z-[90] grid place-items-center bg-black/90 px-6 text-center text-white backdrop-blur-sm"><div className="max-w-xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.38em] opacity-55">{experience.spatialModel}</p>
      <h2 className="mt-5 font-display text-[clamp(2.5rem,9vw,5.5rem)] leading-[0.88]" style={{ fontFamily: "var(--tp-display)" }}>{profile.entryPrompt}</h2>
      <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={() => enter(true)} className="border border-white bg-white px-5 py-3 font-mono text-[10px] uppercase tracking-widest2 text-black">{profile.enterWithSound}</button><button type="button" onClick={() => enter(false)} className="border border-white/50 px-5 py-3 font-mono text-[10px] uppercase tracking-widest2 text-white">{profile.enterQuietly}</button></div>
      <p className="mt-5 font-mono text-[9px] uppercase tracking-widest2 opacity-45">Sound is optional and can be changed at any time.</p>
    </div></div>}
    {choiceMade && <div className="fixed right-3 top-3 z-[80] flex items-center border border-current bg-black/55 font-mono text-[9px] uppercase tracking-widest2 text-white backdrop-blur-md sm:right-6 sm:top-6"><button type="button" onClick={() => playing ? pause() : void play()} aria-pressed={playing} className="px-3 py-2">{profile.controlLabel} {playing ? "II" : "▶"}</button><button type="button" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? "Unmute soundtrack" : "Mute soundtrack"} className="border-l border-white/35 px-3 py-2">{muted ? "MUTED" : "ON"}</button></div>}
  </>;
}
