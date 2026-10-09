"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { EventType, HamperContent, HamperItem } from "../types";
import { HAMPER_ITEM_REGISTRY, HAMPER_THEMES, HAMPER_MESSAGE_FIELD } from "../config";
import { ItemObject } from "../components/ItemObject";
import { ItemView, itemSummary, type ResolveAsset } from "./ItemView";
import { nextOpeningStage, type OpeningStage } from "./opening";
import styles from "../hamper.module.css";
export function themeStyle(theme: HamperContent["theme"]): CSSProperties {
  const t = HAMPER_THEMES[theme];
  return { "--h-paper": t.paper, "--h-accent": t.accent, "--h-soft": t.soft, "--h-box": t.box } as CSSProperties;
}
export function Recipient({ content, resolveAsset, onEvent }: { content: HamperContent; resolveAsset: ResolveAsset; onEvent?: (event: EventType, itemId?: string) => void }) {
  const [openingStage, setOpeningStage] = useState<OpeningStage>(0), [busy, setBusy] = useState(false), [opened, setOpened] = useState(false), [selected, setSelected] = useState<HamperItem | null>(null);
  const stageRef = useRef<OpeningStage>(0), busyRef = useRef(false), timer = useRef<ReturnType<typeof setTimeout>>(), heading = useRef<HTMLHeadingElement>(null), root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion(), theme = HAMPER_THEMES[content.theme];
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { if (opened) heading.current?.focus({ preventScroll: true }); }, [opened]);
  function tap() {
    const next = nextOpeningStage(stageRef.current, busyRef.current);
    if (next === stageRef.current) return;
    stageRef.current = next; busyRef.current = true; setBusy(true); setOpeningStage(next);
    onEvent?.(next === 1 ? "box_first_shake" : next === 2 ? "box_second_shake" : "box_opened");
    timer.current = setTimeout(() => { busyRef.current = false; setBusy(false); if (next === 3) setOpened(true); }, reduced ? 120 : next === 1 ? 240 : next === 2 ? 360 : 700);
  }
  const shake = reduced ? { scale: openingStage ? [1, openingStage === 1 ? 1.015 : 1.03, 1] : 1 } : { rotate: openingStage === 1 ? [0, -2, 3, -2, 0] : openingStage >= 2 ? [0, -5, 6, -4, 0] : 0, y: openingStage >= 2 ? [0, -5, 0] : 0 };
  return <div className={styles.recipient} style={themeStyle(content.theme)} ref={root} data-theme={content.theme} data-opening-stage={openingStage} data-opening-style={content.openingStyle}>
    <div className={styles.recipientHeader}>a little care, delivered by Ode</div>
    <AnimatePresence mode="wait">
      {!opened ? <motion.div key="package" className={styles.closed} exit={{ opacity: 0, scale: reduced ? 1 : content.openingStyle === "scene" ? 1.08 : .98 }} transition={{ duration: .2 }}>
        <h1 className={styles.mailTitle}>you&apos;ve got mail.</h1>
        <div className={styles.packageWrap}>
          {openingStage === 3 && !reduced && Array.from({ length: 8 }, (_, i) => <motion.i key={i} className={styles.paperPiece} aria-hidden="true" style={{ background: i % 2 ? theme.soft : theme.accent }} initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: (i - 3.5) * 32, y: -80 - (i % 3) * 24, rotate: i * 43, opacity: 0 }} transition={{ duration: .7 }} />)}
          <motion.button type="button" className={`${styles.package} ${openingStage === 3 ? styles.openStage : ""}`} aria-label={`Open hamper for ${content.recipient || "you"}, tap ${Math.min(openingStage + 1, 3)} of 3`} aria-disabled={busy || openingStage === 3} onClick={tap} animate={shake} transition={{ duration: openingStage === 1 ? .24 : .36 }}>
            <span className={styles.lid} aria-hidden="true"><span className={styles.tape} /></span>
            <span className={styles.label}><b>WITH CARE</b><small>Digital care package</small><small>To</small><strong>{content.recipient || "Someone lovely"}</strong><small>From</small><strong>{content.sender || "Someone who cares"}</strong><span className={styles.barcode} aria-hidden="true" /></span>
          </motion.button>
        </div>
        <p className={styles.tapHint} aria-live="polite">{["tap to open", "a little more…", "one more time", "made just for you"][openingStage]}</p>
        <span className={styles.eyebrow}>{Math.min(openingStage, 3)} / 3 little taps</span>
      </motion.div> : <motion.div key="world" className={styles.opened} initial={{ opacity: 0, scale: reduced ? 1 : content.openingStyle === "scene" ? 1.06 : 1 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? .1 : .6 }}>
        <div className={styles.openingNote}><h1 ref={heading} tabIndex={-1}>A few good things,<br />just for {content.recipient}.</h1>{content.message?.trim() && <p className={styles.personalAnswer} data-hamper-field={HAMPER_MESSAGE_FIELD.key}><small>{HAMPER_MESSAGE_FIELD.recipientLabel}</small><span>{content.message}</span></p>}<span className={styles.eyebrow}>From {content.sender} · tap a keepsake</span></div>
        <div className={content.openingStyle === "scene" ? styles.scene : undefined} data-theme={content.theme}>
          {content.openingStyle === "scene" && <p className={styles.sceneLabel}>{theme.scene} / a place for your little things</p>}
          <div className={styles.composition}>
            {content.items.map((item, i) => { const instanceIndex = content.items.slice(0, i).filter(candidate => candidate.type === item.type).length; return <motion.div key={item.id} className={styles.objectSlot} data-type={item.type}
              initial={reduced || i >= 12 ? { opacity: 0 } : content.openingStyle === "burst" ? { opacity: 0, x: ((i % 5) - 2) * 62, y: -90 - (i % 3) * 34, scale: .28, rotate: (i % 2 ? 1 : -1) * 14 } : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: reduced ? 0 : [-2, 2, -1, 1][i % 4] }}
              transition={{ duration: reduced ? .1 : content.openingStyle === "burst" ? .7 : .55, delay: reduced ? 0 : Math.min(i, 12) * .045, ease: [.18, .7, .25, 1] }}>
              <button type="button" className={styles.objectTrigger} data-type={item.type} aria-label={`Open ${HAMPER_ITEM_REGISTRY[item.type].label.toLowerCase()}: ${itemSummary(item)}`} onClick={() => { setSelected(item); onEvent?.("item_opened", item.id); }}>
                <ItemObject type={item.type} variant={item.payload.visualVariant} instanceIndex={instanceIndex} theme={content.theme} />
                <span className={styles.objectLabel}>{HAMPER_ITEM_REGISTRY[item.type].label}</span><small className={styles.objectCue}>open</small>
              </button>
            </motion.div>; })}
          </div>
        </div>
        {!content.items.length && <p className={styles.tapHint}>Your keepsakes will be waiting here.</p>}
      </motion.div>}
    </AnimatePresence>
    {selected && <ItemView item={selected} theme={content.theme} onClose={() => setSelected(null)} resolveAsset={resolveAsset} onExternal={() => onEvent?.("external_link_clicked", selected.id)} />}
  </div>;
}
