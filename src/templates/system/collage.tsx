"use client";

import React from "react";
import type { PhotoAsset } from "@/lib/types";
import { Photo } from "./photo";
import { AutoCarousel } from "./AutoCarousel";
import type { Treatment } from "./types";
import { cn } from "@/lib/utils";

/**
 * Collage primitives — reusable "photo furniture" each template composes.
 * Templates keep their identity through typography, treatment, spacing and
 * the specific primitive mix; these avoid each template re-implementing
 * focal points / treatments / caption reveals from scratch.
 */

export function FullSizePhoto({
  photo,
  treatment,
  className,
}: {
  photo: PhotoAsset;
  treatment: Treatment;
  className?: string;
}) {
  return (
    <Photo
      photo={photo}
      treatment={treatment}
      className={cn("h-full w-full", className)}
    />
  );
}

/** Horizontal film strip of small numbered frames. */
export function FilmStrip({
  photos,
  treatment,
  className,
  start = 1,
}: {
  photos: PhotoAsset[];
  treatment: Treatment;
  className?: string;
  start?: number;
}) {
  if (photos.length === 0) return null;
  return (
    <AutoCarousel
      items={photos}
      getKey={(photo) => photo.id}
      kind="film"
      visible={1}
      autoMs={4600}
      label="Automatic film strip"
      className={className}
      renderItem={(p, i) => (
        <div className="mx-auto w-full max-w-xs">
          <Photo photo={p} treatment={treatment} aspect="aspect-[4/5] w-full" footprint="compact" showCaption />
          <div className="mt-1 flex justify-between font-mono text-[9px] uppercase opacity-70">
            <span>FRAME {String(start + i).padStart(2, "0")}</span>
            <span>{p.orientation === "portrait" ? "80mm" : "36mm"}</span>
          </div>
        </div>
      )}
    />
  );
}

/** A polaroid card with a handwritten margin. */
export function PolaroidCard({
  photo,
  treatment,
  rotation,
  note,
  className,
}: {
  photo: PhotoAsset;
  treatment: Treatment;
  rotation?: number;
  note?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn("bg-white p-2 pb-3 shadow-[0_6px_18px_rgba(0,0,0,0.12)]", className)}
      style={rotation ? { transform: `rotate(${rotation}deg)` } : undefined}
    >
      <Photo photo={photo} treatment={treatment} aspect="aspect-square w-full" showCaption={false} />
      <figcaption className="pt-2 text-center font-hand text-base leading-none opacity-80">
        {note || photo.caption || "—"}
      </figcaption>
    </figure>
  );
}

/** Two offset photos in a pair (large + supporting). */
export function PairRow({
  primary,
  secondary,
  treatment,
  className,
}: {
  primary: PhotoAsset;
  secondary?: PhotoAsset;
  treatment: Treatment;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-12 items-end gap-3 sm:gap-5", className)}>
      <Photo photo={primary} treatment={treatment} aspect="col-span-8 aspect-[4/5] w-full" />
      {secondary && (
        <Photo photo={secondary} treatment={treatment} aspect="col-span-4 aspect-[3/4] w-full translate-y-6 sm:translate-y-10" />
      )}
    </div>
  );
}

/** Giant single-photo poster (used for the 1-photo case). */
export function PosterPhoto({
  photo,
  treatment,
  className,
}: {
  photo: PhotoAsset;
  treatment: Treatment;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <Photo photo={photo} treatment={treatment} className="h-full w-full" />
    </div>
  );
}

/** Honest empty-state placeholder — never invent a reason for a blank page. */
export function EmptyNote({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center border border-dashed p-10 text-center font-mono text-[11px] uppercase leading-relaxed tracking-widest opacity-50"
      style={{ borderColor: "var(--tp-line)" }}
    >
      {label || "Add the story behind this photo"}
    </div>
  );
}
