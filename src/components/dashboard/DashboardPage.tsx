"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StudioShell } from "./StudioShell";
import { api, shareLink } from "@/features/hamper/client";
import { ItemIcon } from "@/features/hamper/components/ItemIcon";
import { Dialog } from "@/features/hamper/components/Dialog";
import type { BirthdayProject } from "@/lib/types";
import type { Hamper } from "@/features/hamper/types";
import { HAMPER_THEMES } from "@/features/hamper/config";
import styles from "@/features/hamper/hamper.module.css";
import { localWebsites, removeLocalWebsite, saveLocalWebsite } from "@/lib/localWebsites";
import type { AskOut } from "@/features/askout/types";
import { ASK_OUT_THEMES } from "@/features/askout/config";
type WebsiteRow = { id: string; project: BirthdayProject; local?: boolean; created_at: string; updated_at: string };
const date = (value: string) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
export default function DashboardPage({ section = "dashboard", ownerKey = "device" }: { section?: "dashboard" | "websites"; ownerKey?: string }) {
  const [websites, setWebsites] = useState<WebsiteRow[]>([]), [hampers, setHampers] = useState<Hamper[]>([]), [askOuts, setAskOuts] = useState<AskOut[]>([]), [ready, setReady] = useState(false), [message, setMessage] = useState(""), [deleting, setDeleting] = useState<WebsiteRow | null>(null), [busy, setBusy] = useState(false);
  async function load() {
    const local = localWebsites(ownerKey);
    const rows = new Map<string, WebsiteRow>();
    Object.values(local).filter(p => p?.id && p.person && p.publishing).forEach(p => rows.set(p.id, { id: p.id, project: p, created_at: p.createdAt, updated_at: p.updatedAt, local: true }));
    const [sites, packs, invitations] = await Promise.allSettled([api<{ websites: WebsiteRow[] }>("/api/websites"), section === "dashboard" ? api<{ hampers: Hamper[] }>("/api/hampers") : Promise.resolve({ hampers: [] }), section === "dashboard" ? api<{ askOuts: AskOut[] }>("/api/askouts") : Promise.resolve({ askOuts: [] })]);
    if (sites.status === "fulfilled") sites.value.websites.forEach(row => {
      const cached = rows.get(row.id);
      rows.set(row.id, cached && cached.updated_at > row.updated_at ? { ...cached, local: false } : row);
    }); else setMessage(`${sites.reason instanceof Error ? sites.reason.message : "Cloud projects couldn't be loaded."} Local drafts are shown below.`);
    if (packs.status === "fulfilled") setHampers(packs.value.hampers);
    if (invitations.status === "fulfilled") setAskOuts(invitations.value.askOuts);
    setWebsites(Array.from(rows.values()).sort((a, b) => b.updated_at.localeCompare(a.updated_at))); setReady(true);
  }
  useEffect(() => { void load().catch(() => { setMessage("Your local drafts couldn't be read. Please reload the studio."); setReady(true); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function action(run: () => Promise<unknown>) { setBusy(true); try { await run(); } catch (e) { setMessage(e instanceof Error ? e.message : "Please try again."); } finally { setBusy(false); } }
  async function duplicate(row: WebsiteRow) {
    if (!row.local) { const result = await api<{ id: string }>(`/api/websites/${row.id}`, { method: "POST" }); location.assign(`/create?project=${result.id}`); return; }
    const p: BirthdayProject = { ...row.project, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), publishing: { status: "draft", visibility: "link" } };
    saveLocalWebsite(ownerKey, p); location.assign(`/create?project=${p.id}`);
  }
  return <StudioShell section={section}>
    <p className={styles.eyebrow}>Your Ode studio</p><h1 className={styles.title}>{section === "dashboard" ? "What are we making?" : "Birthday websites"}</h1>
    <p className={styles.subtitle}>{section === "dashboard" ? "A whole little world. Or a few good things, tucked together. Start with someone you love." : "A different world for every person. Each with its own story, style and link."}</p>
    {section === "dashboard" && <div className={styles.choices}>
      <Link href="/create?new=1" className={styles.choice}><ItemIcon type="photo" size={48} /><strong>Create a birthday website</strong><small>Their photos, their stories, their own little corner of the internet.</small><span>Make their world ↗</span></Link>
      <Link href="/dashboard/hamper/new" className={styles.choice}><ItemIcon type="gift" size={48} /><strong>Send a digital hamper</strong><small>A note, a song, a memory. Wrap up the things that feel like them.</small><span>Pack something lovely ↗</span></Link>
      <Link href="/askout/create" className={styles.choice}><span aria-hidden="true" style={{font:"600 28px 'IBM Plex Mono',monospace"}}>@1</span><strong>Create an Ask Out</strong><small>A funny, interactive invitation hidden inside one suspicious message.</small><span>Start the operation ↗</span></Link>
    </div>}
    {message && <p role="status" className={styles.notice}>{message}</p>}
    <div className={styles.sectionHeader}><h2 className={styles.heading}>{section === "dashboard" ? "Your recent websites" : "Your websites"}</h2><Link href="/create?new=1" className={styles.quietButton}>+ Create Website</Link></div>
    {!ready ? <p>Opening your studio…</p> : websites.length === 0 ? <div className={styles.empty}><h2 className={styles.heading}>No birthday websites yet.</h2><p>Make someone&apos;s day.</p></div> : (section === "dashboard" ? websites.slice(0, 4) : websites).map(row => {
      const p = row.project, name = p.person.nickname || p.person.fullName || "Untitled website", url = p.publishing.status === "published" && p.publishing.slug ? `/${p.publishing.slug}` : undefined;
      return <article key={row.id} className={styles.row}><div className={styles.rowVisual}><ItemIcon type="photo" size={36} /></div><div><span className={styles.status}>{p.publishing.status}{row.local ? " · on this device" : ""}</span><h2>{name}</h2><p>{p.templateId?.replaceAll("-", " ") || "Theme to choose"}<br />Created {date(row.created_at)} · Edited {date(row.updated_at)}{url && <><br /><a href={url}>{url}</a></>}</p>
        <div className={styles.actions}><Link href={`/create?project=${row.id}`}>Edit</Link><Link href={url || `/create?project=${row.id}&preview=1`}>Preview</Link>{url && <><button disabled={busy} onClick={() => void action(async () => setMessage(await shareLink(url, name)))}>Share</button><button disabled={busy} onClick={() => void action(async () => setMessage(await shareLink(url, name, true)))}>Copy link</button></>}
          <button disabled={busy} onClick={() => void action(() => duplicate(row))}>Duplicate</button><button disabled={busy} onClick={() => setDeleting(row)}>Delete</button>
          {row.local && p.publishing.publishToken && <button disabled={busy} onClick={() => void action(async () => { await api("/api/websites", { method: "POST", body: JSON.stringify({ project: p, token: p.publishing.publishToken }) }); setMessage("Website added to your account."); await load(); })}>Add to my account</button>}
        </div></div></article>;
    })}
    {section === "dashboard" && <><div className={styles.sectionHeader}><h2 className={styles.heading}>Recent hampers</h2><Link className={styles.quietButton} href="/dashboard/hamper">All digital hampers →</Link></div>{hampers.length ? hampers.slice(0, 3).map(h => <article className={styles.row} key={h.id}><div className={styles.rowVisual}><ItemIcon type="gift" /></div><div><span className={styles.status}>{h.status}</span><h2>{h.recipient || "A hamper in the making"}</h2><p>{HAMPER_THEMES[h.theme].name} · {h.openingStyle} · Edited {date(h.updatedAt)}</p><Link className={styles.quietButton} href={`/dashboard/hamper/${h.id}/edit`}>Keep packing →</Link></div></article>) : <div className={styles.empty}><h2 className={styles.heading}>No hampers packed yet.</h2><p>Tuck a few good things into one.</p></div>}</>}
    {section === "dashboard" && <><div className={styles.sectionHeader}><h2 className={styles.heading}>Recent Ask Outs</h2><Link className={styles.quietButton} href="/dashboard/askouts">All Ask Outs →</Link></div>{askOuts.length ? askOuts.slice(0, 3).map(item => <article className={styles.row} key={item.id}><div className={styles.rowVisual}><span aria-hidden="true" style={{font:"600 20px 'IBM Plex Mono',monospace"}}>@1</span></div><div><span className={styles.status}>{item.status}</span><h2>{item.recipientName || "Someone mysterious"}</h2><p>{ASK_OUT_THEMES[item.theme].name} · {item.responses.accepted} accepted · {item.responses.declined} declined · Edited {date(item.updatedAt)}</p><Link className={styles.quietButton} href={`/askout/create?id=${item.id}`}>Open file →</Link></div></article>) : <div className={styles.empty}><h2 className={styles.heading}>No Ask Outs yet.</h2><p>Send one suspiciously important message.</p></div>}</>}
    {deleting && <Dialog title="Delete this website?" onClose={() => setDeleting(null)}><p>This removes the website and its share link. This can&apos;t be undone.</p><div className={styles.footer}><button className={styles.quietButton} onClick={() => setDeleting(null)}>Keep it</button><button className={styles.button} disabled={busy} onClick={() => void action(async () => {
      if (!deleting.local) await api(`/api/websites/${deleting.id}`, { method: "DELETE" });
      removeLocalWebsite(ownerKey, deleting.id);
      setDeleting(null); await load();
    })}>Delete website</button></div></Dialog>}
  </StudioShell>;
}
