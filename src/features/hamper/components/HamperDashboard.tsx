"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StudioShell } from "@/components/dashboard/StudioShell";
import type { Hamper } from "../types";
import { api, shareLink } from "../client";
import { HAMPER_THEMES } from "../config";
import { Dialog } from "./Dialog";
import { ItemIcon } from "./ItemIcon";
import { themeStyle } from "../recipient/Recipient";
import styles from "../hamper.module.css";
export function HamperDashboard() {
  const [hampers, setHampers] = useState<Hamper[]>([]), [ready, setReady] = useState(false), [message, setMessage] = useState(""), [busy, setBusy] = useState(false), [deleting, setDeleting] = useState<Hamper | null>(null);
  async function load() { try { setHampers((await api<{ hampers: Hamper[] }>("/api/hampers")).hampers); } catch (e) { setMessage(e instanceof Error ? e.message : "Your hampers could not be loaded."); } finally { setReady(true); } }
  useEffect(() => { void load(); }, []);
  async function action(run: () => Promise<unknown>) { setBusy(true); try { await run(); } catch (e) { setMessage(e instanceof Error ? e.message : "Please try again."); } finally { setBusy(false); } }
  return <StudioShell section="hamper"><p className={styles.eyebrow}>Special delivery</p><div className={styles.sectionHeader}><h1 className={styles.title}>Digital hampers</h1><Link className={styles.button} href="/dashboard/hamper/new">+ Create Digital Hamper</Link></div><p className={styles.subtitle}>Little packages, full of the things you couldn&apos;t quite fit into a message.</p>
    {message && <p className={styles.notice} role="status">{message}</p>}
    {!ready ? <p className={styles.empty}>Opening the cupboard…</p> : !hampers.length ? <div className={styles.empty}><ItemIcon type="gift" size={70} /><h2 className={styles.heading}>No hampers packed yet.</h2><p>Tuck a few good things into one.</p></div> : hampers.map(h => {
      const slug = h.links.find(l => l.is_primary && !l.revoked_at)?.slug, url = slug && h.status === "published" ? `/hamper/${slug}` : undefined;
      const edit = `/dashboard/hamper/${h.id}/edit`;
      return <article key={h.id} className={styles.row} style={themeStyle(h.theme)}><div className={styles.rowVisual}><ItemIcon type="gift" size={40} /></div><div><span className={styles.status}>{h.status} · {h.openingStyle} {h.hasPin && "· PIN"}</span><h2>{h.recipient || "A hamper in the making"}</h2><p>{HAMPER_THEMES[h.theme].name} · {h.views} views · {h.opened} opened<br />Created {new Date(h.createdAt).toLocaleDateString()} · Edited {new Date(h.updatedAt).toLocaleDateString()}{url && <><br /><a href={url}>{url}</a></>}</p><div className={styles.actions}>
        <Link href={edit}>Edit</Link><Link href={`${edit}?step=5`}>Preview</Link>{url && <><button disabled={busy} onClick={() => void action(async () => setMessage(await shareLink(url, `For ${h.recipient}`)))}>Share</button><button disabled={busy} onClick={() => void action(async () => setMessage(await shareLink(url, `For ${h.recipient}`, true)))}>Copy link</button></>}
        <button disabled={busy} onClick={() => void action(async () => { const result = await api<{ id: string }>(`/api/hampers/${h.id}`, { method: "POST" }); location.assign(`/dashboard/hamper/${result.id}/edit`); })}>Duplicate</button><button disabled={busy} onClick={() => setDeleting(h)}>Delete</button><Link href={`${edit}?step=6&panel=links`}>Manage links</Link><Link href={`${edit}?step=6&panel=analytics`}>Analytics</Link>
      </div></div></article>;
    })}
    {deleting && <Dialog title="Unpack this hamper for good?" onClose={() => setDeleting(null)}><p>Its items and share links will be removed. This can&apos;t be undone.</p><div className={styles.footer}><button className={styles.quietButton} onClick={() => setDeleting(null)}>Keep it</button><button className={styles.button} disabled={busy} onClick={() => void action(async () => { await api(`/api/hampers/${deleting.id}`, { method: "DELETE" }); setDeleting(null); await load(); })}>Delete hamper</button></div></Dialog>}
  </StudioShell>;
}
