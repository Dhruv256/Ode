"use client";

import { useEffect, useState, type RefObject } from "react";

const LIMIT = 64;
const MAX_EDGE = 1600;
const previews = new Map<string, Promise<string>>();

async function makePreview(source: string): Promise<string> {
  const file = await fetch(source).then(response => response.blob());
  // Keep formats whose animation or decoding support varies by browser intact.
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return source;
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (ratio === 1) return source;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext("2d");
    if (!context) return source;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const preview = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", .86));
    if (!preview || preview.type !== "image/webp" || preview.size >= file.size) return source;
    // Data URLs avoid revoking a preview that another mounted frame still uses.
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(preview);
    });
  } finally {
    bitmap.close();
  }
}

function previewFor(source: string) {
  const existing = previews.get(source);
  if (existing) return existing;
  if (previews.size >= LIMIT) {
    const oldest = previews.keys().next().value;
    if (oldest) previews.delete(oldest);
  }
  const preview = makePreview(source).catch(() => source);
  previews.set(source, preview);
  return preview;
}

export function useLocalPhotoPreview(
  source: string,
  enabled: boolean,
  eager: boolean,
  frame: RefObject<HTMLElement>,
) {
  const [result, setResult] = useState<{ source: string; preview: string }>();
  const local = enabled && source.startsWith("blob:") && typeof createImageBitmap !== "undefined";

  useEffect(() => {
    if (!local) return;
    const node = frame.current;
    let active = true;
    const load = () => void previewFor(source).then(preview => {
      if (active) setResult({ source, preview });
    });

    let observer: IntersectionObserver | undefined;
    if (eager || !node || typeof IntersectionObserver === "undefined") load();
    else {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer?.disconnect();
        load();
      }, { rootMargin: "400px" });
      observer.observe(node);
    }

    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [eager, frame, local, source]);

  return !local ? source : result?.source === source ? result.preview : undefined;
}
