"use client";
import { useEffect, useRef, useState } from "react";
import { HAMPER_LIMITS } from "../config";
import styles from "../hamper.module.css";
export function VoiceRecorder({ onRecorded }: { onRecorded: (file: File) => void }) {
  const recorder = useRef<MediaRecorder | null>(null), stream = useRef<MediaStream | null>(null), timer = useRef<ReturnType<typeof setInterval>>(), mounted = useRef(true);
  const [state, setState] = useState<"idle" | "recording" | "paused">("idle"), [seconds, setSeconds] = useState(0), [error, setError] = useState("");
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (recorder.current?.state !== "inactive") recorder.current?.stop(); stream.current?.getTracks().forEach(t => t.stop()); clearInterval(timer.current); }; }, []);
  async function start() {
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("Recording isn't supported here. You can upload a voice message instead.");
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) { media.getTracks().forEach(t => t.stop()); return; }
      stream.current = media;
      const mimeType = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"].find(m => MediaRecorder.isTypeSupported(m));
      const r = new MediaRecorder(media, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 64000 });
      recorder.current = r;
      const chunks: BlobPart[] = []; let bytes = 0, elapsed = 0;
      r.ondataavailable = e => { if (e.data.size) { chunks.push(e.data); bytes += e.data.size; } if (bytes > HAMPER_LIMITS.maxAudioBytes - 32000 && r.state !== "inactive") r.stop(); };
      r.onstop = () => {
        clearInterval(timer.current); media.getTracks().forEach(t => t.stop());
        if (!mounted.current) return;
        setState("idle");
        const blob = new Blob(chunks, { type: r.mimeType.split(";")[0] });
        if (blob.size > HAMPER_LIMITS.maxAudioBytes) { setError("That recording is over 2 MB. Try a shorter one."); return; }
        if (blob.size) onRecorded(new File([blob], "voice-note", { type: blob.type }));
      };
      r.onerror = () => { setError("Recording stopped unexpectedly. Please try again."); if (r.state !== "inactive") r.stop(); };
      r.start(250); setSeconds(0); setState("recording");
      timer.current = setInterval(() => { if (r.state === "recording") { elapsed++; setSeconds(elapsed); if (elapsed >= HAMPER_LIMITS.maxRecordingSeconds) r.stop(); } }, 1000);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Microphone access wasn't available."); stream.current?.getTracks().forEach(t => t.stop()); }
  }
  return <div><div className={styles.actions}>{state === "idle" ? <button type="button" className={styles.quietButton} onClick={() => void start()}>Record a voice note</button> : <>
    <button type="button" className={styles.quietButton} onClick={() => { if (state === "paused") { recorder.current?.resume(); setState("recording"); } else { recorder.current?.pause(); setState("paused"); } }}>{state === "paused" ? "Resume" : "Pause"}</button>
    <button type="button" className={styles.button} onClick={() => recorder.current?.stop()}>Stop · {seconds}s</button></>}
  </div><p className={styles.subtitle}>Up to 90 seconds, or 2 MB. A small hello goes a long way.</p>{error && <p role="alert" className={styles.notice}>{error}</p>}</div>;
}
