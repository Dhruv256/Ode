"use client";
import { useEffect, useState } from "react";
import { api } from "../client";
import type { Hamper } from "../types";
import { HamperBuilder } from "./HamperBuilder";
import { StudioShell } from "@/components/dashboard/StudioShell";
import { ItemIcon } from "../components/ItemIcon";
import styles from "../hamper.module.css";
export function BuilderLoader({ id, step = 0 }: { id?: string; step?: number }) {
  const [hamper, setHamper] = useState<Hamper | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { if (id) api<Hamper>(`/api/hampers/${id}`).then(setHamper).catch(e => setError(e.message)); }, [id]);
  if (hamper) return <HamperBuilder initial={hamper} initialStep={step} />;
  return <StudioShell section="hamper">{id ? <p>{error || "Opening your hamper…"}</p> : <><ItemIcon type="gift" size={72} /><p className={styles.eyebrow}>A little care package</p><h1 className={styles.title}>Good things,<br />tucked together.</h1><p className={styles.subtitle}>Choose a wrapping. Add a few personal things. Send a little joy.</p><div className={styles.sectionHeader}><button className={styles.button} disabled={busy} onClick={async () => { setBusy(true); setError(""); try { const result = await api<{ id: string }>("/api/hampers", { method: "POST" }); location.assign(`/dashboard/hamper/${result.id}/edit`); } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); setBusy(false); } }}>{busy ? "Finding some wrapping paper…" : "Start packing →"}</button></div>{error && <p role="alert" className={styles.notice}>{error}</p>}</>}</StudioShell>;
}
