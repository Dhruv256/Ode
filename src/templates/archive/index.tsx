"use client";

import React from "react";
import type { RenderCtx } from "../system/types";
import { Photo } from "../system/photo";
import { Reveal } from "../system/Reveal";
import { Finale } from "../system/finale";
import { DistributedStory } from "../system/DistributedStory";
import { byRole } from "../system/roles";

/**
 * 06 · THE ARCHIVE — a personal museum / documentary catalogue.
 * Catalog numbers, accession stamps, archival type, quiet spacing, large
 * documentary photography. Sections (Early Years / People / Places / etc.)
 * only appear where content exists — nothing is invented.
 */
export default function Archive({ ctx }: { ctx: RenderCtx }) {
  const { theme, memories, name, photos } = ctx;
  const frames = byRole(ctx.roles, "contact-frame");
  const big = byRole(ctx.roles, "full-bleed");
  const hero = ctx.hero ?? photos[0];

  const chrono = [...photos].sort((a, b) => (a.dateTaken || "").localeCompare(b.dateTaken || ""));

  return (
    <div className="relative">
      {/* ── Catalogue opening ── */}
      <section className="flex min-h-[100svh] flex-col justify-between px-6 py-16 sm:min-h-screen sm:px-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-widest2" style={{ color: theme.accent }}>
              BIRTHDAY ARCHIVE · EST {ctx.fullName.toUpperCase()}
            </p>
            <h1 className="mt-6 font-didone text-[14vw] font-black leading-[0.85] tracking-tightest sm:text-8xl" style={{ fontFamily: ctx.fonts.display }}>
              {ctx.title}
            </h1>
            <p className="mt-6 max-w-md font-serif text-lg italic" style={{ color: theme.muted }}>
              {memories.oneSentence || `A curated record of ${name}.`}
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col justify-end gap-8">
            <dl className="space-y-3 font-mono text-[11px] uppercase tracking-widest">
              <ArchiveRow k="Collection" v={`THE ${name} COLLECTION`} />
              <ArchiveRow k="Num. photos" v={String(photos.length).padStart(3, "0")} />
              <ArchiveRow k="Accession" v={`Nº ${String(ctx.age ?? 0).padStart(3, "0")}`} />
            </dl>
          </div>
        </div>

        {hero && (
          <Reveal className="mt-10">
            <Photo photo={hero} treatment={ctx.treatment} aspect="aspect-[4/5] w-full sm:aspect-[16/9]" />
            <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest opacity-60">
              <span>ARCHIVE ITEM 001</span>
              <span>{hero.dateTaken || "UNDATED"}</span>
            </div>
          </Reveal>
        )}
      </section>

      {/* ── Large documentary frame ── */}
      {big[0] && (
        <section className="px-6 py-16 sm:px-12">
          <div className="border-t pt-6" style={{ borderColor: theme.line }}>
            <Photo photo={big[0]} treatment={ctx.treatment} aspect="aspect-[4/3] w-full" />
            <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest opacity-60">
              <span>PLATE {String(50 + photos.indexOf(big[0])).padStart(3, "0")}</span>
              <span>{big[0].location || "LOCATION UNRECORDED"}</span>
            </div>
          </div>
        </section>
      )}

      {/* ── Contact-style dense sheet ── */}
      {frames.length > 0 && (
        <section className="px-5 py-10 sm:px-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 sm:gap-2">
            {frames.map((p, i) => (
              <Reveal key={p.id} delay={(i % 6) * 40}>
                <Photo photo={p} treatment={ctx.treatment} aspect="aspect-[4/5] w-full" />
                <p className="mt-1 font-mono text-[9px] uppercase tracking-widest opacity-60">
                  {String(i + 1).padStart(3, "0")}
                </p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Timeline (only if dates exist) ── */}
      {chrono.filter((p) => p.dateTaken).length >= 2 && (
        <section className="px-6 py-16 sm:px-12">
          <p className="font-mono text-[10px] uppercase tracking-widest2" style={{ color: theme.accent }}>
            TIMELINE · CHRONOLOGICAL
          </p>
          <div className="mt-6 space-y-6 border-l pl-6" style={{ borderColor: theme.line }}>
            {chrono.filter((p) => p.dateTaken).slice(0, 8).map((p) => (
              <div key={p.id} className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                <span className="font-mono text-[10px] uppercase tracking-widest sm:col-span-3" style={{ color: theme.muted }}>
                  {p.dateTaken?.slice(0, 7)}
                </span>
                <div className="sm:col-span-9 max-w-md">
                  <Photo photo={p} treatment={ctx.treatment} aspect="aspect-[4/3] w-full" />
                  {p.caption && <p className="mt-1 font-mono text-[10px] uppercase tracking-widest opacity-60">{p.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <DistributedStory ctx={ctx} />
      <Finale ctx={ctx} />
    </div>
  );
}

function ArchiveRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt style={{ color: "var(--tp-muted)" }}>{k}</dt>
      <dd className="text-right" style={{ color: "var(--tp-text)" }}>{v}</dd>
    </div>
  );
}
