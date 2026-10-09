"use client";

import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import type { PhotoAsset } from "@/lib/types";
import type { Treatment } from "./types";
import { cn } from "@/lib/utils";
import { FRAME_RATIOS, normalizedFocal, photoFrameRatio, type FrameRatio } from "./frames";
import { PhotoFrameContext } from './PhotoFrameContext';

/**
 * Shared image primitive for all generated experiences.
 * Owns: source, focal point, treatment (non-destructive CSS), the caption
 * reveal overlay (hover → tap), and the honest needsRelink placeholder.
 * Templates wrap this in their own frames but never re-implement it.
 */

export function imageFilter(t: Treatment): string | undefined {
  switch (t) {
    case "bw": return "grayscale(1) contrast(1.06)";
    case "warm": return "sepia(0.3) saturate(1.08) contrast(0.98)";
    case "flash": return "brightness(1.14) contrast(1.08) saturate(0.92)";
    case "duotone": return "grayscale(1) contrast(1.1)";
    case "halftone": return "contrast(1.12) brightness(0.98)";
    case "newspaper": return "grayscale(1) contrast(1.32) brightness(0.92)";
    case "photocopy": return "grayscale(1) contrast(1.5) brightness(0.95)";
    case "cool": return "sepia(0.18) hue-rotate(190deg) saturate(0.94)";
    default: return undefined;
  }
}

function overlayKinds(t: Treatment): Array<{ bg?: string; blend?: React.CSSProperties["mixBlendMode"]; mix?: boolean }> {
  switch (t) {
    case "duotone": return [{ bg: "var(--tp-accent, #B4502A)", blend: "color", mix: true }];
    case "halftone": return [{ bg: undefined, blend: "hard-light", mix: true }];
    case "photocopy": return [{ bg: undefined, blend: "multiply", mix: true }];
    case "grain": return [{ bg: undefined, blend: "overlay", mix: true }];
    default: return [];
  }
}

export function Photo({
  photo,
  className,
  imgClassName,
  treatment,
  aspect,
  showCaption = true,
  captionFallback = "Add the story behind this photo",
  style,
  fit,
  footprint = "normal",
  ratio,
  priority = false,
}: {
  photo: PhotoAsset;
  className?: string;
  imgClassName?: string;
  treatment?: Treatment;
  aspect?: string;
  showCaption?: boolean;
  captionFallback?: string;
  style?: React.CSSProperties;
  fit?: "cover" | "contain";
  footprint?: "compact" | "normal" | "cinematic" | "unbounded";
  ratio?: FrameRatio;
  priority?: boolean;
}) {
  const focalX = normalizedFocal(photo.focalPoint?.x) * 100;
  const focalY = normalizedFocal(photo.focalPoint?.y) * 100;
  const t = treatment ?? "none";
  const filter = imageFilter(t);
  const isVideo = photo.kind === "video" || photo.mimeType?.startsWith("video/");
  const carouselRatio = useContext(PhotoFrameContext);
  const [failed, setFailed] = useState(false);
  useEffect(()=>setFailed(false),[photo.previewUrl]);
  const legacyRatio=aspect?.includes("aspect-square")?"1 / 1":aspect?.match(/aspect-\[(\d+)\/(\d+)\]/)?.slice(1).join(" / ");
  const frameRatio = carouselRatio ? FRAME_RATIOS[carouselRatio] : photoFrameRatio(ratio, photo.orientation, legacyRatio);
  const frameStyle = { ...style, aspectRatio: frameRatio };

  if (photo.needsRelink || failed) {
    return (
      <div
        data-photo-id={photo.id}
        className={cn("tp-frame flex items-center justify-center p-4 text-center font-mono text-[10px] uppercase leading-relaxed tracking-widest opacity-60", aspect, className)}
        style={{ ...frameStyle, background: "var(--tp-panel, #efe9dc)" }}
      >
        {photo.needsRelink ? "This photo needs to be re-linked by its creator" : "This media could not be opened"}
      </div>
    );
  }

  const [frameWidth, frameHeight] = frameRatio.split('/').map(Number);
  const sourceRatio = photo.width / photo.height;
  const cropRatio = sourceRatio / (frameWidth / frameHeight);
  const excessiveCrop = cropRatio > 1.45 || cropRatio < 1 / 1.45;
  const resolvedFit = fit ?? (photo.fit === "fit" || photo.fit === "original" || photo.analysis?.isGroupPhoto || (excessiveCrop && photo.fit !== "manual") ? "contain" : "cover");
  const footprintClass = footprint === "compact" ? "tp-photo-compact" : footprint === "cinematic" ? "tp-photo-cinematic" : footprint === "unbounded" ? "" : "tp-photo-normal";

  return (
    <figure
      data-photo-id={photo.id}
      className={cn("tp-frame", footprintClass, aspect, className)}
      style={frameStyle}
      data-frame-ratio={ratio}
      data-source-orientation={photo.orientation}
      data-render-fit={resolvedFit}
    >
      {isVideo ? (
        <video
          src={photo.previewUrl}
          muted
          playsInline
          preload="metadata"
          className={cn("absolute inset-0 h-full w-full object-cover", imgClassName)}
          style={{ objectPosition: `${focalX}% ${focalY}%`, objectFit: resolvedFit, filter }}
          aria-label={photo.caption || photo.fileName}
          onError={() => setFailed(true)}
        />
      ) : (
        <Image src={photo.previewUrl} alt={photo.caption || `A memory${photo.location ? ` in ${photo.location}` : ""}`} fill sizes="(max-width: 639px) 90vw, (max-width: 1023px) 46vw, 640px" priority={priority} unoptimized={!/^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//.test(photo.previewUrl)} draggable={false} onError={() => setFailed(true)} className={cn("object-cover", imgClassName)} style={{ objectPosition: `${focalX}% ${focalY}%`, objectFit: resolvedFit, filter }} />
      )}
      {isVideo && <button type="button" className="absolute bottom-3 right-3 z-[4] border border-white/80 bg-black/55 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-white" onClick={(e) => { const video = e.currentTarget.parentElement?.querySelector("video"); if (!video) return; video.paused ? void video.play() : video.pause(); }}>play clip</button>}
      {overlayKinds(t).map((o, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: o.bg,
            mixBlendMode: o.mix ? o.blend : undefined,
          }}
        />
      ))}
      {showCaption && (photo.caption || photo.associatedMemoryId !== undefined) && (
        <figcaption className="tp-cap font-mono text-[10px] uppercase tracking-widest text-white/90">
          {photo.caption || captionFallback}
        </figcaption>
      )}
      {/* photo grain layering when requested via class by the parent */}
      {(t === "grain") && <span aria-hidden className="tp-grain absolute inset-0 z-[2]" />}
    </figure>
  );
}
