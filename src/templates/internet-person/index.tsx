"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { Finale } from "../system/finale";
import { DistributedStory } from "../system/DistributedStory";
import { byRole } from "../system/roles";
import { AgeMark } from "../system/motifs";

/**
 * 05 · INTERNET PERSON — beautiful digital chaos.
 * Desktop windows / browser fragments / folders — but no Windows clone.
 * Sophisticated type, restrained nostalgia. On desktop a few windows are
 * draggable; on mobile they stack as interactive objects.
 */

const WINDOWS = [
  { id: "moments", title: "best_moments", tone: 0 },
  { id: "chaos", title: "unreleased_chaos", tone: 1 },
  { id: "iconic", title: "evidence_theyre_iconic", tone: 2 },
  { id: "deleted", title: "photos_we_should_probably_delete", tone: 3 },
];

export default function InternetPerson({ ctx }: { ctx: RenderCtx }) {
  const { theme, name, age, memories, fullName } = ctx;
  const cards = byRole(ctx.roles, "card");
  const hero = ctx.hero ?? ctx.photos[0];
  const [offsets, setOffsets] = useState<Record<string, { x: number; y: number }>>({});

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: theme.bg }}>
      {/* ── Boot screen ── */}
      <section className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center sm:min-h-screen">
        <p className="font-mono text-[12px] tracking-widest2" style={{ color: theme.accent }}>
          BOOTING {fullName.toUpperCase()} {String(age ?? 0).replace(".", ".")}.0
        </p>
        <div className="mt-4 h-px w-40" style={{ background: theme.line, animation: "tp-scroll 2s linear infinite" }} />
        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest2 opacity-50">
          loading memories… 100%
        </p>
      </section>

      {/* ── Draggable window gallery ── */}
      <section className="relative px-4 py-16 sm:px-8">
        <p className="mb-6 font-mono text-[10px] uppercase tracking-widest2" style={{ color: theme.muted }}>
          ~/photos/{name.toLowerCase().replace(/\s+/g, "-")}/age-{age}
        </p>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {WINDOWS.map((w, wi) => {
            const photos = cards.slice(wi * 3, wi * 3 + 3);
            const dragged = offsets[w.id];
            return (
              <motion.div
                key={w.id}
                drag={ctx.device === "desktop"}
                dragConstraints={{ left: -40, right: 40, top: -24, bottom: 24 }}
                dragMomentum={false}
                onDragEnd={(_e, info) =>
                  setOffsets((prev) => ({ ...prev, [w.id]: { x: prev[w.id]?.x + info.offset.x || info.offset.x, y: prev[w.id]?.y + info.offset.y || info.offset.y } }))
                }
                animate={dragged ? dragged : undefined}
                className={ctx.device === "desktop" ? "tp-drag-cursor relative" : "relative"}
                style={ctx.device === "desktop" && wi % 2 ? { marginTop: 16 } : undefined}
              >
                <div className="border" style={{ borderColor: theme.line, background: theme.panel }}>
                  <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: theme.line }}>
                    <span className="font-mono text-[10px] uppercase tracking-widest">{w.title}</span>
                    <span className="flex gap-1">
                      {[theme.accent, theme.accent2, theme.accent3].map((c, i) => (
                        <span key={i} className="h-2 w-2 rounded-full" style={{ background: c }} />
                      ))}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 p-2">
                    {photos.length
                      ? photos.map((p, i) => (
                          <Photo key={p.id} photo={p} treatment={ctx.treatment} aspect="aspect-square w-full" />
                        ))
                      : Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex aspect-square items-center justify-center border border-dashed text-[9px] uppercase opacity-40" style={{ borderColor: theme.line }}>
                            file
                          </div>
                        ))}
                  </div>
                  <div className="px-3 py-2 font-mono text-[9px] uppercase tracking-widest opacity-60" style={{ color: theme.muted }}>
                    {photos.length} of {cards.length || 0} files · status: saved
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── System note ── */}
      <section className="mx-auto flex max-w-2xl flex-col items-start gap-3 px-6 py-16">
        <AgeMark ctx={ctx} />
        {memories.insideJoke ? (
          <p className="font-mono text-sm leading-relaxed opacity-80">&gt; {memories.insideJoke}</p>
        ) : (
          <p className="font-mono text-sm leading-relaxed opacity-60">&gt; no system notes yet — the creator can add an inside joke</p>
        )}
        <div className="h-3 w-px" style={{ background: theme.accent }} />
      </section>

      {/* ── Hero window pinned to the wall ── */}
      {hero && (
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-md border" style={{ borderColor: theme.line }}>
            <div className="flex items-center gap-2 px-3 py-2 font-mono text-[10px]" style={{ background: theme.panel }}>
              <span className="h-2 w-2 rounded-full" style={{ background: theme.accent }} />
              img/{name.toLowerCase().replace(/\s+/g, "-")}.png
            </div>
            <Photo photo={hero} treatment={ctx.treatment} aspect="aspect-[4/5] w-full" />
          </div>
        </section>
      )}

      <DistributedStory ctx={ctx} />
      <Finale ctx={ctx} />
    </div>
  );
}
