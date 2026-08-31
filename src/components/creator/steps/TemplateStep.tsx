"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StepEyebrow, StepHeading, ActionButton } from "@/components/ui/Editorial";
import TemplatePreview from "@/components/creator/TemplatePreview";
import type { StepNav } from "@/components/creator/CreatorApp";
import { useProject } from "@/state/projectStore";
import { ALL_TEMPLATES, recommendedTemplatesFor, templateById } from "@/lib/templates";
import { paletteById } from "@/lib/palettes";
import { cn } from "@/lib/utils";
import { experienceFor } from "@/lib/experience";

/**
 * Step 03 · STYLE — browsing an editorial moodboard, not a card grid.
 * Asymmetric spans, large visuals, typography samples, motion hints.
 */
export default function TemplateStep({ nav }: { nav: StepNav }) {
  const { project, dispatch } = useProject();
  const [previewing, setPreviewing] = useState<string | null>(null);

  const recommended = useMemo(
    () => recommendedTemplatesFor(project.vibes.vibes),
    [project.vibes.vibes]
  );

  const displayName = (project.person.nickname || project.person.fullName || "AMARA")
    .split(" ")[0]
    .toUpperCase();

  // Asymmetric editorial rhythm across a 6-col grid.
  const spanFor = (i: number) =>
    i % 4 === 0 ? "md:col-span-4" : i % 4 === 1 ? "md:col-span-2" : i % 4 === 2 ? "md:col-span-2" : "md:col-span-4";

  const previewDef = templateById(previewing as never);

  return (
    <section>
      <StepEyebrow index="03" label="Style" />
      <StepHeading className="mt-4">
        Choose their<br /><em className="italic">visual system.</em>
      </StepHeading>
      <p className="mt-5 max-w-md text-ink-soft">
        Twelve different interactive media. Choose the kind of world their memories become.
        You can change this later.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-6">
        {ALL_TEMPLATES.map((t, i) => {
          const colors =
            paletteById(t.suggestedPaletteId)?.colors ?? ["#F4F0E7", "#1B1815"];
          const isRecommended = recommended.includes(t.id);
          const isSelected = project.templateId === t.id;
          const experience = experienceFor(t.id);
          return (
            <article
              key={t.id}
              className={cn("group col-span-1", spanFor(i))}
            >
              {/* Large visual composition */}
              <button
                type="button"
                onClick={() => setPreviewing(t.id)}
                className={cn(
                  "block aspect-[16/10] w-full overflow-hidden border text-left transition-all duration-300",
                  isSelected
                    ? "border-ink shadow-[0_0_0_1px_#1B1815]"
                    : "border-line hover:border-ink hover:shadow-[0_8px_30px_rgba(27,24,21,0.12)]"
                )}
                aria-label={`Preview ${t.name}`}
              >
                <div className={`tp-mini-preview tp-mini-${t.previewKind} h-full w-full`}>
                  <TemplatePreview kind={t.previewKind} colors={colors} name={displayName} />
                </div>
              </button>

              {/* Meta line */}
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl leading-tight">
                    {String(i + 1).padStart(2, "0")} · {t.name}
                  </h3>
                  <p className="mt-1 max-w-[52ch] font-sans text-sm leading-snug text-ink-soft">
                    {t.description}
                  </p>
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest2 text-ink-faint">
                    {experience.navigationModel.replaceAll("-", " ")} · {experience.primaryEffect}
                  </p>
                </div>
                {isRecommended && (
                  <span className="shrink-0 -rotate-3 border border-ember px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest2 text-ember">
                    For them
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <ActionButton
                  variant={isSelected ? "solid" : "ghost"}
                  onClick={() => dispatch({ type: "setTemplate", templateId: t.id })}
                  className="!px-4 !py-2 !text-[11px]"
                >
                  {isSelected ? "✓ Using this" : `Use ${t.name}`}
                </ActionButton>
                <button
                  type="button"
                  onClick={() => setPreviewing(t.id)}
                  className="font-mono text-[11px] uppercase tracking-widest2 text-ink-faint underline underline-offset-4 transition-colors hover:text-ink"
                >
                  Preview template
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-14 flex items-center gap-5 border-t border-line pt-6">
        <ActionButton onClick={nav.onNext} disabled={!project.templateId}>
          Continue → Age
        </ActionButton>
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
          {project.templateId
            ? `“${templateById(project.templateId)?.name}” selected`
            : "Pick one to continue — you can change it later"}
        </span>
      </div>

      {/* ── Full preview overlay ── */}
      <AnimatePresence>
        {previewDef && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 p-4 sm:p-8"
            onClick={() => setPreviewing(null)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-full w-full max-w-3xl overflow-y-auto border border-line bg-paper p-5 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`tp-mini-preview tp-mini-${previewDef.previewKind} aspect-[16/9] w-full overflow-hidden border border-line`}>
                <TemplatePreview
                  kind={previewDef.previewKind}
                  colors={paletteById(previewDef.suggestedPaletteId)?.colors ?? ["#F4F0E7", "#1B1815"]}
                  name={displayName}
                />
              </div>
              <h3 className="mt-5 font-display text-3xl">{previewDef.name}</h3>
              <p className="mt-2 max-w-prose text-ink-soft">{previewDef.description}</p>

              <p className="mt-5 max-w-xl font-display text-xl italic leading-snug">
                {experienceFor(previewDef.id).spatialModel}. {experienceFor(previewDef.id).interactionProfile}.
              </p>

              <dl className="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 font-mono text-xs sm:grid-cols-2">
                <Meta label="Experience" value={`${experienceFor(previewDef.id).navigationModel.replaceAll("-", " ")} · ${experienceFor(previewDef.id).cameraModel.replaceAll("-", " ")}`} note={experienceFor(previewDef.id).transitionLanguage} />
                <Meta label="Signature" value={experienceFor(previewDef.id).primaryEffect} note={experienceFor(previewDef.id).secondaryEffects.join(" · ")} />
                <Meta label="Best with" value={experienceFor(previewDef.id).bestWith} note={experienceFor(previewDef.id).mobileInterpretation} />
                <Meta label="Optional sound" value={experienceFor(previewDef.id).capabilities.supportsSound ? "Yes" : "No"} note={experienceFor(previewDef.id).soundProfile.options.join(" · ")} />
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <ActionButton
                  onClick={() => {
                    dispatch({ type: "setTemplate", templateId: previewDef.id });
                    setPreviewing(null);
                  }}
                >
                  Use {previewDef.name}
                </ActionButton>
                <button
                  type="button"
                  onClick={() => setPreviewing(null)}
                  className="font-mono text-[11px] uppercase tracking-widest2 text-ink-faint underline underline-offset-4 hover:text-ink"
                >
                  Keep browsing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Meta({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <dt className="uppercase tracking-widest2 text-ink-faint">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
      {note && <dd className="mt-0.5 italic text-ink-faint">{note}</dd>}
    </div>
  );
}
