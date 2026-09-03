"use client";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "../hamper.module.css";
export function Dialog({ title, onClose, children, kind = "note", busy = false }: { title: string; onClose: () => void; children: ReactNode; kind?: string; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={styles.dialog} data-kind={kind} aria-label={title} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === ref.current) { const r = ref.current.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>
    <div className={styles.dialogBar}><span>{title}</span><button type="button" onClick={onClose} disabled={busy} aria-label="Close">×</button></div>
    <div className={styles.dialogBody}>{children}</div>
  </dialog>;
}
