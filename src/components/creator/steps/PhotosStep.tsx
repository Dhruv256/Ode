"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { StepEyebrow, StepHeading, ActionButton } from "@/components/ui/Editorial";
import type { StepNav } from "@/components/creator/CreatorApp";
import { useProject } from "@/state/projectStore";
import { uid, cn, clamp } from "@/lib/utils";
import type { FocalPoint, ImageFitMode, PhotoAsset, PhotoOrientation } from "@/lib/types";
import { BIRTHDAY_PHOTO_LIMIT, HIGH_PHOTO_THRESHOLD, resolvePhotoMode } from "@/lib/birthdayCapabilities";
import { captureDate, analyzePhoto } from "@/lib/photoIntelligence";
import { saveLocalMedia, removeLocalMedia } from "@/lib/localMedia";
import { PhotoOrganizer } from "./PhotoOrganizer";

const FIT_MODES: ImageFitMode[] = ["fit", "fill", "original", "manual"];

/**
 * Step 06 · PHOTOS — "Give us the memories."
 * Drag & drop, multi-file, mobile upload, reorder, hero selection,
 * focal point, fit modes, captions/metadata. Analysis fields stay
 * undefined until a real analysis pass exists — nothing is fabricated.
 */
export default function PhotosStep({ nav }: { nav: StepNav }) {
  const { project, dispatch } = useProject();
  const [dragging, setDragging] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [removed, setRemoved] = useState<PhotoAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const uploadLock = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedMode = project.photoMode ?? "auto";
  const resolvedMode = resolvePhotoMode(project);

  const clearAllPhotos = () => {
    setRemoved(project.photos);
    void removeLocalMedia(project.id, project.photos.map(p=>p.id));
    dispatch({ type: "clearPhotos" });
    setExpandedId(null);
    setUploadError("");
    setConfirmClear(false);
  };

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      if(uploadLock.current)return;
      const list = Array.from(files).filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
      if (list.length === 0) return;
      const relinks=new Set<string>();
      const existing=list.map(file=>{const match=project.photos.find(p=>p.needsRelink&&p.fileName===file.name&&!relinks.has(p.id));if(match)relinks.add(match.id);return match;});
      if (project.photos.length + list.length - relinks.size > BIRTHDAY_PHOTO_LIMIT) {
        setUploadError(`That batch would take this website past ${BIRTHDAY_PHOTO_LIMIT} photos. Nothing was dropped—remove ${project.photos.length + list.length - BIRTHDAY_PHOTO_LIMIT} file${project.photos.length + list.length - BIRTHDAY_PHOTO_LIMIT === 1 ? "" : "s"} from the batch and try again.`);
        return;
      }
      setUploadError("");
      uploadLock.current=true;
      setUploading(true);
      setConfirmClear(false);
      const assets: PhotoAsset[] = [];
      let order = project.photos.length;
      try { for (let index=0;index<list.length;index++) {
        const file=list[index];
        const previewUrl = URL.createObjectURL(file);
        const dims = file.type.startsWith("video/")
          ? await readVideoDimensions(previewUrl)
          : await readImageDimensions(previewUrl);
        const dateTaken = file.type.startsWith("image/") ? await captureDate(file) : undefined;
        const asset: PhotoAsset = {
          id: existing[index]?.id ?? uid(),
          fileName: file.name,
          previewUrl,
          width: dims.width,
          height: dims.height,
          orientation: orientationOf(dims.width, dims.height),
          focalPoint: { x: 0.5, y: 0.5 },
          fit: "fill",
          heroEligible: true,
          isHero: false,
          order: existing[index]?.order ?? order++,
          kind: file.type.startsWith("video/") ? "video" : "image",
          mimeType: file.type,
          dateTaken,
          ...existing[index],
          needsRelink:false,
        };
        asset.previewUrl=previewUrl;
        asset.analysis=analyzePhoto(asset,project);
        const persisted=await saveLocalMedia(project.id,asset.id,file);
        if(!persisted)setUploadError("These photos work in this session, but browser storage is unavailable. Keep this tab open until you publish.");
        if(existing[index])dispatch({type:"patchPhoto",photoId:asset.id,patch:asset});else assets.push(asset);
      }
      dispatch({ type: "addPhotos", photos: assets });
      } finally {uploadLock.current=false;setUploading(false);}
    },
    [dispatch, project]
  );

  return (
    <section>
      <StepEyebrow index="06" label="Photos" />
      <StepHeading className="mt-4">
        Give us the<br /><em className="italic">memories.</em>
      </StepHeading>

      <p className="mt-5 max-w-lg text-ink-soft">{guidanceLine(project.photos.length)}</p>

      <fieldset className="mt-8 border border-line p-4 sm:p-5">
        <legend className="px-2 font-mono text-[10px] uppercase tracking-widest2">Photo choreography</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {([
            ["auto", "Auto", `Switches at ${HIGH_PHOTO_THRESHOLD} photos`],
            ["standard", "Standard", "A shorter, edited rhythm"],
            ["high-photo", "50+ Photo", "A lossless visual archive"],
          ] as const).map(([mode, label, detail]) => <button key={mode} type="button" aria-pressed={selectedMode === mode} onClick={() => dispatch({ type: "setPhotoMode", mode })} className="min-h-16 border border-line p-3 text-left aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper">
            <strong className="block font-display text-lg font-normal">{label}</strong>
            <small className="mt-1 block font-mono text-[9px] uppercase tracking-wider opacity-65">{detail}</small>
          </button>)}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-ink-faint">
            Active: {resolvedMode === "high-photo" ? "50+ Photo · every upload is rendered" : "Standard"} · {project.photos.length}/{BIRTHDAY_PHOTO_LIMIT}
          </p>
          {project.photos.length > 0 && <button type="button" disabled={uploading} aria-expanded={confirmClear} onClick={() => setConfirmClear(value => !value)} className="min-h-11 border-b border-ember px-1 font-mono text-[10px] uppercase tracking-widest2 text-ember transition-colors hover:bg-ember hover:px-3 hover:text-paper">Clear all {project.photos.length}</button>}
        </div>
      </fieldset>

      {confirmClear && project.photos.length > 0 && <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} role="alertdialog" aria-label="Clear all photos" className="mt-4 flex flex-wrap items-center gap-3 border border-ember bg-paper-deep px-4 py-3">
        <p className="mr-auto text-sm text-ink-soft">Remove all {project.photos.length} photos from this website? You can undo this before leaving this step.</p>
        <button type="button" onClick={() => setConfirmClear(false)} className="min-h-11 px-3 font-mono text-[10px] uppercase tracking-widest2">Keep photos</button>
        <button type="button" onClick={clearAllPhotos} className="min-h-11 bg-ember px-4 font-mono text-[10px] uppercase tracking-widest2 text-paper">Delete all photos</button>
      </motion.div>}

      {removed.length > 0 && <div role="status" className="mt-4 flex flex-wrap items-center gap-3 border border-line p-4"><p>{removed.length} photos removed.</p><button type="button" className="min-h-11 underline" onClick={async()=>{const restore=removed.filter(p=>!project.photos.some(existing=>existing.id===p.id));for(const photo of restore){if(photo.previewUrl.startsWith("blob:")){const blob=await fetch(photo.previewUrl).then(r=>r.blob());await saveLocalMedia(project.id,photo.id,blob);}}dispatch({type:"addPhotos",photos:restore.map((p,i)=>({...p,order:project.photos.length+i}))});setRemoved([]);}}>Undo clear all</button></div>}
      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-busy={uploading}
        onKeyDown={(e) => {if(e.key === "Enter" || e.key === " "){e.preventDefault();inputRef.current?.click();}}}
        className={cn(
          "mt-8 cursor-pointer border border-dashed p-8 text-center transition-colors sm:p-12",
          dragging ? "border-ember bg-paper-deep" : "border-ink-faint/50 hover:border-ink"
        )}
      >
        <p className="font-display text-2xl font-light italic">{uploading ? "Saving originals…" : project.photos.length ? "Add more photos" : "Drop photos here"}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
          or tap to browse · multiple files welcome · stays on your device
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {uploadError && <p role="alert" className="mt-4 border-l-2 border-ember bg-paper-deep px-4 py-3 text-sm leading-relaxed text-ember">{uploadError}</p>}

      {/* Stale-photo notice after a reload */}
      {project.photos.some((p) => p.needsRelink) && (
        <p className="mt-4 border border-line px-4 py-3 font-mono text-[11px] leading-relaxed text-ink-faint">
          Some photos were saved earlier and need to be re-linked after this page
          was closed — re-upload them below. Everything else was kept.
        </p>
      )}

      {project.photos.length > 0 && <PhotoOrganizer />}
      {/* Photo wall */}
      {project.photos.length > 0 && (
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...project.photos]
            .sort((a, b) => a.order - b.order)
            .map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                expanded={expandedId === photo.id}
                onToggleExpand={() =>
                  setExpandedId(expandedId === photo.id ? null : photo.id)
                }
              />
            ))}
        </ul>
      )}

      <div className="mt-14 flex items-center gap-5 border-t border-line pt-6">
        <ActionButton onClick={nav.onNext}>
          Continue → Words
        </ActionButton>
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-ink-faint">
          Even one great photo is enough.
        </span>
      </div>
    </section>
  );
}

