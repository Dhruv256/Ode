"use client";

import React from "react";
import { ProjectProvider, useProject } from "@/state/projectStore";
import { TemplateView } from "@/templates";
import type { TemplateId } from "@/lib/types";

export function PublishedWorld({ slug }: { slug: string }) {
  return <ProjectProvider><PublishedWorldBody slug={slug} /></ProjectProvider>;
}

function PublishedWorldBody({ slug }: { slug: string }) {
  const { project, hydrated } = useProject();
  if (!hydrated) return <main className="grid min-h-screen place-items-center bg-black font-mono text-[10px] uppercase tracking-widest2 text-white/70">opening birthday world…</main>;
  const allowed = project.publishing.status === "published" && project.publishing.visibility !== "private" && project.publishing.slug === slug;
  if (!allowed) return <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-[#f4f0e7]"><div><p className="font-mono text-[10px] uppercase tracking-widest2 opacity-55">This birthday world is not available</p><p className="mt-3 font-display text-3xl italic">Ask its creator for an active private link.</p></div></main>;
  return <TemplateView project={project} templateId={(project.templateId ?? "contact-sheet") as TemplateId} device="auto" />;
}
