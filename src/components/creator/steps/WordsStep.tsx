"use client";

import React, { useState } from "react";
import { StepEyebrow, StepHeading, ActionButton, Chip, SkipButton } from "@/components/ui/Editorial";
import type { StepNav } from "@/components/creator/CreatorApp";
import { useProject } from "@/state/projectStore";
import { MEMORY_QUESTIONS } from "@/lib/questions";
import { resolveMemoryKey } from '@/lib/questionIds';
import { chipLabels } from "@/lib/interests";
import type { MemoryKey } from "@/lib/types";
import { uid } from "@/lib/utils";
import { CUSTOM_MEMORY_LIMIT } from "@/lib/birthdayCapabilities";

/**
 * Step 07 · WORDS — conversational pacing, generous spacing.
 * Every question is optional and has an explicit Skip. Not a survey:
 * no numbers, no required marks, no progress pressure — just questions
 * you'd ask someone you love.
 */
export default function WordsStep({ nav }: { nav: StepNav }) {
  const { project, dispatch } = useProject();
  const [customInterest, setCustomInterest] = useState("");
  // Older locally saved projects may predate these optional collections.
  // Keep this form useful rather than letting one stale value blank the step.
  const interests = Array.isArray(project.interests) ? project.interests : [];
  const memories = Array.isArray(project.memories) ? project.memories : [];
  const customMemories = Array.isArray(project.customMemories) ? project.customMemories : [];

  const answerFor = (key: MemoryKey) =>
    memories.find((m) => (resolveMemoryKey(m.key) ?? resolveMemoryKey(m.id)) === key);

  return (
    <section className="max-w-3xl">
      <StepEyebrow index="07" label="Words" />
      <StepHeading className="mt-4">
        Now the good part.<br />
        <em className="italic">Tell us about them.</em>
      </StepHeading>
      <p className="mt-5 max-w-md text-ink-soft">
        All of this is optional. Answer the ones that come easily, skip the rest —
        even three lines can carry a whole site.
      </p>

      {/* ── Interests (subtle motifs later) ── */}
      <div className="mt-16 border-t border-line pt-10">
        <h2 className="font-display text-2xl">What are they into?</h2>
        <p className="mt-1 font-sans text-sm text-ink-faint">
          We use these as quiet details, never as a costume.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {chipLabels.map((label) => {
            const selected = interests.some(
              (i) => i.label.toLowerCase() === label.toLowerCase()
            );
            return (
              <Chip
                key={label}
                label={label}
                selected={selected}
                onClick={() => dispatch({ type: "toggleInterest", label })}
              />
            );
          })}
        </div>

        {/* Custom interests */}
        <form
          className="mt-4 flex max-w-md items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (customInterest.trim()) {
              dispatch({ type: "addCustomInterest", label: customInterest });
              setCustomInterest("");
            }
          }}
        >
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            placeholder="add your own…"
            maxLength={40}
            className="w-full border-b border-line bg-transparent pb-1 text-sm focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 transition-colors hover:border-ink"
          >
            Add
          </button>
        </form>

        {interests.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {interests.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => dispatch({ type: "removeInterest", interestId: i.id })}
                title="Remove"
                className={
                  i.custom
                    ? "border border-dashed border-ember px-3 py-1.5 text-sm text-ember"
                    : "border border-ink bg-ink px-3 py-1.5 text-sm text-paper"
                }
              >
                {i.label} ✕
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-16 border-t border-line pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">The details only you would know.</h2>
            <p className="mt-1 max-w-lg text-sm text-ink-faint">Add inside jokes, code words, tiny habits, or memories. These become real notes and callbacks in the finished site.</p>
          </div>
          <button type="button" disabled={customMemories.length >= CUSTOM_MEMORY_LIMIT} onClick={() => dispatch({ type: "addCustomMemory", memory: { id: uid(), label: "Inside joke", value: "", icon: "✦", prominence: "normal" } })} className="min-h-11 border border-ink px-4 font-mono text-[10px] uppercase tracking-widest2 disabled:cursor-not-allowed disabled:opacity-40">+ Add a detail</button>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest2 text-ink-faint">{customMemories.length} / {CUSTOM_MEMORY_LIMIT} custom entries</p>
        <div className="mt-6 grid gap-4">
          {customMemories.map((memory, index) => <fieldset key={memory.id} className="grid gap-4 border border-line p-4 sm:grid-cols-[5rem_1fr_10rem]">
            <legend className="px-2 font-mono text-[9px] uppercase tracking-widest2">Detail {String(index + 1).padStart(2, "0")}</legend>
            <label className="text-xs text-ink-faint">Mark<input aria-label={`Detail ${index + 1} mark`} value={memory.icon ?? ""} maxLength={12} onChange={(e) => dispatch({ type: "patchCustomMemory", memoryId: memory.id, patch: { icon: e.target.value } })} className="mt-1 w-full border-b border-line bg-transparent pb-2 text-base text-ink" /></label>
            <label className="text-xs text-ink-faint">Label<input aria-label={`Detail ${index + 1} label`} value={memory.label} maxLength={80} onChange={(e) => dispatch({ type: "patchCustomMemory", memoryId: memory.id, patch: { label: e.target.value } })} className="mt-1 w-full border-b border-line bg-transparent pb-2 text-base text-ink" /></label>
            <label className="text-xs text-ink-faint">Prominence<select aria-label={`Detail ${index + 1} prominence`} value={memory.prominence} onChange={(e) => dispatch({ type: "patchCustomMemory", memoryId: memory.id, patch: { prominence: e.target.value as "subtle" | "normal" | "prominent" } })} className="mt-1 w-full border-b border-line bg-transparent pb-2 text-sm text-ink"><option value="subtle">Subtle</option><option value="normal">Normal</option><option value="prominent">Prominent</option></select></label>
            <label className="text-xs text-ink-faint sm:col-span-3">Memory or inside joke<textarea aria-label={`Detail ${index + 1} memory`} value={memory.value} maxLength={600} rows={2} onChange={(e) => dispatch({ type: "patchCustomMemory", memoryId: memory.id, patch: { value: e.target.value } })} placeholder="Quarter life crisis · Bro listen · That Goa plan…" className="mt-1 w-full resize-y border-b border-line bg-transparent pb-2 text-base leading-relaxed text-ink" /></label>
            <button type="button" onClick={() => dispatch({ type: "removeCustomMemory", memoryId: memory.id })} className="justify-self-start font-mono text-[9px] uppercase tracking-widest2 text-ember sm:col-span-3">Remove detail</button>
          </fieldset>)}
        </div>
      </div>

      {/* ── Questions — generous spacing, optional, each with Skip ── */}
      <div className="mt-16 space-y-16">
        {MEMORY_QUESTIONS.map((q) => {
          const memory = answerFor(q.key);
          const value = memory?.answer ?? "";
          const isSkipped = memory?.skipped === true;
          return (
            <div key={q.key}>
              <div className="flex items-start justify-between gap-6">
                <h2 className="max-w-[28ch] font-display text-2xl font-normal leading-snug sm:text-[1.7rem]">
                  {q.question}
                </h2>
                {!isSkipped && (
                  <span className="mt-2 shrink-0">
                    <SkipButton onClick={() => dispatch({ type: "skipMemory", key: q.key })} />
                  </span>
                )}
              </div>

              {isSkipped ? (
                <p className="mt-3 flex items-center gap-4 font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
                  Skipped
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "setMemoryAnswer", key: q.key, answer: "" })}
                    className="underline underline-offset-4 hover:text-ink"
                  >
                    answer anyway
                  </button>
                </p>
              ) : q.multiline ? (
                <textarea
                  value={value}
                  rows={3}
                  maxLength={1200}
                  onChange={(e) =>
                    dispatch({ type: "setMemoryAnswer", key: q.key, answer: e.target.value })
                  }
                  placeholder={q.placeholder}
                  className="mt-4 w-full resize-y border-b border-line bg-transparent pb-3 font-sans text-lg leading-relaxed placeholder:text-ink-faint/70 focus:border-ink focus:outline-none"
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  maxLength={200}
                  onChange={(e) =>
                    dispatch({ type: "setMemoryAnswer", key: q.key, answer: e.target.value })
                  }
                  placeholder={q.placeholder}
                  className="mt-4 w-full border-b border-line bg-transparent pb-2 font-sans text-lg placeholder:text-ink-faint/70 focus:border-ink focus:outline-none"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-20 border-t border-line pt-8">
        <ActionButton onClick={nav.onNext}>Continue → Preview</ActionButton>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
          {memories.filter((m) => !m.skipped && m.answer.trim()).length} of{" "}
          {MEMORY_QUESTIONS.length} answered
        </p>
      </div>
    </section>
  );
}
