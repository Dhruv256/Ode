"use client";

import React, { useRef, useState } from "react";
import { useProject } from "@/state/projectStore";
import { shareUrl, slugifyProject, validSlug } from "@/lib/publishing";
import type { PublishingSettings } from "@/lib/types";

export function PublishPanel() {
  const { project, dispatch } = useProject();
  const input = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const settings = project.publishing;
  const slug = settings.slug || slugifyProject(project);
  const patch = (next: Partial<PublishingSettings>) => dispatch({ type: "patchPublishing", patch: next });
  const publish = async () => {
    setPublishing(true);
    setPublishError(null);
    const next = { ...project, publishing: { ...project.publishing, status: "published" as const, slug, publishedAt: new Date().toISOString() } };
    try {
      const response = await fetch("/api/projects", { method: "POST", headers: { "content-type": "application/json", ...(settings.publishToken ? { "x-birthday-project-token": settings.publishToken } : {}) }, body: JSON.stringify({ project: next }) });
      const result = await response.json() as { error?: string; writeToken?: string };
      if (!response.ok) throw new Error(result.error || "The world could not be published.");
      patch({ ...next.publishing, publishToken: result.writeToken });
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "The world could not be published.");
    } finally {
      setPublishing(false);
    }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(shareUrl(slug)); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { window.prompt("Copy this link", shareUrl(slug)); } };
  const attachSoundtrack = (file?: File) => { if (!file) return; dispatch({ type: "setSoundtrack", soundtrack: { fileName: file.name, previewUrl: URL.createObjectURL(file), mimeType: file.type } }); };

  return <aside className="mt-12 border-t border-line pt-7">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[10px] uppercase tracking-widest2 text-ink-faint">Release settings</p><h2 className="mt-2 font-display text-3xl">Publish with care.</h2></div><span className="border border-ink px-2 py-1 font-mono text-[10px] uppercase tracking-widest2">{settings.status}</span></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><div className="space-y-4"><label className="block font-mono text-[10px] uppercase tracking-widest2">Share URL<input value={slug} onChange={(e) => patch({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} className="mt-2 w-full border-b border-line bg-transparent py-2 font-sans text-base outline-none focus:border-ink" aria-invalid={Boolean(settings.slug && !validSlug(settings.slug))} /></label>{settings.slug && !validSlug(settings.slug) && <p className="font-mono text-[10px] uppercase tracking-widest2 text-ember">Use 3–48 lowercase letters, numbers, and hyphens.</p>}<div className="flex flex-wrap gap-2">{(["private", "link", "public"] as const).map((visibility) => <button key={visibility} type="button" onClick={() => patch({ visibility })} className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-widest2 ${settings.visibility === visibility ? "border-ink bg-ink text-paper" : "border-line"}`}>{visibility === "link" ? "Anyone with link" : visibility}</button>)}</div><p className="text-sm text-ink-soft">{settings.visibility === "link" ? "Not indexed. Only people with the link can open it." : settings.visibility === "private" ? "Draft only. No share link is exposed." : "Public visibility is an explicit choice."}</p></div>
      <div className="border-l border-line pl-0 lg:pl-6"><p className="font-mono text-[10px] uppercase tracking-widest2 text-ink-faint">Optional soundtrack</p><p className="mt-2 text-sm text-ink-soft">Never autoplayed. It appears as an intentional control in the recipient experience.</p><input ref={input} type="file" accept="audio/*" className="hidden" onChange={(e) => { attachSoundtrack(e.target.files?.[0]); e.target.value = ""; }} /><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => input.current?.click()} className="border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-widest2">{project.soundtrack ? "Replace audio" : "Attach audio"}</button>{project.soundtrack && <button type="button" onClick={() => dispatch({ type: "setSoundtrack", soundtrack: undefined })} className="font-mono text-[10px] uppercase tracking-widest2 text-ember">Remove</button>}</div>{project.soundtrack && <p className="mt-3 font-mono text-[10px] uppercase tracking-widest2 text-ink-faint">{project.soundtrack.fileName}</p>}</div></div>
    <label className="mt-6 block max-w-sm font-mono text-[10px] uppercase tracking-widest2">Unlock on birthday <input type="datetime-local" value={settings.unlockAt ?? ""} onChange={(e) => patch({ unlockAt: e.target.value || undefined })} className="mt-2 block w-full border-b border-line bg-transparent py-2 font-sans text-sm outline-none focus:border-ink" /></label>
    {publishError && <p role="alert" className="mt-5 max-w-2xl font-mono text-[10px] uppercase leading-relaxed tracking-widest2 text-ember">{publishError}</p>}
    <div className="mt-7 flex flex-wrap gap-3"><button type="button" disabled={!validSlug(slug) || publishing} onClick={() => void publish()} className="border border-ink bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-widest2 text-paper disabled:cursor-not-allowed disabled:opacity-35">{publishing ? "Publishing…" : settings.status === "published" ? "Update published world" : "Publish"}</button>{settings.status === "published" && settings.visibility !== "private" && <button type="button" onClick={() => void copy()} className="border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-widest2">{copied ? "Copied" : "Copy link"}</button>}{settings.status === "published" && <button type="button" onClick={() => patch({ status: "archived" })} className="font-mono text-[11px] uppercase tracking-widest2 text-ember">Archive</button>}</div>
  </aside>;
}
