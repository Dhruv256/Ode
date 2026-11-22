"use client";

import React, { useMemo, useState } from "react";
import { StepEyebrow } from "@/components/ui/Editorial";
import type { StepNav } from "@/components/creator/CreatorApp";
import { useProject } from "@/state/projectStore";
import { TEMPLATES, templateById } from "@/lib/templates";
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
export default function PreviewShell({ nav }: { nav: StepNav }) {
  const { project, dispatch } = useProject();
  const [asRecipient, setAsRecipient] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile" | "auto">("auto");
  const [edit, setEdit] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [draftStyle, setDraftStyle] = useState<TemplateId>();
  const templateId = draftStyle ?? project.templateId ?? "contact-sheet";
  const previewProject = useMemo(() => draftStyle ? { ...project, templateId: draftStyle } : project, [project, draftStyle]);
  const cancelStyle = () => {
    setDraftStyle(undefined);
    setExploring(false);
  };
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

      <nav className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-1 sm:gap-x-8 sm:gap-y-3 border-y border-line py-4">
        {CONTROL_LINKS.map((c) => <button key={c.step} type="button" onClick={() => nav.goTo(c.step)} className="group min-h-11 text-left"><span className="font-display text-lg transition-colors group-hover:text-ember">{c.label}</span><span className="block font-mono text-[9px] uppercase tracking-widest2 text-ink-faint">{c.note}</span></button>)}
        <div className="flex w-full flex-wrap items-center gap-2 lg:ml-auto lg:w-auto font-mono text-[10px] uppercase tracking-widest2">
          <button type="button" onClick={() => setDevice("desktop")} className={cn("min-h-11 border px-3 py-2", device === "desktop" && "border-ink bg-ink text-paper")}>Desktop</button>
          <button type="button" onClick={() => setDevice("mobile")} className={cn("min-h-11 border px-3 py-2", device === "mobile" && "border-ink bg-ink text-paper")}>Mobile</button>
          <button type="button" onClick={() => setEdit((v) => !v)} className={cn("min-h-11 border px-3 py-2", edit && "border-ember text-ember")}>{edit ? "Editing words" : "Edit words"}</button>
          <button type="button" onClick={() => setAsRecipient(true)} className="min-h-11 border border-ink bg-ink px-3 py-2 text-paper">Preview as recipient</button>
        </div>
      </nav>

      <div className="mt-5">
        <button type="button" className="min-h-11 border border-line px-4 font-display" aria-expanded={exploring} onClick={() => exploring ? cancelStyle() : setExploring(true)}>Explore Styles</button>
        {exploring && <fieldset className="mt-3 min-w-0 border border-line p-3">
          <legend className="px-2 font-display">Change template</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {Object.values(TEMPLATES).map(style => <button type="button" key={style.id} aria-pressed={style.id === templateId} onClick={() => setDraftStyle(style.id)} className="min-h-11 border border-line px-2 py-2 text-left font-display aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper">{style.name}</button>)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="min-h-11 bg-ink px-4 text-paper" onClick={() => {
              dispatch({ type: "setTemplate", templateId });
              cancelStyle();
            }}>Use this style</button>
            <button type="button" className="min-h-11 px-4 underline" onClick={cancelStyle}>Cancel</button>
          </div>
        </fieldset>}
      </div>

      <article className={cn("mt-6 overflow-hidden border border-line bg-white shadow-[0_18px_60px_rgba(27,24,21,.12)]", device === "mobile" && "mx-auto max-w-[430px]")}>
        {!asRecipient && <TemplateView key={templateId} project={previewProject} templateId={templateId} device={device} edit={edit} onEdit={saveWord} />}
      </article>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
        <span>{template?.name ?? "Contact Sheet"} · foundation {readyCount}/4 · {project.photos.length} photo{project.photos.length === 1 ? "" : "s"}</span>
        <span className="normal-case text-ink-soft">Text can be edited in-place; photo replacement, crop, order and hero selection live in Photos.</span>
      </div>
      {draftStyle ? <p className="mt-6 text-sm text-ink-soft">Use this style or cancel to return to publishing.</p> : <PublishPanel />}

      {asRecipient && <div className="fixed inset-0 z-[70] overflow-y-auto bg-black"><button type="button" onClick={() => { setAsRecipient(false); cancelStyle(); }} className="fixed right-4 top-4 z-[71] border border-white/40 bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-widest2 text-white backdrop-blur-sm">Exit preview</button><TemplateView project={previewProject} templateId={templateId} device="auto" /></div>}
    </section>
  );
}
