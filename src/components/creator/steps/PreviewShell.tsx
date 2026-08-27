"use client";

import React, { useMemo, useState } from "react";
import { StepEyebrow } from "@/components/ui/Editorial";
import type { StepNav } from "@/components/creator/CreatorApp";
import { useProject } from "@/state/projectStore";
import { templateById } from "@/lib/templates";
import { cn } from "@/lib/utils";
import type { CreatorStepId, MemoryKey, TemplateId } from "@/lib/types";
import { TemplateView } from "@/templates";
import { PublishPanel } from "@/components/creator/publishing/PublishPanel";

const CONTROL_LINKS: Array<{ step: CreatorStepId; label: string; note: string }> = [
  { step: "person", label: "Edit", note: "person & name" },
  { step: "world", label: "Vibes", note: "their world" },
  { step: "style", label: "Style", note: "the template" },
  { step: "age", label: "Age", note: "the chapter" },
  { step: "color", label: "Colors", note: "the atmosphere" },
  { step: "photos", label: "Photos", note: "the memories" },
  { step: "words", label: "Words", note: "the details" },
];

/** The creator only frames the work. The stage itself always uses the real recipient renderer. */
export default function PreviewShell({ nav: _nav }: { nav: StepNav }) {
  const { project, goToStep, dispatch } = useProject();
  const [asRecipient, setAsRecipient] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [edit, setEdit] = useState(false);
  const templateId = (project.templateId ?? "contact-sheet") as TemplateId;
  const template = templateById(templateId);

  const readyCount = useMemo(
    () => [project.person.fullName, project.age, project.templateId, project.paletteId].filter(Boolean).length,
    [project.person.fullName, project.age, project.templateId, project.paletteId]
  );

  const saveWord = (key: string, value: string) => {
    dispatch({ type: "setMemoryAnswer", key: key as MemoryKey, answer: value });
  };

  return (
    <section>
      <StepEyebrow index="08" label="Preview" />
      <h1 className="mt-4 font-display text-4xl font-light leading-[1.02] tracking-tightest sm:text-5xl lg:text-6xl">
        Your birthday world<br />is <em className="italic">ready to enter.</em>
      </h1>
      <p className="mt-4 max-w-xl text-ink-soft">The frame below is the actual recipient experience: no dashboard, no navigation, just their photos and their story.</p>

      <nav className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-line py-4">
        {CONTROL_LINKS.map((c) => <button key={c.step} type="button" onClick={() => goToStep(c.step)} className="group text-left"><span className="font-display text-lg transition-colors group-hover:text-ember">{c.label}</span><span className="block font-mono text-[9px] uppercase tracking-widest2 text-ink-faint">{c.note}</span></button>)}
        <div className="ml-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest2">
          <button type="button" onClick={() => setDevice("desktop")} className={cn("border px-2 py-1", device === "desktop" && "border-ink bg-ink text-paper")}>Desktop</button>
          <button type="button" onClick={() => setDevice("mobile")} className={cn("border px-2 py-1", device === "mobile" && "border-ink bg-ink text-paper")}>Mobile</button>
          <button type="button" onClick={() => setEdit((v) => !v)} className={cn("border px-2 py-1", edit && "border-ember text-ember")}>{edit ? "Editing words" : "Edit words"}</button>
          <button type="button" onClick={() => setAsRecipient(true)} className="border border-ink bg-ink px-3 py-1 text-paper">Preview as recipient</button>
        </div>
      </nav>

      <article className={cn("mt-10 overflow-hidden border border-line bg-white shadow-[0_18px_60px_rgba(27,24,21,.12)]", device === "mobile" && "mx-auto max-w-[430px]")}>
        <TemplateView project={project} templateId={templateId} device={device} edit={edit} onEdit={saveWord} />
      </article>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
        <span>{template?.name ?? "Contact Sheet"} · foundation {readyCount}/4 · {project.photos.length} photo{project.photos.length === 1 ? "" : "s"}</span>
        <span className="normal-case text-ink-soft">Text can be edited in-place; photo replacement, crop, order and hero selection live in Photos.</span>
      </div>
      <PublishPanel />

      {asRecipient && <div className="fixed inset-0 z-[70] overflow-y-auto bg-black"><button type="button" onClick={() => setAsRecipient(false)} className="fixed right-4 top-4 z-[71] border border-white/40 bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-widest2 text-white backdrop-blur-sm">Exit preview</button><TemplateView project={project} templateId={templateId} device="auto" /></div>}
    </section>
  );
}
