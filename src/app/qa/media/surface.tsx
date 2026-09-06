"use client";
import { useState } from "react";
import { ProjectProvider, useProject } from "@/state/projectStore";
import PhotosStep from "@/components/creator/steps/PhotosStep";
import { TemplateView } from "@/templates";
import { TEMPLATES } from "@/lib/templates";
import type { TemplateId } from "@/lib/types";
function Surface() {
  const { project } = useProject();
  const [preview, setPreview] = useState(false);
  const [template, setTemplate] = useState<TemplateId>("contact-sheet");
  return <><nav><button onClick={() => setPreview(!preview)}>{preview ? "Edit photos" : "Preview photos"}</button><select aria-label="QA template" value={template} onChange={e => setTemplate(e.target.value as TemplateId)}>{Object.keys(TEMPLATES).map(id => <option key={id}>{id}</option>)}</select></nav><output data-qa-project hidden>{JSON.stringify(project)}</output>{preview ? <TemplateView project={{...project, templateId:template}} templateId={template} device="auto"/> : <main className="mx-auto max-w-5xl p-6"><PhotosStep nav={{onNext:()=>setPreview(true),onBack:()=>{},goTo:()=>{}}}/></main>}</>;
}
export default function MediaQa() { return <ProjectProvider ownerKey="qa-media"><Surface/></ProjectProvider>; }
