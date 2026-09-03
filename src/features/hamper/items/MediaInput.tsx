"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "../client";
import { validateFile } from "../validation";
import { VoiceRecorder } from "./VoiceRecorder";
import { VoicePlayer } from "./VoicePlayer";
import styles from "../hamper.module.css";
export async function compressPhoto(file: File): Promise<Blob> {
  validateFile("photo", file.size, file.type);
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas"); canvas.width = Math.round(bitmap.width * ratio); canvas.height = Math.round(bitmap.height * ratio);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", .84));
    return blob && blob.size < file.size ? blob : file;
  } finally { bitmap.close(); }
}
export function MediaInput({ hamperId, itemId, kind, assetId, assetUrl, onChange, onBusy }: { hamperId: string; itemId: string; kind: "photo" | "voice"; assetId?: string; assetUrl?: string; onChange: (assetId: string, url: string, bytes: number) => void; onBusy: (busy: boolean) => void }) {
  const [url, setUrl] = useState(assetUrl || ""), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const pending = useRef<string[]>([]), mounted = useRef(true), input = useRef<HTMLInputElement>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (assetId && !url) api<{ url: string }>(`/api/hampers/${hamperId}/assets?item=${itemId}`).then(r => setUrl(r.url)).catch(() => undefined);
  }, [assetId, hamperId, itemId, url]);
  async function upload(file?: File) {
    if (!file) return;
    let reservation: string | undefined;
    setError(""); setBusy(true); onBusy(true);
    try {
      validateFile(kind, file.size, file.type);
      const blob = kind === "photo" ? await compressPhoto(file).catch(() => file) : file;
      let result: { url: string; assetBytes: number };
      if (kind === "voice") {
        const uploaded = await api<{ assetId: string; url: string; assetBytes: number }>(`/api/hampers/${hamperId}/assets`, { method: "POST", body: blob, headers: { "content-type": blob.type, "x-ode-item-id": itemId } });
        reservation = uploaded.assetId; result = uploaded;
      } else {
        const signature = await api<{ assetId: string; uploadUrl: string }>(`/api/hampers/${hamperId}/assets`, { method: "POST", body: JSON.stringify({ itemId, kind, size: blob.size, mime: blob.type }) });
        reservation = signature.assetId;
        const uploaded = await fetch(signature.uploadUrl, { method: "PUT", headers: { "content-type": blob.type }, body: blob });
        if (!uploaded.ok) throw new Error("The upload didn't arrive. Please try again.");
        result = await api<{ url: string; assetBytes: number }>(`/api/hampers/${hamperId}/assets`, { method: "PUT", body: JSON.stringify({ assetId: reservation }) });
      }
      if (!mounted.current) { await discard(reservation); return; }
      if (assetId && pending.current.includes(assetId)) await discard(assetId);
      pending.current.push(reservation); setUrl(result.url); onChange(reservation, result.url, result.assetBytes);
    } catch (cause) { if (reservation) await discard(reservation); if (mounted.current) setError(cause instanceof Error ? cause.message : "Upload failed."); }
    finally { if (mounted.current) { setBusy(false); onBusy(false); } }
  }
  async function discard(id: string) { await api(`/api/hampers/${hamperId}/assets?asset=${id}`, { method: "DELETE" }).catch(() => undefined); }
  return <div>
    {url && (kind === "photo" ? <img src={url} alt="Selected keepsake" style={{ maxHeight: 220, maxWidth: "100%", objectFit: "contain", marginBottom: 16 }} /> : <VoicePlayer src={url} />)}
    {kind === "voice" && !busy && <VoiceRecorder onRecorded={file => void upload(file)} />}
    <input ref={input} type="file" accept={kind === "photo" ? "image/jpeg,image/png,image/webp" : "audio/mpeg,audio/mp4,audio/ogg,audio/webm,audio/wav,audio/x-wav"} disabled={busy} onChange={e => { void upload(e.target.files?.[0]); e.target.value = ""; }} hidden />
    <div className={styles.actions}><button type="button" className={styles.quietButton} disabled={busy} onClick={() => input.current?.click()}>{busy ? "Tucking it in…" : url ? `Replace ${kind}` : `Upload ${kind}`}</button>{url && <button type="button" className={styles.quietButton} disabled={busy} onClick={() => { if (assetId && pending.current.includes(assetId)) void discard(assetId); setUrl(""); onChange("", "", 0); }}>Remove {kind}</button>}</div>
    <p className={styles.subtitle}>{kind === "photo" ? "JPEG, PNG or WebP · up to 5 MB. Large photos are gently compressed." : "MP3, M4A, OGG, WebM or WAV · up to 2 MB."}</p>
    {error && <p role="alert" className={styles.notice}>{error}</p>}
  </div>;
}
