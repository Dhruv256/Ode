"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { AskOutContent, AskOutTheme } from "../types";
import { RepellingNo } from "./InteractionSequence";
import styles from "../askout.module.css";

type Props = { theme: AskOutTheme; content: AskOutContent; onComplete: () => void };
const captions: Record<Exclude<AskOutTheme, "tagged-message">, { eyebrow: string; title: string; no: string; blocked: string; yes: string }> = {
  "cat-investigation": { eyebrow: "Procedural checkpoint", title: "The detective has reviewed your alternative.", no: "Not interested in seeing this", blocked: "The detective has rejected this response on procedural grounds.", yes: "Present evidence" },
  "magical-message": { eyebrow: "Minor enchantment", title: "The letter would like to continue existing.", no: "Close the letter", blocked: "The owl appears to have misplaced that option.", yes: "Continue spellwork" },
  scrapbook: { eyebrow: "Page 00 · tiny disclaimer", title: "This page has a surprisingly firm editorial direction.", no: "Skip this page", blocked: "Nice try. The tape has other plans.", yes: "Turn the page" },
  "tiny-exhibit": { eyebrow: "Exhibit entrance", title: "The curator has one more room to show you.", no: "Leave exhibition", blocked: "This exhibit is currently unavailable.", yes: "Continue tour" },
};

function CatGate({ content, onComplete }: Props) {
  const [blocked, setBlocked] = useState(false);
  const copy = captions["cat-investigation"];
  return <div className={styles.interaction}><p className={styles.kicker}>{copy.eyebrow}</p><h2>{copy.title}</h2><div className={`${styles.interferenceStage} ${blocked?styles.interferenceBlocked:""}`} data-intensity={content.playfulIntensity}><span className={styles.interferenceCat}>⌁</span><button className={styles.primary} onClick={onComplete}>{copy.yes}</button><button className={styles.interferenceNo} onClick={()=>setBlocked(true)}>{blocked?"The cat is sitting here now":copy.no}</button></div>{blocked&&<p className={styles.interferenceCaption}>{copy.blocked}</p>}<small>One procedural click, then the case continues.</small></div>;
}
function MagicGate({ content, onComplete }: Props) {
  const [stolen,setStolen]=useState(false); const copy=captions["magical-message"],reduced=useReducedMotion();
  return <div className={styles.interaction}><p className={styles.kicker}>{copy.eyebrow}</p><h2>{copy.title}</h2><div className={`${styles.interferenceStage} ${stolen?styles.interferenceBlocked:""}`} data-intensity={content.playfulIntensity}><motion.span className={styles.interferenceOwl} animate={stolen?{x:120,y:-35,rotate:18}:reduced?{y:0}:{y:[0,-8,0]}} transition={{duration:stolen ? .5 : (content.playfulIntensity==="light"||reduced ? .01 : 1.8),repeat:stolen||reduced?0:Infinity}}>⌁</motion.span><button className={styles.primary} onClick={onComplete}>{stolen?"Continue":"Continue spellwork"}</button><button className={styles.interferenceNo} onClick={()=>setStolen(true)}>{stolen?"The owl took it":copy.no}</button></div>{stolen&&<p className={styles.interferenceCaption}>{copy.blocked}</p>}<small>The owl is not accepting complaints.</small></div>;
}
function ScrapbookGate({ content, onComplete }: Props) {
  const [peeled,setPeeled]=useState(false); const copy=captions.scrapbook;
  return <div className={styles.interaction}><p className={styles.kicker}>{copy.eyebrow}</p><h2>{copy.title}</h2><div className={`${styles.interferenceStage} ${peeled?styles.interferenceBlocked:""}`} data-intensity={content.playfulIntensity}><button className={styles.primary} onClick={onComplete}>{copy.yes}</button><button className={styles.interferenceNo} onClick={()=>setPeeled(true)}>{peeled?"Nice try.":copy.no}</button>{!peeled&&<span className={styles.interferenceSticker}>TAPE</span>}</div>{peeled&&<p className={styles.interferenceCaption}>{copy.blocked}</p>}<small>Peel the joke, not the actual invitation.</small></div>;
}
function MuseumGate({ content, onComplete }: Props) {
  const [open,setOpen]=useState(false); const copy=captions["tiny-exhibit"];
  return <div className={styles.interaction}><p className={styles.kicker}>{copy.eyebrow}</p><h2>{copy.title}</h2><div className={`${styles.interferenceStage} ${open?styles.interferenceBlocked:""}`} data-intensity={content.playfulIntensity}><span className={styles.interferenceRope}>╱╲╱╲╱╲</span><button className={styles.primary} onClick={onComplete}>{copy.yes}</button><button className={styles.interferenceNo} onClick={()=>setOpen(true)}>{open?"Rope moved for staff":copy.no}</button></div>{open&&<p className={styles.interferenceCaption}>{copy.blocked}</p>}<small>The curator will accept one more visitor.</small></div>;
}

export function PlayfulJourneyGate({ theme, content, onComplete }: Props) {
  if(theme==="tagged-message") return <RepellingNo content={content} complete={onComplete} playfulJourney intensity={content.playfulIntensity}/>;
  if(theme==="cat-investigation") return <CatGate theme={theme} content={content} onComplete={onComplete}/>;
  if(theme==="magical-message") return <MagicGate theme={theme} content={content} onComplete={onComplete}/>;
  if(theme==="scrapbook") return <ScrapbookGate theme={theme} content={content} onComplete={onComplete}/>;
  return <MuseumGate theme={theme} content={content} onComplete={onComplete}/>;
}