function guidanceLine(count: number): string {
  if (count === 0)
    return "8–12 photos feels intimate · 15–25 is ideal · 30+ becomes a full archive.";
  if (count <= 12) return `${count} added — intimate range.`;
  if (count <= 29) return `${count} added — ideal range.`;
  if (count < HIGH_PHOTO_THRESHOLD) return `${count} added — full archive territory. Auto switches to 50+ Photo at ${HIGH_PHOTO_THRESHOLD}.`;
  return `${count} added — 50+ Photo mode is active. Every upload will appear.`;
}

function orientationOf(w: number, h: number): PhotoOrientation {
  if (Math.abs(w - h) / Math.max(w, h) < 0.05) return "square";
  return w > h ? "landscape" : "portrait";
}

function readImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout=window.setTimeout(()=>resolve({width:0,height:0}),15000);
    img.onload = () => {clearTimeout(timeout);resolve({ width: img.naturalWidth, height: img.naturalHeight });};
    img.onerror = () => {clearTimeout(timeout);resolve({ width: 0, height: 0 });};
    img.src = url;
  });
}

function readVideoDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve({ width: video.videoWidth, height: video.videoHeight });
    video.onerror = () => resolve({ width: 0, height: 0 });
    video.src = url;
  });
}

/* ── PhotoCard ──────────────────────────────────────────────────────────── */

