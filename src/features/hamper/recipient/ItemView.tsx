"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Dialog } from "../components/Dialog";
import { HAMPER_ITEM_REGISTRY, hamperFieldLabel } from "../config";
import { ItemIcon } from "../components/ItemIcon";
import { ItemObject } from "../components/ItemObject";
import type { HamperItem, HamperTheme } from "../types";
import { musicEmbed, videoEmbed } from "../validation";
import { DrawingPreview } from "../items/DrawingCanvas";
import { VoicePlayer } from "../items/VoicePlayer";
import styles from "../hamper.module.css";
export type ResolveAsset = (item: HamperItem) => Promise<string>;
export function itemSummary(item: HamperItem) {
  const p = item.payload;
  return ("title" in p && p.title) || ("headline" in p && p.headline) || ("place" in p && p.place) || ("caption" in p && p.caption) || HAMPER_ITEM_REGISTRY[item.type].label;
}
export function AssetImage({ item, resolveAsset }: { item: HamperItem; resolveAsset: ResolveAsset }) {
  const [url, setUrl] = useState(item.assetUrl), [error, setError] = useState(false);
  useEffect(() => { let live = true; if (!url) resolveAsset(item).then(value => { if (live) setUrl(value); }).catch(() => { if (live) setError(true); }); return () => { live = false; }; }, [item, resolveAsset, url]);
  return url && !error ? <img src={url} alt={itemSummary(item)} loading="lazy" onError={() => setError(true)} /> : <ItemIcon type="photo" size={70} />;
}
export function ItemView({ item, theme, onClose, resolveAsset, onExternal }: { item: HamperItem; theme: HamperTheme; onClose: () => void; resolveAsset: ResolveAsset; onExternal: () => void }) {
  const reduced = useReducedMotion();
  const [unwrapped, setUnwrapped] = useState(item.type !== "gift"), [url, setUrl] = useState(item.assetUrl), [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    if ((item.type === "voice" || item.type === "photo") && !url) resolveAsset(item).then(value => { if (live) setUrl(value); }).catch(() => { if (live) setError("This keepsake couldn't be loaded. Close it and try again."); });
    return () => { live = false; };
  }, [item, resolveAsset, url]);
  const external = (href: string | undefined, label: string) => href ? <a href={href} target="_blank" rel="noopener noreferrer" className={styles.button} onClick={onExternal}>{label} ↗</a> : null;
  function content() {
    switch (item.type) {
      case "note": return <div className={styles.letter}>{item.payload.title && <h3><HamperAnswer item={item} field="title">{item.payload.title}</HamperAnswer></h3>}<p><HamperAnswer item={item} field="body">{item.payload.body}</HamperAnswer></p></div>;
      case "photo": return <>{url ? <img src={url} alt={item.payload.caption || "A photo chosen for you"} /> : <p>Opening your photo…</p>}{item.payload.caption && <p><HamperAnswer item={item} field="caption">{item.payload.caption}</HamperAnswer></p>}</>;
      case "song": { const embed = musicEmbed(item.payload.url); return <><h3><HamperAnswer item={item} field="title">{item.payload.title || "This one's for you"}</HamperAnswer></h3>{embed && <iframe className={styles.musicEmbed} title="Song player" src={embed} allow="encrypted-media; fullscreen" referrerPolicy="strict-origin-when-cross-origin" />}{external(item.payload.url, "Open song")}</>; }
      case "video": return <><iframe className={styles.embed} src={videoEmbed(item.payload.url)} title={item.payload.caption || "A video for you"} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />{item.payload.caption && <p><HamperAnswer item={item} field="caption">{item.payload.caption}</HamperAnswer></p>}{external(item.payload.url, "Open video")}</>;
      case "voice": return <><h3><HamperAnswer item={item} field="title">{item.payload.title || "A familiar voice"}</HamperAnswer></h3>{url ? <VoicePlayer src={url} /> : <p>Finding your voice note…</p>}</>;
      case "drawing": return <><DrawingPreview strokes={item.payload.strokes} />{item.payload.caption && <p><HamperAnswer item={item} field="caption">{item.payload.caption}</HamperAnswer></p>}</>;
      case "gift": return unwrapped ? <><h3>A little something for you</h3>{item.payload.note && <p><HamperAnswer item={item} field="note">{item.payload.note}</HamperAnswer></p>}{external(item.payload.url, "Open gift")}</> : <button type="button" className={styles.unwrapObject} data-type="gift" onClick={() => setUnwrapped(true)}><ItemObject type="gift" variant={item.payload.visualVariant} /><strong>Pull the ribbon</strong><small>Unwrap your gift</small></button>;
      case "location": return <><ItemIcon type="location" size={64} /><h3><HamperAnswer item={item} field="place">{item.payload.place}</HamperAnswer></h3>{item.payload.note && <p><HamperAnswer item={item} field="note">{item.payload.note}</HamperAnswer></p>}{external(item.payload.url, "Open in Maps")}</>;
      case "coupon": return <><p className={styles.eyebrow}>A promise to keep</p><h3><HamperAnswer item={item} field="title">{item.payload.title}</HamperAnswer></h3>{item.payload.description && <p><HamperAnswer item={item} field="description">{item.payload.description}</HamperAnswer></p>}{item.payload.code && <code><HamperAnswer item={item} field="code">{item.payload.code}</HamperAnswer></code>}{item.payload.expiry && <p>Good until {item.payload.expiry}</p>}{external(item.payload.url, "Use coupon")}</>;
      case "news": return <><p className={styles.eyebrow}>The Ode daily · picked just for you</p><hr /><h3><HamperAnswer item={item} field="headline">{item.payload.headline || "Thought you'd like this"}</HamperAnswer></h3>{item.payload.note && <p><HamperAnswer item={item} field="note">{item.payload.note}</HamperAnswer></p>}{external(item.payload.url, "Read article")}</>;
    }
  }
  return <Dialog title={HAMPER_ITEM_REGISTRY[item.type].object} onClose={onClose} kind={item.type} theme={theme}><motion.div className={styles.itemBody} key={String(unwrapped)} initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -8, y: 8 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} transition={{ duration: reduced ? .1 : .3 }}>{error ? <p role="alert">{error}</p> : content()}</motion.div></Dialog>;
}

function HamperAnswer({ item, field, children }: { item: HamperItem; field: string; children: React.ReactNode }) {
  const value=(item.payload as unknown as Record<string,unknown>)[field];
  const label=hamperFieldLabel(item.type,field);
  if(typeof value!=="string" || !value.trim() || !label)return <>{children}</>;
  return <span className={styles.personalAnswer} data-hamper-field={item.type+"."+field}><small>{label}</small><span>{children}</span></span>;
}
