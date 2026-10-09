"use client";

import React, { useRef, useState } from "react";
import { useProject } from "@/state/projectStore";
import { shareUrl, slugifyProject, validSlug } from "@/lib/publishing";
import type { PublishingSettings, SoundtrackAsset } from "@/lib/types";
import { experienceFor } from "@/lib/experience";

type UploadSignature = { uploadUrl: string; publicUrl: string; error?: string };

async function uploadBrowserMedia(input: {
  projectId: string;
  assetId: string;
  fileName: string;
  previewUrl: string;
  contentType?: string;
  kind: "image" | "video" | "audio";
}) {
  const localFile = await fetch(input.previewUrl);
  if (!localFile.ok) throw new Error(`Could not read ${input.fileName}. Add that file again, then publish.`);
  const blob = await localFile.blob();
  const contentType = input.contentType || blob.type || (input.kind === "audio" ? "audio/mpeg" : "image/jpeg");
  const signatureResponse = await fetch("/api/media/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ projectId: input.projectId, assetId: input.assetId, fileName: input.fileName, contentType, kind: input.kind, size:blob.size }),
  });
  const signature = await signatureResponse.json() as UploadSignature;
  if (!signatureResponse.ok || !signature.uploadUrl) throw new Error(signature.error || "Could not prepare the media upload.");
  const upload = await fetch(signature.uploadUrl, { method: "PUT", headers: { "content-type": contentType }, body: blob });
  if (!upload.ok) throw new Error(`Could not upload ${input.fileName}. Check the birthday-media Storage bucket and try again.`);
  return signature.publicUrl;
}

export function PublishPanel() {
  const { project, dispatch } = useProject();
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const settings = project.publishing;
  const slug = settings.slug || slugifyProject(project);
  const patch = (next: Partial<PublishingSettings>) => dispatch({ type: "patchPublishing", patch: next });
  const publish = async () => {
    setPublishing(true);
    setPublishError(null);
    try {
      const photos = await Promise.all(project.photos.map(async (photo) => {
        if (!photo.previewUrl.startsWith("blob:")) return photo;
        const previewUrl = await uploadBrowserMedia({ projectId: project.id, assetId: photo.id, fileName: photo.fileName, previewUrl: photo.previewUrl, contentType: photo.mimeType, kind: photo.kind === "video" ? "video" : "image" });
        return { ...photo, previewUrl, needsRelink: false };
      }));
      const soundtrack = project.soundtrack?.previewUrl.startsWith("blob:")
        ? { ...project.soundtrack, previewUrl: await uploadBrowserMedia({ projectId: project.id, assetId: "soundtrack", fileName: project.soundtrack.fileName, previewUrl: project.soundtrack.previewUrl, contentType: project.soundtrack.mimeType, kind: "audio" }), needsRelink: false }
        : project.soundtrack;
      const next = { ...project, photos, soundtrack, publishing: { ...project.publishing, status: "published" as const, slug, publishedAt: new Date().toISOString() } };
      const response = await fetch("/api/projects", { method: "POST", headers: { "content-type": "application/json", ...(settings.publishToken ? { "x-birthday-project-token": settings.publishToken } : {}) }, body: JSON.stringify({ project: next }) });
      const result = await response.json() as { error?: string; writeToken?: string };
      if (!response.ok) throw new Error(result.error || "The world could not be published.");
      photos.forEach((photo) => {
        const previous = project.photos.find((item) => item.id === photo.id);
        if (previous?.previewUrl !== photo.previewUrl) dispatch({ type: "patchPhoto", photoId: photo.id, patch: { previewUrl: photo.previewUrl, needsRelink: false } });
      });
      if (soundtrack?.previewUrl !== project.soundtrack?.previewUrl) dispatch({ type: "setSoundtrack", soundtrack });
      patch({ ...next.publishing, publishToken: result.writeToken });
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "The world could not be published.");
    } finally {
      setPublishing(false);
    }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(shareUrl(slug)); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { window.prompt("Copy this link", shareUrl(slug)); } };

  return <aside className="mt-12 border-t border-line pt-7">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[10px] uppercase tracking-widest2 text-ink-faint">Release settings</p><h2 className="mt-2 font-display text-3xl">Publish with care.</h2></div><span className="border border-ink px-2 py-1 font-mono text-[10px] uppercase tracking-widest2">{settings.status}</span></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><div className="space-y-4"><label className="block font-mono text-[10px] uppercase tracking-widest2">Share URL<input value={slug} onChange={(e) => patch({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} className="mt-2 w-full border-b border-line bg-transparent py-2 font-sans text-base outline-none focus:border-ink" aria-invalid={Boolean(settings.slug && !validSlug(settings.slug))} /></label>{settings.slug && !validSlug(settings.slug) && <p className="font-mono text-[10px] uppercase tracking-widest2 text-ember">Use 3–48 lowercase letters, numbers, and hyphens.</p>}<div className="flex flex-wrap gap-2">{(["private", "link", "public"] as const).map((visibility) => <button key={visibility} type="button" onClick={() => patch({ visibility })} className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-widest2 ${settings.visibility === visibility ? "border-ink bg-ink text-paper" : "border-line"}`}>{visibility === "link" ? "Anyone with link" : visibility}</button>)}</div><p className="text-sm text-ink-soft">{settings.visibility === "link" ? "Not indexed. Only people with the link can open it." : settings.visibility === "private" ? "Draft only. No share link is exposed." : "Public visibility is an explicit choice."}</p></div>
      <SoundConfiguration /></div>
    <label className="mt-6 block max-w-sm font-mono text-[10px] uppercase tracking-widest2">Unlock on birthday <input type="datetime-local" value={settings.unlockAt ?? ""} onChange={(e) => patch({ unlockAt: e.target.value || undefined })} className="mt-2 block w-full border-b border-line bg-transparent py-2 font-sans text-sm outline-none focus:border-ink" /></label>
    {publishError && <p role="alert" className="mt-5 max-w-2xl font-mono text-[10px] uppercase leading-relaxed tracking-widest2 text-ember">{publishError}</p>}
    <div className="mt-7 flex flex-wrap gap-3"><button type="button" disabled={!validSlug(slug) || publishing} onClick={() => void publish()} className="border border-ink bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-widest2 text-paper disabled:cursor-not-allowed disabled:opacity-35">{publishing ? "Publishing…" : settings.status === "published" ? "Update published world" : "Publish"}</button>{settings.status === "published" && settings.visibility !== "private" && <button type="button" onClick={() => void copy()} className="border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-widest2">{copied ? "Copied" : "Copy link"}</button>}{settings.status === "published" && <button type="button" onClick={() => patch({ status: "archived" })} className="font-mono text-[11px] uppercase tracking-widest2 text-ember">Archive</button>}</div>
  </aside>;
}

