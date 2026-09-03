"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../client";
import { Recipient } from "./Recipient";
import type { EventType, HamperContent, HamperItem } from "../types";
import styles from "../hamper.module.css";
export function PublicHamper({ slug, locked }: { slug: string; locked: boolean }) {
  const [needsPin, setNeedsPin] = useState(locked), [pin, setPin] = useState(""), [content, setContent] = useState<HamperContent | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const sent = useRef(new Set<string>());
  const event = useCallback((event: EventType, itemId?: string) => {
    const key = `${event}:${itemId || ""}`;
    if (sent.current.has(key)) return; sent.current.add(key);
    void fetch(`/api/hamper/${slug}/events`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ event, itemId }), keepalive: true }).catch(() => undefined);
  }, [slug]);
  const load = useCallback(async () => { setError(""); try { const data = await api<HamperContent>(`/api/hamper/${slug}`); setContent(data); event("hamper_viewed"); } catch (cause) { setError(cause instanceof Error ? cause.message : "This hamper couldn't be opened."); } }, [slug, event]);
  useEffect(() => { if (!needsPin) void load(); }, [needsPin, load]);
  const resolveAsset = useCallback(async (item: HamperItem) => (await api<{ url: string }>(`/api/hamper/${slug}/assets?item=${item.id}`)).url, [slug]);
  if (needsPin) return <main className={styles.recipient}><form className={styles.pin} onSubmit={async e => { e.preventDefault(); setBusy(true); setError(""); try { await api(`/api/hamper/${slug}/unlock`, { method: "POST", body: JSON.stringify({ pin }) }); setNeedsPin(false); } catch (cause) { setError(cause instanceof Error ? cause.message : "Try again."); } finally { setBusy(false); } }}>
    <p className={styles.eyebrow}>A little secret</p><h1 className={styles.title}>Just for you.</h1><p className={styles.subtitle}>Enter the PIN your sender shared with you.</p><div className={styles.form}><label className={styles.field}>Hamper PIN<input type="password" inputMode="numeric" autoComplete="off" pattern="[0-9]{4,6}" minLength={4} maxLength={6} required value={pin} onChange={e => setPin(e.target.value)} /></label><button className={styles.button} disabled={busy}>{busy ? "Checking…" : "Unlock hamper"}</button></div>{error && <p role="alert" className={styles.notice}>{error}</p>}
  </form></main>;
  return content ? <Recipient content={content} resolveAsset={resolveAsset} onEvent={event} /> : <main className={styles.closed}>{error ? <><p role="alert">{error}</p><button className={styles.quietButton} onClick={() => void load()}>Try again</button></> : <p className={styles.tapHint}>Finding your little package…</p>}</main>;
}
