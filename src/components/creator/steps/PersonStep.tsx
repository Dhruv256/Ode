"use client";

import React from "react";
import { StepEyebrow, StepHeading } from "@/components/ui/Editorial";
import type { StepNav } from "@/components/creator/CreatorApp";
import { useProject } from "@/state/projectStore";
import { ActionButton, TextField } from "@/components/ui/Editorial";
import { cn } from "@/lib/utils";
import type { Relationship } from "@/lib/types";

const RELATIONSHIPS: Array<{ id: Relationship; label: string }> = [
  { id: "friend", label: "Friend" },
  { id: "best-friend", label: "Best Friend" },
  { id: "partner", label: "Partner" },
  { id: "sibling", label: "Sibling" },
  { id: "parent", label: "Parent" },
  { id: "colleague", label: "Colleague" },
  { id: "other", label: "Other" },
];

/** Step 01 · PERSON — basics. Only the name is required; everything else is optional. */
export default function PersonStep({ nav }: { nav: StepNav }) {
  const { project, dispatch } = useProject();
  const person = project.person;

  const nameValid = person.fullName.trim().length >= 1;

  return (
    <section className="max-w-2xl">
      <StepEyebrow index="01" label="Person" />
      <StepHeading className="mt-4">
        And who exactly<br />are they<span className="text-ember">?</span>
      </StepHeading>
      <p className="mt-5 text-ink-soft">
        The name will carry the whole site — titles, chapters, covers. Everything
        else is optional color.
      </p>

      <div className="mt-10 space-y-8">
        <TextField
          required
          label="Their full name"
          value={person.fullName}
          onChange={(v) => dispatch({ type: "patchPerson", patch: { fullName: v } })}
          placeholder="As it should appear on the cover"
        />

        <TextField
          label="Nickname"
          value={person.nickname ?? ""}
          onChange={(v) => dispatch({ type: "patchPerson", patch: { nickname: v } })}
          placeholder="What you actually call them"
          maxLength={40}
        />

        <TextField
          label="Pronouns"
          value={person.pronouns ?? ""}
          onChange={(v) => dispatch({ type: "patchPerson", patch: { pronouns: v } })}
          placeholder="she/her · he/him · they/them …"
          maxLength={30}
        />

        <fieldset>
          <legend className="mb-3 font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
            They are your…
          </legend>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIPS.map((r) => {
              const selected = person.relationship === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    dispatch({
                      type: "patchPerson",
                      patch: { relationship: selected ? undefined : r.id },
                    })
                  }
                  className={cn(
                    "border px-3 py-1.5 text-sm transition-colors",
                    selected
                      ? "border-ink bg-ink text-paper"
                      : "border-line text-ink-soft hover:border-ink hover:text-ink"
                  )}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="mt-12 flex items-center gap-4">
        <ActionButton onClick={nav.onNext} disabled={!nameValid}>
          Continue → Their World
        </ActionButton>
        {!nameValid && (
          <span className="font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
            A name is all we need
          </span>
        )}
      </div>
    </section>
  );
}
