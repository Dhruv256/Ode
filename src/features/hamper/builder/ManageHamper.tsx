"use client";
import { useEffect, useState } from "react";
import type { Analytics, Hamper, ShareLink } from "../types";
import { api } from "../client";
import { suggestSlug } from "../validation";
import { itemSummary } from "../recipient/ItemView";
import { Dialog } from "../components/Dialog";
import styles from "../hamper.module.css";
export function ManageHamper({ hamper, onChange }: { hamper: Hamper; onChange: (hamper: Hamper) => void }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null), [error, setError] = useState(""), [slug, setSlug] = useState(() => suggestSlug(hamper.recipient)), [busy, setBusy] = useState(false), [revoke, setRevoke] = useState<ShareLink | "all" | null>(null);
  useEffect(() => { api<Analytics>(`/api/hampers/${hamper.id}/analytics`).then(setAnalytics).catch(e => setError(e.message)); }, [hamper.id]);
  async function change(action: string, linkId?: string) {
    setBusy(true); setError("");
    try { onChange(await api<Hamper>(`/api/hampers/${hamper.id}/links`, { method: "POST", body: JSON.stringify({ action, linkId, slug }) })); setRevoke(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to change this link."); } finally { setBusy(false); }
  }
  return <>
    <section id="links"><div className={styles.sectionHeader}><h2 className={styles.heading}>Manage links</h2><span className={styles.eyebrow}>{hamper.hasPin ? "Protected with a PIN" : "Unlisted · anyone with the link"}</span></div>
      {hamper.links.map(link => <div className={styles.linkLine} key={link.id}><p>/hamper/{link.slug} <span className={styles.status}>{link.revoked_at ? "Revoked" : link.is_primary ? "Primary" : "Active"}</span></p>{!link.revoked_at && <div className={styles.actions}>{!link.is_primary && <button className={styles.quietButton} disabled={busy} onClick={() => void change("primary", link.id)}>Make primary</button>}<button className={styles.quietButton} disabled={busy} onClick={() => setRevoke(link)}>Revoke link</button></div>}</div>)}
      <div className={styles.form}><label className={styles.field}>A fresh link<input value={slug} maxLength={48} onChange={e => setSlug(e.target.value)} /></label><div className={styles.actions}><button className={styles.quietButton} disabled={busy} onClick={() => void change("create")}>Create another link</button><button className={styles.quietButton} disabled={busy} onClick={() => setRevoke("all")}>Replace all active links</button></div></div>
    </section>
    {error && <p className={styles.notice} role="alert">{error}</p>}
    <section id="analytics"><div className={styles.sectionHeader}><h2 className={styles.heading}>A little delivery report</h2></div>
      {analytics ? <><div className={styles.metrics}><div><strong>{analytics.views}</strong><small>Views</small></div><div><strong>{analytics.opened}</strong><small>Opened the box</small></div><div><strong>{analytics.views ? Math.round(analytics.opened / analytics.views * 100) : 0}%</strong><small>Open rate</small></div></div><p>{analytics.clicks} gift / link clicks</p><h3 className={styles.heading} style={{ marginTop: 28 }}>Most opened</h3>{analytics.items.length ? analytics.items.map(i => <p className={styles.linkLine} key={i.item_id}>{hamper.items.find(x => x.id === i.item_id) ? itemSummary(hamper.items.find(x => x.id === i.item_id)!) : "Keepsake"} — {i.count}</p>) : <p className={styles.subtitle}>Their first little discoveries will appear here.</p>}<h3 className={styles.heading} style={{ marginTop: 28 }}>Recent activity</h3>{analytics.recent.slice(0, 8).map((e, i) => <p className={styles.linkLine} key={i}>{e.event_type.replaceAll("_", " ")} · {new Date(e.created_at).toLocaleString()}</p>)}</> : <p>Opening the delivery report…</p>}
    </section>
    {revoke && <Dialog title="Retire this link?" onClose={() => setRevoke(null)}><p>{revoke === "all" ? "All existing links will stop opening this hamper. Share the replacement link with your recipient." : "Anyone with this link will no longer be able to open the hamper."}</p><div className={styles.footer}><button className={styles.quietButton} onClick={() => setRevoke(null)}>Keep it</button><button className={styles.button} disabled={busy} onClick={() => void change(revoke === "all" ? "replace" : "revoke", revoke === "all" ? undefined : revoke.id)}>Revoke{revoke === "all" ? " and replace" : " link"}</button></div></Dialog>}
  </>;
}
