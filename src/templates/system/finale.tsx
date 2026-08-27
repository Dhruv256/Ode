"use client";

import React from "react";
import type { RenderCtx } from "./types";
import { Photo } from "./photo";
import { EditableText } from "./editable";
import { Reveal } from "./Reveal";

/**
 * The shared ending. Every template finishes strong — never "Thanks for
 * visiting." Sequence: favorite image → "and somehow, the best part is" →
 * YOU'RE JUST GETTING STARTED → personalised sign-off → faint attribution.
 */
export function Finale({ ctx, image }: { ctx: RenderCtx; image?: React.ReactNode }) {
  const { memories, name, age, edit, onEdit, theme } = ctx;
  const end = memories.ending;
  const signoff = `Happy ${age ?? ""}${age ? nthSuffix(age) : ""}, ${name}.`.trim();
  const endingLine = end || signoff;
  const headline = age === 100 ? "A HUNDRED YEARS IN." : "YOU'RE JUST GETTING STARTED.";
  const preline = memories.message ? memories.message : "and somehow, the best part is";

  return (
    <footer className="relative flex min-h-[72svh] flex-col justify-center px-[var(--page-gutter)] py-[var(--section-gap)] sm:min-h-[90vh]">
      {image}

      {/* Favorite image / finale photo */}
      {!image && ctx.finalePhoto && (
        <div className="mx-auto mb-12 w-full max-w-2xl sm:mb-16">
          <Photo
            photo={ctx.finalePhoto}
            treatment={ctx.treatment}
            aspect="aspect-[4/5] w-full sm:aspect-[4/3]"
          />
        </div>
      )}

      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest2" style={{ color: theme.muted }}>
          {preline}
        </p>
        <h2
          className="mt-6 font-display text-[13vw] font-extralight leading-[0.95] tracking-tightest sm:text-7xl lg:text-8xl"
          style={{ fontFamily: ctx.fonts.display }}
        >
          {headline}
        </h2>

        <EditableText
          value={endingLine}
          editing={edit}
          onEdit={onEdit ? (v) => onEdit("ending-line", v) : undefined}
          as="p"
          className="mt-10 font-mono text-xs uppercase tracking-widest2"
        />
      </Reveal>

      <div className="absolute inset-x-0 bottom-6 px-6 text-center">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-40" style={{ color: theme.muted }}>
          made with an unreasonable amount of love
        </span>
      </div>
    </footer>
  );
}

function nthSuffix(n: number): string {
  const mod = n % 100;
  if (mod >= 11 && mod <= 13) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

/** Reusable rule / divider with an optional mono label. */
export function Rule({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cnRule(className)}>
      {label ? (
        <div className="flex items-center gap-4">
          <span className="h-px flex-1" style={{ background: "var(--tp-line)" }} />
          <span className="font-mono text-[10px] uppercase tracking-widest2 opacity-60">{label}</span>
          <span className="h-px flex-1" style={{ background: "var(--tp-line)" }} />
        </div>
      ) : (
        <div className="h-px" style={{ background: "var(--tp-line)" }} />
      )}
    </div>
  );
}

function cnRule(className?: string) {
  return `w-full ${className ?? ""}`;
}
