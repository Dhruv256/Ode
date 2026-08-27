"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { StepEyebrow, StepHeading, ActionButton } from "@/components/ui/Editorial";
import type { StepNav } from "@/components/creator/CreatorApp";
import { useProject } from "@/state/projectStore";
import {
  CUSTOM_PALETTE_ID,
  PALETTES,
} from "@/lib/palettes";
import { cn, isValidHex, normalizeHex, clamp } from "@/lib/utils";

/**
 * Step 05 · COLOR — an art-direction selector.
 * Each palette is a full direction (ground → type → accents), shown as a
 * wide swatch strip with a live mini-poster preview, never plain radios.
 */
export default function PaletteStep({ nav }: { nav: StepNav }) {
  const { project, dispatch } = useProject();
  const [showCustom, setShowCustom] = useState(
    project.paletteId === CUSTOM_PALETTE_ID
  );

  return (
    <section>
      <StepEyebrow index="05" label="Color" />
      <StepHeading className="mt-4">
        Set the<br /><em className="italic">atmosphere.</em>
      </StepHeading>
      <p className="mt-5 max-w-md text-ink-soft">
        Color runs everything here — ground, type, annotations, borders, overlays,
        motion transitions. Choose a direction or mix your own.
      </p>

      {/* Curated palettes */}
      <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
        {PALETTES.map((p) => {
          const selected = project.paletteId === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  dispatch({ type: "setPalette", paletteId: p.id });
                  setShowCustom(false);
                }}
                className="group block w-full text-left"
              >
                <div
                  className={cn(
                    "flex h-16 w-full items-stretch overflow-hidden border transition-shadow duration-300 sm:h-20",
                    selected
                      ? "border-ink shadow-[0_0_0_1px_#1B1815]"
                      : "border-line group-hover:border-ink"
                  )}
                >
                  {p.colors.map((c, i) => (
                    <span key={i} className="flex-1" style={{ background: c }} />
                  ))}
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className={cn("font-display text-lg", selected && "underline decoration-ember decoration-2 underline-offset-4")}>
                    {p.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest2 text-ink-faint">
                    {p.moodWord}
                  </span>
                </div>
              </button>
            </li>
          );
        })}

        {/* Custom entry */}
        <li>
          <button
            type="button"
            aria-pressed={project.paletteId === CUSTOM_PALETTE_ID}
            onClick={() => {
              dispatch({ type: "setPalette", paletteId: CUSTOM_PALETTE_ID });
              setShowCustom(true);
            }}
            className="group block w-full text-left"
          >
            <div
              className={cn(
                "flex h-16 w-full items-center overflow-hidden border transition-shadow duration-300 sm:h-20",
                project.paletteId === CUSTOM_PALETTE_ID
                  ? "border-ink shadow-[0_0_0_1px_#1B1815]"
                  : "border-line group-hover:border-ink"
              )}
            >
              {(project.customPalette ?? ["#E07A2F", "#22364A", "#D9A441", "#5A6B4D"]).map((c, i) => (
                <span key={i} className="flex-1 self-stretch" style={{ background: c }} />
              ))}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-display text-lg">Custom</span>
              <span className="font-mono text-[10px] uppercase tracking-widest2 text-ink-faint">
                Mix your own
              </span>
            </div>
          </button>
        </li>
      </ul>

      {/* Custom palette editor */}
      {showCustom && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-14 border border-ink p-6 sm:p-8"
        >
          <h3 className="font-display text-2xl">Your palette</h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
            2–6 colors · first color becomes the ground
          </p>
          <CustomPaletteEditor />
        </motion.section>
      )}

      <div className="mt-14 flex items-center gap-5 border-t border-line pt-6">
        <ActionButton onClick={nav.onNext} disabled={!project.paletteId}>
          Continue → Photos
        </ActionButton>
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
          {project.paletteId === CUSTOM_PALETTE_ID
            ? "Custom direction set."
            : project.paletteId
              ? `“${PALETTES.find((p) => p.id === project.paletteId)?.name}” selected.`
              : "Pick a direction to continue."}
        </span>
      </div>
    </section>
  );
}

/* ── Custom palette editor: HEX input · picker · 2–6 colors · reorder ── */

function CustomPaletteEditor() {
  const { project, dispatch } = useProject();
  const colors = project.customPalette ?? ["#E07A2F", "#22364A", "#D9A441", "#5A6B4D"];

  const setColors = (next: string[]) => {
    dispatch({ type: "setCustomPaletteColors", colors: next });
    dispatch({ type: "setPalette", paletteId: CUSTOM_PALETTE_ID });
  };

  const updateAt = (i: number, value: string) => {
    if (!isValidHex(value) && value !== "") return;
    const next = [...colors];
    next[i] = value === "" ? "#000000" : normalizeHex(value);
    setColors(next);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= colors.length) return;
    const next = [...colors];
    [next[i], next[j]] = [next[j], next[i]];
    setColors(next);
  };

  return (
    <div className="mt-6">
      <ul className="space-y-3">
        {colors.map((c, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className="w-6 font-mono text-[10px] text-ink-faint">
              {String(i + 1).padStart(2, "0")}
            </span>
            <label
              className="relative block h-9 w-9 shrink-0 border border-line"
              style={{ background: c }}
              title="Pick color"
            >
              <input
                type="color"
                value={c}
                onChange={(e) => updateAt(i, e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
            <input
              type="text"
              value={c}
              onChange={(e) => {
                const raw = e.target.value.toUpperCase();
                if (isValidHex(raw)) updateAt(i, raw);
                else if (raw.length <= 7) {
                  // keep typing; commit only valid hex
                  const next = [...colors];
                  next[i] = c;
                  setColors(next);
                }
              }}
              className="w-24 border-b border-line bg-transparent pb-1 font-mono text-sm focus:border-ink focus:outline-none"
            />
            <span className="flex-1" />
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
              className="px-2 font-mono text-sm text-ink-faint hover:text-ink disabled:opacity-25">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === colors.length - 1}
              className="px-2 font-mono text-sm text-ink-faint hover:text-ink disabled:opacity-25">↓</button>
            {colors.length > 2 && (
              <button
                type="button"
                onClick={() => setColors(colors.filter((_, j) => j !== i))}
                className="px-2 font-mono text-sm text-ink-faint hover:text-ember"
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-5">
        <button
          type="button"
          disabled={colors.length >= 6}
          onClick={() => setColors([...colors, "#B4502A"])}
          className="border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-widest2 transition-colors hover:border-ink disabled:opacity-30"
        >
          + Add color ({colors.length}/6)
        </button>

        {/* Instant preview */}
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
          Live:
        </span>
        <span
          className="inline-flex items-baseline gap-2 px-3 py-1.5 font-display text-sm italic"
          style={{ background: colors[0], color: colors[1] }}
        >
          {`¼ century of you`}
          <span style={{ color: colors[2] }}>·</span>
          <span className="font-mono not-italic text-[10px]" style={{ color: colors[3] ?? colors[1] }}>
            EST.
          </span>
        </span>
      </div>
    </div>
  );
}

// keep clamp referenced if needed later
void clamp;
