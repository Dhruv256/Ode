"use client";
import { useState } from "react";
import { HAMPER_ITEM_REGISTRY } from "../config";
import type { DrawingStroke, HamperItem, ItemType } from "../types";
import { validateItem } from "../validation";
import { Dialog } from "../components/Dialog";
import { DrawingCanvas } from "../items/DrawingCanvas";
import { MediaInput } from "../items/MediaInput";
import styles from "../hamper.module.css";
import { api } from "../client";
export function ItemEditor({ hamperId, type, item, onSave, onClose }: { hamperId: string; type: ItemType; item?: HamperItem; onSave: (item: HamperItem) => Promise<void>; onClose: () => void }) {
  const definition = HAMPER_ITEM_REGISTRY[type];
  const [id] = useState(item?.id || crypto.randomUUID()), [payload, setPayload] = useState<Record<string, unknown>>(item?.payload || {}), [error, setError] = useState(""), [busy, setBusy] = useState(false), [url, setUrl] = useState(item?.assetUrl), [bytes, setBytes] = useState(item?.assetBytes || 0);
  const change = (key: string, value: unknown) => setPayload(p => ({ ...p, [key]: value }));
  const [saving, setSaving] = useState(false);
  const close = () => {
    if (saving) return;
    const originalAsset = item && "assetId" in item.payload ? item.payload.assetId : undefined;
    if (payload.assetId && payload.assetId !== originalAsset) void api(`/api/hampers/${hamperId}/assets?asset=${payload.assetId}`, { method: "DELETE" }).catch(() => undefined);
    onClose();
  };
  return <Dialog title={`${item ? "Edit" : "Tuck in a"} ${definition.label.toLowerCase()}`} kind={type} onClose={close} busy={saving}>
    <form onSubmit={async e => { e.preventDefault(); if (busy || saving) return; setError(""); setSaving(true); try { const next = validateItem({ id, type, payload }, item?.position); await onSave({ ...next, assetUrl: url, assetBytes: bytes }); } catch (cause) { setError(cause instanceof Error ? cause.message : "Please check this keepsake."); } finally { setSaving(false); } }}>
      <fieldset disabled={saving} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      {definition.media && <MediaInput hamperId={hamperId} itemId={id} kind={definition.media} assetId={String(payload.assetId || "")} assetUrl={url} onBusy={setBusy} onChange={(assetId, assetUrl, assetBytes) => { change("assetId", assetId); setUrl(assetUrl); setBytes(assetBytes); }} />}
      {definition.drawing && <DrawingCanvas value={(payload.strokes || []) as DrawingStroke[]} onChange={strokes => change("strokes", strokes)} />}
      <div className={styles.form}>{definition.fields.map(f => <label className={styles.field} key={f.key}>{f.label}{f.required ? " *" : ""}
        {f.multiline ? <textarea required={f.required} maxLength={f.max} value={String(payload[f.key] || "")} onChange={e => change(f.key, e.target.value)} /> : <input type={f.kind || "text"} required={f.required} maxLength={f.max} value={String(payload[f.key] || "")} onChange={e => change(f.key, e.target.value)} />}
        {f.multiline && <small>{String(payload[f.key] || "").length} / {f.max}</small>}
      </label>)}</div>
      {error && <p role="alert" className={styles.notice}>{error}</p>}
      <div className={styles.actions}><button type="submit" className={styles.button} disabled={busy || saving}>{saving ? "Saving keepsake…" : item ? "Keep these changes" : "Tuck it inside"}</button><button type="button" className={styles.quietButton} disabled={saving} onClick={close}>Cancel</button></div>
      </fieldset>
    </form>
  </Dialog>;
}