function SoundConfiguration() {
  const { project, dispatch } = useProject();
  const input = useRef<HTMLInputElement>(null);
  const preview = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);
  const templateId = project.templateId ?? "contact-sheet";
  const profile = experienceFor(templateId).soundProfile;
  const soundtrack = project.soundtrack;
  const patchSound = (patch: Partial<SoundtrackAsset>) => {
    if (soundtrack) dispatch({ type: "setSoundtrack", soundtrack: { ...soundtrack, ...patch } });
  };
  const attach = (file?: File) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("audio/")) { setError("Choose an audio file such as MP3, M4A, WAV, or OGG."); return; }
    if (file.size > 25 * 1024 * 1024) { setError("Keep soundtrack files below 25 MB."); return; }
    dispatch({ type: "setSoundtrack", soundtrack: { fileName: file.name, previewUrl: URL.createObjectURL(file), mimeType: file.type, profileId: "custom", volume: profile.defaultVolume, startAt: 0, fadeIn: 2, fadeOut: 3, loop: true } });
  };

  return <div className="border-l border-line pl-0 lg:pl-6">
    <p className="font-mono text-[10px] uppercase tracking-widest2 text-ink-faint">06 — Sound · {templateId.replaceAll("-", " ")}</p>
    <p className="mt-2 text-sm text-ink-soft">Optional and never autoplayed. The recipient chooses sound through a template-specific entry screen.</p>
    <div className="mt-4 flex flex-wrap gap-2">{profile.options.map((option) => <span key={option} className={`border px-2 py-1 font-mono text-[9px] uppercase tracking-widest2 ${soundtrack?.profileId === option.toLowerCase().replaceAll(" ", "-") ? "border-ink bg-ink text-paper" : "border-line text-ink-faint"}`}>{option}</span>)}</div>
    <input ref={input} type="file" accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm" className="hidden" onChange={(event) => { attach(event.target.files?.[0]); event.target.value = ""; }} />
    <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => input.current?.click()} className="border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-widest2">{soundtrack ? "Replace audio" : "Upload your own"}</button>{soundtrack && <button type="button" onClick={() => dispatch({ type: "setSoundtrack", soundtrack: undefined })} className="font-mono text-[10px] uppercase tracking-widest2 text-ember">Remove</button>}</div>
    {error && <p role="alert" className="mt-3 text-sm text-ember">{error}</p>}
    {soundtrack && <div className="mt-5 space-y-4 border-t border-line pt-4"><div><p className="font-mono text-[9px] uppercase tracking-widest2 text-ink-faint">{soundtrack.fileName}</p><audio ref={preview} src={soundtrack.previewUrl} controls preload="metadata" className="mt-3 h-9 w-full" /></div><label className="block font-mono text-[9px] uppercase tracking-widest2">Volume · {Math.round((soundtrack.volume ?? profile.defaultVolume) * 100)}%<input type="range" min="0" max="1" step="0.05" value={soundtrack.volume ?? profile.defaultVolume} onChange={(event) => patchSound({ volume: Number(event.target.value) })} className="mt-2 w-full" /></label><div className="grid grid-cols-3 gap-3">{([['Start at','startAt'],['Fade in','fadeIn'],['Fade out','fadeOut']] as const).map(([label, key]) => <label key={key} className="font-mono text-[9px] uppercase tracking-widest2">{label}<input type="number" min="0" max={key === "startAt" ? 3600 : 15} step="0.5" value={soundtrack[key] ?? (key === "startAt" ? 0 : key === "fadeIn" ? 2 : 3)} onChange={(event) => patchSound({ [key]: Number(event.target.value) })} className="mt-2 w-full border-b border-line bg-transparent py-1 font-sans text-sm" /><span className="normal-case text-ink-faint">seconds</span></label>)}</div><label className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest2"><input type="checkbox" checked={soundtrack.loop ?? true} onChange={(event) => patchSound({ loop: event.target.checked })} /> Loop soundtrack</label></div>}
  </div>;
}
