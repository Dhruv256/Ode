"use client";

import React from "react";
import type { TemplatePreviewKind } from "@/lib/types";

/**
 * Template selector previews — small art-directed CSS compositions.
 * Each kind gets its own distinct visual system (no identical rounded cards).
 * `colors[0]` is the ground, `colors[1]` the type color, the rest accents.
 * In phase 2 these become live miniature renders of the real templates.
 */

export default function TemplatePreview({
  kind,
  colors,
  name = "AMARA",
}: {
  kind: TemplatePreviewKind;
  colors: string[];
  name?: string;
}) {
  const ground = colors[0] ?? "#F4F0E7";
  const ink = colors[1] ?? "#1B1815";
  const a = colors[2] ?? ink;
  const b = colors[3] ?? a;

  switch (kind) {
    case "contact-sheet":
      return (
        <div className="flex h-full flex-col p-4" style={{ background: ground }}>
          <div className="flex justify-between font-mono text-[8px]" style={{ color: ink }}>
            <span>ROLL 07 · 36EXP</span>
            <span>ISO 400</span>
          </div>
          <div className="mt-2 grid flex-1 grid-cols-4 gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="relative border" style={{ borderColor: ink, opacity: i === 3 ? 1 : 0.55 }}>
                <div className="h-full w-full" style={{ background: i % 3 === 0 ? b : i % 3 === 1 ? a : ink, opacity: 0.25 }} />
                <span className="absolute bottom-0 left-0 px-0.5 font-mono text-[7px]" style={{ color: ink }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case "cut-and-paste":
      return (
        <div className="relative h-full overflow-hidden p-4" style={{ background: ground }}>
          <div className="absolute left-[12%] top-[14%] h-16 w-24 -rotate-6 border p-1" style={{ background: "#fff", borderColor: ink }}>
            <div className="h-full w-full opacity-40" style={{ background: a }} />
            <span className="absolute -top-2 left-4 h-3 w-10 rotate-3 opacity-70" style={{ background: b }} />
          </div>
          <div className="absolute right-[14%] top-[38%] rotate-3 font-display text-lg italic" style={{ color: ink }}>
            {name}!!
          </div>
          <div className="absolute bottom-[10%] left-[18%] h-12 w-28 rotate-2 border border-dashed p-1" style={{ borderColor: ink }}>
            <div className="h-full w-full opacity-30" style={{ background: b }} />
          </div>
          <span className="absolute right-[20%] top-[16%] font-mono text-[9px]" style={{ color: ink }}>✂</span>
        </div>
      );

    case "cover-star":
      return (
        <div className="flex h-full flex-col items-center overflow-hidden p-4" style={{ background: ground }}>
          <span className="font-mono text-[8px] tracking-widest2" style={{ color: ink }}>
            THE ANNUAL ISSUE
          </span>
          <span className="mt-1 font-display text-4xl font-black uppercase leading-none tracking-tightest" style={{ color: ink }}>
            {name}
          </span>
          <span className="mt-2 max-w-[80%] text-center font-sans text-[9px] leading-tight" style={{ color: a }}>
            The cover story · {name.toLowerCase()} at full scale · inside: everything
          </span>
          <div className="mt-auto flex w-full items-end justify-between">
            <div className="flex gap-[2px]">{Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="block w-[2px]" style={{ height: `${6 + ((i * 7) % 12)}px`, background: ink }} />
            ))}</div>
            <span className="font-mono text-[7px]" style={{ color: ink }}>№ 01</span>
          </div>
        </div>
      );

    case "cinema":
      return (
        <div className="flex h-full flex-col" style={{ background: ground }}>
          <div className="h-5 w-full" style={{ background: ink }} />
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <span className="font-mono text-[8px] tracking-widest2" style={{ color: a }}>
              SCENE 01 — INT. LIFE
            </span>
            <span className="mt-2 text-center font-display text-xl font-light uppercase tracking-[0.3em]" style={{ color: ink }}>
              {name}
            </span>
            <span className="mt-2 h-px w-16" style={{ background: ink }} />
            <span className="mt-2 font-serif text-[9px] italic" style={{ color: ink, opacity: 0.7 }}>
              directed by everyone who loves them
            </span>
          </div>
          <div className="h-5 w-full" style={{ background: ink }} />
        </div>
      );

    case "internet-person":
      return (
        <div className="p-3" style={{ background: ground }}>
          <div className="border shadow-[3px_3px_0_rgba(0,0,0,0.25)]" style={{ borderColor: ink, background: ground }}>
            <div className="flex items-center justify-between px-2 py-1" style={{ background: ink }}>
              <span className="font-mono text-[8px]" style={{ color: ground }}>birthday.exe</span>
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="block h-1.5 w-1.5" style={{ background: i === 2 ? a : ground }} />
                ))}
              </span>
            </div>
            <div className="p-3">
              <p className="font-sans text-[11px] font-bold" style={{ color: ink }}>
                {name}_official has leveled up
              </p>
              <p className="mt-1 font-mono text-[8px]" style={{ color: a }}>[OK] loading memories… 100%</p>
              <div className="mt-2 flex gap-1.5">
                <span className="border px-2 py-0.5 font-mono text-[8px]" style={{ borderColor: ink, color: ink }}>celebrate</span>
                <span className="border px-2 py-0.5 font-mono text-[8px]" style={{ borderColor: ink, color: ink }}>again</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "after-dark":
      return (
        <div className="relative h-full overflow-hidden p-4" style={{ background: ground }}>
          {[
            { l: "10%", t: "18%", r: "-3deg", w: "34%" },
            { l: "52%", t: "30%", r: "2deg", w: "38%" },
            { l: "22%", t: "58%", r: "1deg", w: "42%" },
          ].map((p, i) => (
            <div key={i} className="absolute border" style={{ left: p.l, top: p.t, width: p.w, height: "26%", transform: `rotate(${p.r})`, borderColor: a }}>
              <div className="h-full w-full" style={{ background: i === 1 ? b : ink, opacity: 0.5 }} />
              <span className="absolute -bottom-4 left-0 font-mono text-[7px]" style={{ color: a }}>01:{20 + i * 7} AM</span>
            </div>
          ))}
          <span className="absolute bottom-[8%] right-[8%] font-mono text-[8px] uppercase tracking-widest2" style={{ color: ground, opacity: 0.6 }}>
            flash on
          </span>
        </div>
      );

    case "sunday-morning":
      return (
        <div className="flex h-full flex-col px-8 py-6" style={{ background: ground }}>
          <div className="flex justify-between font-mono text-[8px]" style={{ color: ink, opacity: 0.5 }}>
            <span>VOL. {name}</span>
            <span>a slow morning</span>
          </div>
          <div className="mt-auto">
            <span className="font-display text-2xl font-light italic leading-snug" style={{ color: ink }}>
              mornings like this,
              <br />
              kept.
            </span>
          </div>
          <div className="mt-4 space-y-[5px]">
            {[100, 72, 88].map((w, i) => (
              <div key={i} className="h-[2px]" style={{ width: `${w}%`, background: a, opacity: 0.4 }} />
            ))}
          </div>
        </div>
      );

    case "polaroid-wall":
      return (
        <div className="relative h-full overflow-hidden p-4" style={{ background: ground }}>
          {[
            { l: "8%", t: "12%", r: -5 },
            { l: "40%", t: "22%", r: 3 },
            { l: "16%", t: "48%", r: 2 },
            { l: "56%", t: "58%", r: -2 },
          ].map((p, i) => (
            <div key={i} className="absolute w-[32%] border bg-white p-1 pb-4 shadow-sm" style={{ left: p.l, top: p.t, transform: `rotate(${p.r}deg)`, borderColor: "#00000015" }}>
              <div className="aspect-square w-full" style={{ background: i % 2 ? a : b, opacity: 0.55 }} />
              <span className="block pt-1 text-center font-mono text-[7px]" style={{ color: ink }}>
                {["beach day", "the laugh", "us", "again"][i]}
              </span>
            </div>
          ))}
        </div>
      );

    case "archive":
      return (
        <div className="flex h-full items-center justify-center p-4" style={{ background: ground }}>
          <div className="w-[78%] border bg-white p-3 shadow-sm" style={{ borderColor: "#00000020" }}>
            <div className="flex justify-between font-mono text-[7px] uppercase" style={{ color: ink }}>
              <span>Accession Nº 1999-{name.slice(0, 2).toUpperCase()}</span>
              <span>KEPT</span>
            </div>
            <p className="mt-2 font-serif text-sm" style={{ color: ink }}>
              {name}, a life —
            </p>
            {[92, 84, 96].map((w, i) => (
              <div key={i} className="mt-1 h-px" style={{ width: `${w}%`, background: ink, opacity: 0.25 }} />
            ))}
            <span className="mt-2 inline-block -rotate-6 border px-1.5 py-0.5 font-mono text-[7px]" style={{ borderColor: a, color: a }}>
              CATALOGUED
            </span>
          </div>
        </div>
      );

    case "dreamscape":
      return (
        <div className="relative h-full overflow-hidden p-4" style={{ background: ground }}>
          <div className="absolute left-[18%] top-[16%] h-20 w-14 rounded-t-full opacity-60" style={{ background: a }} />
          <div className="absolute right-[16%] top-[34%] h-12 w-12 rounded-full opacity-40" style={{ background: b }} />
          <div className="absolute bottom-[14%] left-[38%] h-10 w-24 opacity-30 blur-[1px]" style={{ background: ink }} />
          <span className="absolute left-[8%] top-[58%] max-w-[45%] font-display text-base italic leading-snug" style={{ color: ink }}>
            somewhere between
            <br />
            dream and {name.toLowerCase()}
          </span>
          <span className="absolute right-[10%] top-[12%] font-mono text-[7px]" style={{ color: ink, opacity: 0.5 }}>
            ☾ drift
          </span>
        </div>
      );

    case "poster-city":
      return (
        <div className="relative flex h-full flex-col justify-between overflow-hidden p-4" style={{ background: ground }}>
          <span className="font-display text-6xl font-black uppercase leading-[0.85] tracking-tightest" style={{ color: ink }}>
            {name}
            <br />
            <span style={{ WebkitTextStroke: `1px ${a}`, color: "transparent" }}>IS 25</span>
          </span>
          <div className="flex items-end justify-between">
            <span className="-rotate-2 border px-2 py-0.5 font-mono text-[8px]" style={{ borderColor: b, color: b }}>
              PASTE UP №1
            </span>
            <span className="font-mono text-[8px]" style={{ color: ink }}>★ ★ ★</span>
          </div>
        </div>
      );

    case "yearbook":
      return (
        <div className="flex h-full flex-col p-4" style={{ background: ground }}>
          <div className="flex items-baseline justify-between border-b pb-1" style={{ borderColor: ink }}>
            <span className="font-serif text-xs font-bold uppercase tracking-widest" style={{ color: ink }}>
              Class of Forever
            </span>
            <span className="font-mono text-[7px]" style={{ color: a }}>{name} · pg 214</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="aspect-[4/5] w-full opacity-50" style={{ background: i === 1 ? a : ink }} />
                <span className="mt-0.5 block font-mono text-[6px]" style={{ color: ink, opacity: 0.7 }}>
                  {i === 1 ? name.toUpperCase() : ["most likely", "class clown", "quiet one", "star", "legend"][i % 5]}
                </span>
              </div>
            ))}
          </div>
          <span className="mt-auto pt-1 font-serif text-[9px] italic" style={{ color: ink, opacity: 0.65 }}>
            “see you at the reunion” — everyone
          </span>
        </div>
      );

    default:
      return null;
  }
}