function PhotoCard({
  photo,
  expanded,
  onToggleExpand,
}: {
  photo: PhotoAsset;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const { project, dispatch } = useProject();
  const patch = (p: Partial<PhotoAsset>) =>
    dispatch({ type: "patchPhoto", photoId: photo.id, patch: p });

  const setFocal = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget.querySelector("img,video") ?? e.currentTarget).getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    patch({ focalPoint: { x, y } });
  };

  return (
    <motion.li layout className={cn(photo.needsRelink && "opacity-50")}>
      <div
        className="group relative w-full cursor-crosshair overflow-hidden border border-line bg-paper-deep"
        onClick={(e) => setFocal(e)}
        title="Click to set focal point"
      >
        {photo.kind === "video" ? (
          <video src={photo.previewUrl} muted playsInline preload="metadata" className="aspect-square w-full select-none object-cover" style={{ objectPosition: `${photo.focalPoint.x * 100}% ${photo.focalPoint.y * 100}%`, objectFit: photo.fit === "fit" ? "contain" : "cover" }} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.previewUrl} alt={photo.caption ?? photo.fileName} draggable={false} className="aspect-square w-full select-none object-cover" style={{ objectPosition: `${photo.focalPoint.x * 100}% ${photo.focalPoint.y * 100}%`, objectFit: photo.fit === "fit" ? "contain" : "cover" }} />
        )}

        {/* Focal marker */}
        <span
          aria-hidden
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 border border-paper mix-blend-difference"
          style={{ left: `${photo.focalPoint.x * 100}%`, top: `${photo.focalPoint.y * 100}%` }}
        >
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-paper" />
        </span>

        {/* Hero badge */}
        {photo.isHero && (
          <span className="absolute left-2 top-2 bg-ink px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest2 text-paper">
            Hero ★
          </span>
        )}

        {/* Controls bar */}
        <div className="relative flex flex-wrap items-center justify-between border-t border-paper/20 bg-night px-1 py-1">
          <div className="flex items-center">
            <CtlButton label="Move earlier" onClick={() => dispatch({ type: "movePhoto", photoId: photo.id, direction: -1 })}>←</CtlButton>
            <CtlButton label="Move later" onClick={() => dispatch({ type: "movePhoto", photoId: photo.id, direction: 1 })}>→</CtlButton>
            <CtlButton label="Set as hero" onClick={() => dispatch({ type: "setHeroPhoto", photoId: photo.id })}>★</CtlButton>
          </div>
          <span className="font-mono text-[9px] text-paper/70">
            №{String(photo.order + 1).padStart(2, "0")}
          </span>
          <div className="flex items-center">
            <CtlButton label="Details" onClick={onToggleExpand}>{expanded ? "−" : "+"}</CtlButton>
            <CtlButton label="Delete" danger onClick={() => {void removeLocalMedia(project.id,[photo.id]);dispatch({ type: "removePhoto", photoId: photo.id });}}>✕</CtlButton>
          </div>
        </div>
      </div>

      {/* Expanded metadata editor */}
      {expanded && (
        <div className="mt-2 space-y-2 border border-line p-3">
          <label className="block text-sm">Horizontal focal point
            <input type="range" min="0" max="1" step="0.01" value={photo.focalPoint.x} onChange={e => patch({ focalPoint: { ...photo.focalPoint, x: Number(e.target.value) } })} className="min-h-11 w-full" />
          </label>
          <label className="block text-sm">Vertical focal point
            <input type="range" min="0" max="1" step="0.01" value={photo.focalPoint.y} onChange={e => patch({ focalPoint: { ...photo.focalPoint, y: Number(e.target.value) } })} className="min-h-11 w-full" />
          </label>
          <select
            aria-label="Photo crop mode"
            value={photo.fit}
            onChange={(e) => patch({ fit: e.target.value as ImageFitMode })}
            className="w-full border-b border-line bg-transparent pb-1 font-mono text-[11px] uppercase tracking-widest2 focus:border-ink focus:outline-none"
          >
            {FIT_MODES.map((m) => (
              <option key={m} value={m}>
                crop · {m}
              </option>
            ))}
          </select>
          <input
            type="text"
            aria-label="Photo caption"
            value={photo.caption ?? ""}
            onChange={(e) => patch({ caption: e.target.value })}
            placeholder="caption…"
            maxLength={80}
            className="w-full border-b border-line bg-transparent pb-1 font-sans text-sm focus:border-ink focus:outline-none"
          />
          <input
            type="text"
            aria-label="Photo location"
            value={photo.location ?? ""}
            onChange={(e) => patch({ location: e.target.value })}
            placeholder="where was this? (optional)"
            maxLength={60}
            className="w-full border-b border-line bg-transparent pb-1 font-sans text-sm focus:border-ink focus:outline-none"
          />
          <input
            type="date"
            aria-label="Photo capture date"
            value={photo.dateTaken ?? ""}
            onChange={(e) => patch({ dateTaken: e.target.value })}
            className="w-full border-b border-line bg-transparent pb-1 font-sans text-sm text-ink-soft focus:border-ink focus:outline-none"
          />
          <p className="font-mono text-[9px] uppercase tracking-widest2 text-ink-faint">
            {photo.width}×{photo.height} · {photo.orientation}
          </p>
        </div>
      )}
    </motion.li>
  );
}

function CtlButton({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "grid h-11 w-11 place-items-center font-mono text-[11px] text-paper/85 transition-colors hover:bg-paper hover:text-ink",
        danger && "hover:bg-ember hover:text-paper"
      )}
    >
      {children}
    </button>
  );
}
