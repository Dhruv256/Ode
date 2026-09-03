"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { DRAWING_COLORS, HAMPER_LIMITS } from "../config";
import type { DrawingStroke } from "../types";
import styles from "../hamper.module.css";
export function DrawingPreview({ strokes }: { strokes: DrawingStroke[] }) {
  return <svg className={styles.drawingPreview} viewBox="0 0 1000 700" role="img" aria-label="A drawing made for you">{strokes.map((s, i) => <polyline key={i} points={s.points.map(p => p.join(",")).join(" ")} stroke={s.color} strokeWidth={s.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}</svg>;
}
export function DrawingCanvas({ value, onChange }: { value: DrawingStroke[]; onChange: (strokes: DrawingStroke[]) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null), active = useRef<DrawingStroke | null>(null), pointer = useRef<number | null>(null);
  const [color, setColor] = useState(DRAWING_COLORS[0]), [width, setWidth] = useState(5), [error, setError] = useState("");
  function paint(strokes: DrawingStroke[]) {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 1000, 700);
    for (const s of strokes) {
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); s.points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    }
  }
  useEffect(() => { paint(value); }, [value]);
  function point(e: PointerEvent<HTMLCanvasElement>): [number, number] {
    const rect = e.currentTarget.getBoundingClientRect();
    return [Math.round(Math.max(0, Math.min(1000, (e.clientX - rect.left) / rect.width * 1000))), Math.round(Math.max(0, Math.min(700, (e.clientY - rect.top) / rect.height * 700)))];
  }
  function finish(e: PointerEvent<HTMLCanvasElement>) {
    if (pointer.current !== e.pointerId || !active.current) return;
    const next = [...value, active.current]; active.current = null; pointer.current = null; onChange(next);
  }
  return <div>
    <p className={styles.subtitle}>A little sketch, in your own hand. Draw with your finger, mouse or pen.</p>
    <div className={styles.palette}>{DRAWING_COLORS.map(c => <button type="button" key={c} style={{ background: c }} aria-label={`Ink ${c}`} aria-pressed={color === c} onClick={() => setColor(c)} />)}</div>
    <div className={styles.actions}>{([2, 5, 9] as const).map((w, i) => <button type="button" className={styles.quietButton} aria-pressed={width === w} key={w} onClick={() => setWidth(w)}>{["Thin", "Medium", "Thick"][i]}</button>)}</div>
    <canvas ref={canvas} width={1000} height={700} className={styles.drawing} aria-label="Drawing paper" tabIndex={0}
      onPointerDown={e => {
        if (active.current || e.button !== 0) return;
        if (value.length >= HAMPER_LIMITS.maxStrokes || value.reduce((n, s) => n + s.points.length, 0) >= HAMPER_LIMITS.maxPoints - 2) { setError("The paper is full. Undo a few strokes to keep drawing."); return; }
        e.currentTarget.setPointerCapture(e.pointerId); pointer.current = e.pointerId; const p = point(e);
        active.current = { color, width, points: [p, [Math.min(1000, p[0] + .1), p[1]]] }; paint([...value, active.current]); setError("");
      }}
      onPointerMove={e => {
        if (!active.current || pointer.current !== e.pointerId) return;
        if (value.reduce((n, s) => n + s.points.length, 0) + active.current.points.length >= HAMPER_LIMITS.maxPoints) return;
        const p = point(e), last = active.current.points.at(-1)!;
        if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 2) return;
        active.current.points.push(p); paint([...value, active.current]);
      }} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} />
    <div className={styles.actions}><button type="button" className={styles.quietButton} disabled={!value.length} onClick={() => onChange(value.slice(0, -1))}>Undo</button><button type="button" className={styles.quietButton} disabled={!value.length} onClick={() => onChange([])}>Clear paper</button></div>
    {error && <p role="alert">{error}</p>}
  </div>;
}
