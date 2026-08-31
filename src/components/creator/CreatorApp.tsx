"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CREATOR_STEPS, useProject } from "@/state/projectStore";
import OdeLogo from "@/components/brand/OdeLogo";
import type { CreatorStepId } from "@/lib/types";
import { cn } from "@/lib/utils";

import GenderStep from "@/components/creator/steps/GenderStep";
import PersonStep from "@/components/creator/steps/PersonStep";
import VibesStep from "@/components/creator/steps/VibesStep";
import TemplateStep from "@/components/creator/steps/TemplateStep";
import AgeStep from "@/components/creator/steps/AgeStep";
import PaletteStep from "@/components/creator/steps/PaletteStep";
import PhotosStep from "@/components/creator/steps/PhotosStep";
import WordsStep from "@/components/creator/steps/WordsStep";
import PreviewShell from "@/components/creator/steps/PreviewShell";

export interface StepNav {
  onNext: () => void;
  onBack: () => void;
  goTo: (step: CreatorStepId) => void;
}

const STEP_LABELS: Record<CreatorStepId, string> = {
  gender: "PERSON",
  person: "PERSON",
  world: "WORLD",
  style: "STYLE",
  age: "AGE",
  color: "COLOR",
  photos: "PHOTOS",
  words: "WORDS",
  preview: "PREVIEW",
};

const STEP_INDEX_LABEL: Partial<Record<CreatorStepId, string>> = {
  person: "01",
  world: "02",
  style: "03",
  age: "04",
  color: "05",
  photos: "06",
  words: "07",
};

export default function CreatorApp() {
  const { project, hydrated } = useProject();
  const [step, setStep] = useState<CreatorStepId>("gender");
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");

  // Jump to the furthest reached step once a stored project hydrates.
  useEffect(() => {
    if (hydrated && project.person.gender && step === "gender") {
      // Returning creator — resume at basics rather than re-asking gender.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Autosave indicator pulse
  useEffect(() => {
    if (!hydrated) return;
    setSaveState("saving");
    const t = window.setTimeout(() => setSaveState("saved"), 700);
    return () => window.clearTimeout(t);
  }, [project.updatedAt, hydrated]);

  const stepIndex = CREATOR_STEPS.indexOf(step);
  const nav: StepNav = useMemo(
    () => ({
      onNext: () =>
        setStep(CREATOR_STEPS[Math.min(stepIndex + 1, CREATOR_STEPS.length - 1)]),
      onBack: () => setStep(CREATOR_STEPS[Math.max(stepIndex - 1, 0)]),
      goTo: (target) => setStep(target),
    }),
    [stepIndex]
  );

  return (
    <div className="min-h-screen bg-paper">
      {/* ── Top bar: minimal branding ── */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-editorial items-center justify-between px-5 py-3 sm:px-8">
          <button
            type="button"
            onClick={() => setStep("gender")}
            className="font-mono text-xs uppercase tracking-widest2 text-ink"
          >
            <span className="flex items-center gap-2">
              <OdeLogo className="h-9 w-9 rounded-[22%]" size={36} variant="light" />
              <span>ODE</span>
            </span>
          </button>

          <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest2 text-ink-faint sm:text-[11px]">
            {step !== "gender" && (
              <span className="hidden sm:inline">
                {STEP_INDEX_LABEL[step]} — {STEP_LABELS[step]}
              </span>
            )}
            <span
              className={cn(
                "flex items-center gap-1.5 transition-opacity",
                saveState === "saved" ? "opacity-70" : "opacity-100"
              )}
            >
              <span
                className={cn(
                  "inline-block h-1.5 w-1.5",
                  saveState === "saved" ? "bg-moss" : "bg-ember"
                )}
              />
              {saveState === "saved" ? "Saved" : "Saving"}
            </span>
          </div>
        </div>
      </header>

      {/* ── Step surface ── */}
      <main className="mx-auto max-w-editorial px-5 pb-32 pt-10 sm:px-8 sm:pt-16">
        {/* A direct remount prevents a hidden previous step (especially the
            photos dropzone) from staying interactive during a transition. */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === "gender" && <GenderStep nav={nav} />}
          {step === "person" && <PersonStep nav={nav} />}
          {step === "world" && <VibesStep nav={nav} />}
          {step === "style" && <TemplateStep nav={nav} />}
          {step === "age" && <AgeStep nav={nav} />}
          {step === "color" && <PaletteStep nav={nav} />}
          {step === "photos" && <PhotosStep nav={nav} />}
          {step === "words" && <WordsStep nav={nav} />}
          {step === "preview" && <PreviewShell nav={nav} />}
        </motion.div>
      </main>

      {/* ── Persistent back control (bottom-left, quiet) ── */}
      {stepIndex > 1 && (
        <button
          type="button"
          onClick={nav.onBack}
          className="fixed bottom-5 left-5 z-40 border border-line bg-paper px-4 py-2 font-mono text-[11px] uppercase tracking-widest2 text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
