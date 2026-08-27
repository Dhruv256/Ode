"use client";

import React from "react";
import { StepEyebrow, StepHeading, ActionButton } from "@/components/ui/Editorial";
import type { StepNav } from "@/components/creator/CreatorApp";
import { useProject } from "@/state/projectStore";
import {
  MILESTONES,
  milestoneOf,
  milestoneTitleFor,
} from "@/lib/milestones";
import { cn } from "@/lib/utils";
import type { BirthdayMilestone } from "@/lib/types";

const QUICK_AGES = [16, 18, 21, 22, 25, 30, 40, 47, 50, 60, 73, 100];

/**
 * Step 04 · AGE — a large numerical selector.
 * Milestone ages carry their label directly under the number;
 * the milestone panel below is driven entirely by lib/milestones.ts.
 */
export default function AgeStep({ nav }: { nav: StepNav }) {
  const { project, dispatch } = useProject();
  const milestone = milestoneOf(project.age);
  const templateTitle =
    project.templateId
      ? milestoneTitleFor(project.age, project.templateId)
      : undefined;

  return (
    <section>
      <StepEyebrow index="04" label="Age" />
      <StepHeading className="mt-4">
        Which chapter are they<br />
        <em className="italic">entering?</em>
      </StepHeading>

      {/* Giant number field */}
      <div className="mt-10 flex flex-wrap items-end gap-6 sm:mt-14">
        <label className="block">
          <span className="sr-only">Their age</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            value={project.age ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") return dispatch({ type: "setAge", age: null });
              const n = Math.min(120, Math.max(1, Number(raw)));
              if (!Number.isNaN(n)) dispatch({ type: "setAge", age: n });
            }}
            placeholder="00"
            className="border-b-2 border-ink bg-transparent pb-1 font-display text-[26vw] font-extralight leading-none tracking-tightest placeholder:text-line focus:outline-none sm:text-[10rem] lg:text-[12rem]"
            style={{ width: `${String(project.age ?? "00").length + 0.6}ch` }}
          />
        </label>
        {milestone && (
          <div className="pb-3 sm:pb-6">
            <span className="font-mono text-xs uppercase tracking-widest2 text-ember">
              {milestone.label}
            </span>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
              Special birthday experience included.
            </p>
          </div>
        )}
      </div>

      {/* Quick picks — milestones subtly marked */}
      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3">
        {QUICK_AGES.map((a) => {
          const m = MILESTONES[a as BirthdayMilestone];
          const selected = project.age === a;
          return (
            <button
              key={a}
              type="button"
              onClick={() => dispatch({ type: "setAge", age: a })}
              className={cn(
                "group flex flex-col items-start transition-colors",
                selected ? "text-ink" : "text-ink-faint hover:text-ink"
              )}
            >
              <span
                className={cn(
                  "font-display text-2xl leading-none",
                  selected && "underline decoration-ember decoration-2 underline-offset-8"
                )}
              >
                {a}
              </span>
              {m && (
                <span className={cn("mt-1.5 font-mono text-[9px] uppercase tracking-widest2", selected ? "text-ember" : "text-ink-faint")}>
                  {m.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Birthday date — optional */}
      <label className="mt-10 block max-w-xs">
        <span className="mb-2 block font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
          Birthday date · optional
        </span>
        <input
          type="date"
          value={project.birthdayDate ?? ""}
          onChange={(e) =>
            dispatch({ type: "setAge", age: project.age, birthdayDate: e.target.value })
          }
          className="w-full border-b border-line bg-transparent pb-2 font-sans text-lg focus:border-ink focus:outline-none"
        />
      </label>

      {/* Milestone concept preview — central config, adapted to the chosen template */}
      {milestone && (
        <div className="mt-12 max-w-xl border border-ink p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-ink-faint">
            Milestone · treatment “{milestone.treatmentStyle}”
          </p>
          <h3 className="mt-3 font-display text-4xl font-light tracking-tightest">
            {templateTitle ?? milestone.label}
          </h3>
          {!templateTitle && project.templateId && (
            <p className="mt-2 font-mono text-[11px] text-ink-faint">
              A bespoke headline for this style arrives with the template build.
            </p>
          )}
          <p className="mt-3 italic text-ink-soft">{milestone.tagline}</p>
          <ul className="mt-5 space-y-1.5">
            {milestone.modules.map((m) => (
              <li key={m.id} className="flex items-baseline gap-3 text-sm">
                <span className="font-mono text-[10px] text-ember">＋</span>
                <span>
                  <span className="font-medium">{m.title}</span>
                  {m.note && <span className="ml-2 text-ink-faint">{m.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12 flex items-center gap-5 border-t border-line pt-6">
        <ActionButton onClick={nav.onNext} disabled={project.age === null}>
          Continue → Color
        </ActionButton>
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
          The number matters. We will use it well.
        </span>
      </div>
    </section>
  );
}
