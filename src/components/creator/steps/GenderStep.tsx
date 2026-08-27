"use client";

import React from "react";
import { motion } from "framer-motion";
import type { StepNav } from "@/components/creator/CreatorApp";
import { useProject } from "@/state/projectStore";
import { cn } from "@/lib/utils";

/**
 * First screen — the generator opens directly on creation.
 * No marketing page. Minimal branding lives in the top bar.
 *
 * The two options use opposing editorial art direction (ink halftone vs
 * paper stripes) instead of stereotypical pink/blue.
 */

export default function GenderStep({ nav }: { nav: StepNav }) {
  const { dispatch } = useProject();

  const choose = (gender: "male" | "female") => {
    dispatch({ type: "setGender", gender });
    nav.onNext(); // transition directly into Step 01
  };

  return (
    <section>
      <p className="font-mono text-[11px] uppercase tracking-widest2 text-ink-faint sm:text-xs">
        A birthday website, made for one person
      </p>
      <h1 className="mt-4 font-display text-5xl font-light leading-[1.02] tracking-tightest sm:text-7xl">
        Who are we
        <br />
        <em className="font-normal italic">celebrating?</em>
      </h1>
      <p className="mt-6 max-w-md font-sans text-base text-ink-soft">
        It takes a few minutes to create their world.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 md:grid-cols-2 md:gap-6">
        {/* ── Male: ink ground, halftone field ── */}
        <GenderPanel
          onClick={() => choose("male")}
          eyebrow="For a him"
          word="Him"
          line="A world built around his photos, his noise, his people."
          composition={
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, #F4F0E7 1.1px, transparent 1.2px)",
                backgroundSize: "11px 11px",
              }}
            />
          }
          dark
        />

        {/* ── Female: paper ground, diagonal rule field ── */}
        <GenderPanel
          onClick={() => choose("female")}
          eyebrow="For a her"
          word="Her"
          line="A world built around her photos, her quiet, her chaos."
          composition={
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, #1B1815 0 1px, transparent 1px 9px)",
              }}
            />
          }
        />
      </div>

      {/* Secondary link — examples live here as taste notes, not testimonials */}
      <div className="mt-10 border-t border-line pt-5 sm:mt-14">
        <details className="group max-w-lg">
          <summary className="cursor-pointer list-none font-mono text-[11px] uppercase tracking-widest2 text-ink-faint underline underline-offset-4 transition-colors hover:text-ink">
            View examples +
          </summary>
          <ul className="mt-4 space-y-1.5 font-mono text-xs leading-relaxed text-ink-faint">
            <li>· A contact sheet for a film-camera obsessive turning 25</li>
            <li>· A magazine cover for a best friend who is the moment</li>
            <li>· An archive for a grandmother entering chapter 100</li>
            <li>· A browser window for someone who lives in the group chat</li>
          </ul>
        </details>
      </div>
    </section>
  );
}

function GenderPanel({
  onClick,
  eyebrow,
  word,
  line,
  composition,
  dark,
}: {
  onClick: () => void;
  eyebrow: string;
  word: string;
  line: string;
  composition: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "group relative block min-h-[320px] overflow-hidden border p-6 text-left sm:min-h-[380px] sm:p-8",
        dark ? "border-ink bg-night text-paper" : "border-line bg-paper-deep text-ink"
      )}
    >
      {composition}
      <div className="relative flex h-full min-h-[272px] flex-col justify-between sm:min-h-[316px]">
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-widest2",
            dark ? "text-paper/50" : "text-ink-faint"
          )}
        >
          {eyebrow}
        </span>

        <span className="font-display text-[22vw] font-extralight italic leading-none tracking-tightest sm:text-[8rem] lg:text-[9.5rem]">
          {word}
        </span>

        <span className="flex items-end justify-between gap-4">
          <span
            className={cn(
              "max-w-[26ch] font-sans text-sm leading-snug",
              dark ? "text-paper/70" : "text-ink-soft"
            )}
          >
            {line}
          </span>
          <span
            className={cn(
              "font-mono text-xs uppercase tracking-widest2 transition-transform duration-200 group-hover:translate-x-1",
              dark ? "text-paper" : "text-ink"
            )}
          >
            →
          </span>
        </span>
      </div>
    </motion.button>
  );
}
