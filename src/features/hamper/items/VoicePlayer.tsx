"use client";
import { useRef, useState } from "react";
import styles from "../hamper.module.css";
const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
export function VoicePlayer({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false), [duration, setDuration] = useState(0), [current, setCurrent] = useState(0), [error, setError] = useState("");
  return <div className={styles.audio}>
    <audio ref={audio} src={src} preload="metadata" onLoadedMetadata={() => { const d = audio.current?.duration; if (d && Number.isFinite(d)) setDuration(d); }} onDurationChange={() => { const d = audio.current?.duration; if (d && Number.isFinite(d)) setDuration(d); }} onTimeUpdate={() => setCurrent(audio.current?.currentTime || 0)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setError("This voice message could not be played. Try reopening it.")} />
    <div className={styles.wave} aria-hidden="true">{Array.from({ length: 31 }, (_, i) => <i key={i} style={{ height: `${12 + (i * 17 % 43)}px`, opacity: playing && i / 31 < current / (duration || 90) ? 1 : .45 }} />)}</div>
    <button type="button" className={styles.button} onClick={async () => { if (playing) audio.current?.pause(); else { try { await audio.current?.play(); } catch { setError("Tap play again to listen."); } } }}>{playing ? "Pause voice note" : "Play voice note"}</button>
    <input type="range" min={0} max={duration || current || 1} step={.1} value={current} aria-label="Voice note progress" disabled={!duration} onChange={e => { if (audio.current) audio.current.currentTime = Number(e.target.value); }} />
    <time>{time(current)} / {duration ? time(duration) : "–:––"}</time>
    {error && <p role="alert">{error}</p>}
  </div>;
}
