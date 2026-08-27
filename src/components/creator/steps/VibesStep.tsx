"use client";

import React from "react";
import { motion } from "framer-motion";
import { StepEyebrow, StepHeading, ActionButton, TextField } from "@/components/ui/Editorial";
import type { StepNav } from "@/components/creator/CreatorApp";
import { useProject } from "@/state/projectStore";
import { VIBES } from "@/lib/vibes";
import { cn } from "@/lib/utils";

const MAX_VIBES = 3;

/** Step 02 · WORLD — personality. Up to 3 vibes plus free text. */
export default function VibesStep({ nav }: { nav: StepNav }) {
  const { project, dispatch } = useProject();
  const selectedCount = project.vibes.vibes.length;

  return (
    <section>
      <StepEyebrow index="02" label="World" />
      <StepHeading className="mt-4">
        What feels most<br />
        <em className="italic">like them?</em>
      </StepHeading>

      <p className="mt-5 max-w-md text-ink-soft">
        Pick up to three. This shapes the templates we suggest, the type we set,
        and how the whole site moves.
      </p>

      <div className="mt-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest2">
        <span className={cn(selectedCount > 0 ? "text-ink" : "text-ink-faint")}>
          {selectedCount} of {MAX_VIBES} selected
        </span>
        <span className="h-px flex-1 bg-line" aria-hidden />
      </div>

      {/* Editorial index list — rows, not cards */}
      <ul className="mt-6 border-t border-line">
        {VIBES.map((vibe, i) => {
          const selectedIndex = project.vibes.vibes.indexOf(vibe.id);
          const isSelected = selectedIndex !== -1;
          const isBlocked = !isSelected && selectedCount >= MAX_VIBES;
          return (
            <li key={vibe.id} className="border-b border-line">
              <motion.button
                type="button"
                aria-pressed={isSelected}
                disabled={isBlocked}
                onClick={() => dispatch({ type: "toggleVibe", vibeId: vibe.id })}
                whileHover={isBlocked ? undefined : { x: 4 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "group flex w-full items-baseline gap-4 py-4 text-left sm:gap-8 sm:py-5",
                  isBlocked && "opacity-35",
                  isSelected ? "text-ink" : "text-ink-soft hover:text-ink"
                )}
              >
                <span className="w-7 shrink-0 font-mono text-[11px] text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-1 flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <span className="font-display text-xl font-normal leading-tight sm:text-2xl">
                    {vibe.name}
                    <span className="ml-3 font-sans text-sm font-light text-ink-faint">
                      {vibe.description}
                    </span>
                  </span>
                  {/* Motif word appears when selected — a small reward */}
                  <span
                    className={cn(
                      "mt-1 shrink-0 font-mono text-[10px] uppercase tracking-widest2 transition-opacity sm:mt-0",
                      isSelected ? "text-ember opacity-100" : "opacity-0"
                    )}
                  >
                    {isSelected && `№${selectedIndex + 1} · ${vibe.motifWord}`}
                  </span>
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>

      {/* Describe them yourself */}
      <div className="mt-12 max-w-xl">
        <TextField
          label="Describe them yourself"
          value={project.vibes.customVibe ?? ""}
          onChange={(v) => dispatch({ type: "setCustomVibe", text: v })}
          placeholder="foodie, sarcastic, obsessed with Formula 1, always planning trips, somehow knows everybody"
          maxLength={280}
        />
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-ink-faint">
          Written in your words. We will quote you on it.
        </p>
      </div>

      <div className="mt-12">
        <ActionButton onClick={nav.onNext} disabled={selectedCount === 0}>
          Continue → Style
        </ActionButton>
      </div>
    </section>
  );
}
