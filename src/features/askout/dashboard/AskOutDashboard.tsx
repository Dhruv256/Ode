"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StudioShell } from "@/components/dashboard/StudioShell";
import { Dialog } from "@/features/hamper/components/Dialog";
import { askOutApi, copyAskOutLink } from "../client";
import type { AskOut } from "../types";
import styles from "@/features/hamper/hamper.module.css";
import askStyles from "../askout.module.css";
const date = (value: string) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
export function AskOutDashboard() {
  const [items, setItems] = useState<AskOut[]>([]), [ready, setReady] = useState(false), [notice, setNotice] = useState(""), [deleting, setDeleting] = useState<AskOut | null>(null), [busy, setBusy] = useState(false);
  async function load() { try { const data = await askOutApi<{ askOuts: AskOut[] }>("/api/askouts"); setItems(data.askOuts); } catch (error) { setNotice(error instanceof Error ? error.message : "Ask Outs could not be loaded."); } finally { setReady(true); } }
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <StudioShell section="askouts"><p className={styles.eyebrow}>Independent little invitations</p><h1 className={styles.title}>Ask Outs</h1><p className={styles.subtitle}>Short, strange, highly personal messages that eventually ask one clear question.</p>
    {notice && <p role="status" className={styles.notice}>{notice}</p>}<div className={styles.sectionHeader}><h2 className={styles.heading}>Your Ask Outs</h2><Link className={styles.button} href="/askout/create">+ Create Ask Out</Link></div>
    {!ready ? <p>Checking the classified files…</p> : items.length === 0 ? <div className={styles.empty}><h2 className={styles.heading}>No suspicious messages yet.</h2><p>Make one for exactly the right person.</p><Link className={styles.button} href="/askout/create">Create Ask Out</Link></div> : items.map(item => <article className={styles.row} key={item.id}><div className={styles.rowVisual}><span className={askStyles.dashboardGlyph}>@1</span></div><div><span className={styles.status}>{item.status}</span><h2>{item.recipientName || "Unnamed recipient"}</h2><p>Created {date(item.createdAt)} · Scheduled {item.date ? date(`${item.date}T12:00:00`) : "not set"}<br />Responses: {item.responses.accepted} accepted · {item.responses.declined} declined · {item.responses.tell_more} asked for more{item.latestResponse && <><br />Latest: {item.latestResponse.response.replace("_", " ")} · {date(item.latestResponse.respondedAt)}</>}</p><div className={styles.actions}>{item.status === "published" && <><button disabled={busy} onClick={() => void copyAskOutLink(`/askout/${item.slug}`).then(setNotice)}>Copy link</button><Link target="_blank" href={`/askout/${item.slug}`}>Preview</Link></>}<Link href={`/askout/create?id=${item.id}`}>Edit</Link><button disabled={busy} onClick={() => setDeleting(item)}>Delete</button></div></div></article>)}
    {deleting && <Dialog title="Delete this Ask Out?" onClose={() => setDeleting(null)}><p>The shared link and recorded responses will be removed. This can&apos;t be undone.</p><div className={styles.footer}><button className={styles.quietButton} onClick={() => setDeleting(null)}>Keep it</button><button className={styles.button} disabled={busy} onClick={() => { setBusy(true); void askOutApi(`/api/askouts/${deleting.id}`, { method: "DELETE" }).then(() => { setDeleting(null); return load(); }).finally(() => setBusy(false)); }}>Delete Ask Out</button></div></Dialog>}
  </StudioShell>;
}
