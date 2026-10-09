"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { AskOutContent, AskOutMiniGame, AskOutPlayfulIntensity } from "../types";
import styles from "../askout.module.css";

const COPY: Record<AskOutMiniGame, { eyebrow: string; title: string; action: string; done: string }> = {
  "notification-tap": { eyebrow:"Private notification",title:"You’ve been tagged in something suspicious.",action:"Open suspicious message",done:"Suspicious. You opened it anyway." },
  "swipe-open": { eyebrow:"Context unavailable",title:"The message is being needlessly difficult.",action:"Swipe to open",done:"Excellent swiping. Context acquired." },
  "sticker-peel": { eyebrow:"Definitely not hiding anything",title:"The classified sticker seems legally binding.",action:"Okay, obviously peel",done:"You were explicitly told not to do that." },
  "repelling-no": { eyebrow:"One unnecessary checkpoint",title:"Are you sure you want the context?",action:"Unfortunately, yes",done:"Curiosity wins on appeal." },
  "clue-cards": { eyebrow:"Loose evidence",title:"Two clue cards require inspection.",action:"Inspect cards",done:"Both clues have excellent vibes." },
  "cat-pet": { eyebrow:"Case file #001",title:"The detective requires one respectful head pat.",action:"Pet detective to continue",done:"Morale improved by 73%." },
  "evidence-board": { eyebrow:"Case file 01",title:"Move the final clue onto the evidence board.",action:"Drag clue",done:"The red string suddenly makes sense." },
  "scratch-clue": { eyebrow:"Cat-approved evidence",title:"Scratch away the very official cover.",action:"Scratch clue",done:"Remarkable detective work." },
  "paw-stamp": { eyebrow:"Approval desk",title:"One paw stamp makes the mission official.",action:"Tap paw for approval",done:"Extremely official." },
  "cat-nudge": { eyebrow:"Expert guidance",title:"The detective has opinions about this clue.",action:"Follow the paw",done:"Correct clue selected. Obviously." },
  "owl-catch": { eyebrow:"Special delivery",title:"The owl insists this is urgent.",action:"Inspect delivery",done:"The owl appears emotionally invested." },
  "envelope-open": { eyebrow:"Unaddressed owl post",title:"The letter arrived slightly late.",action:"Open suspicious letter",done:"Excellent. Bureaucracy defeated." },
  "wand-trail": { eyebrow:"Unofficial spellwork",title:"Trace a small light trail to unlock the note.",action:"Trace the spell",done:"Apertus Tinyus was surprisingly effective." },
  "floating-note": { eyebrow:"Airborne correspondence",title:"Catch the note before it becomes literature.",action:"Catch the note",done:"Narrative secured." },
  "seal-break": { eyebrow:"Final administrative seal",title:"Break the entirely unofficial wax seal.",action:"Break seal",done:"No ancient curse. Great news." },
  "scrapbook-cover": { eyebrow:"Page 01",title:"A very serious page requires inspection.",action:"Open the cover",done:"Sticker caption: not actually serious." },
  "sticker-drag": { eyebrow:"Composition crisis",title:"Place the star sticker where it clearly belongs.",action:"Drag sticker",done:"Art direction: rescued." },
  "flip-polaroid": { eyebrow:"Evidence",title:"The Polaroid has notes on the back.",action:"Flip the Polaroid",done:"It’s a date idea. Calm down." },
  "tape-note": { eyebrow:"Handmade engineering",title:"Slide the tape onto the loose note.",action:"Tape the note",done:"Structurally sound enough for feelings." },
  "foil-scratch": { eyebrow:"Shiny obstruction",title:"Scratch the foil without getting glitter everywhere.",action:"Scratch foil",done:"Almost no glitter escaped." },
  "exhibit-enter": { eyebrow:"Admission: free",title:"A very small exhibition is now open.",action:"Enter exhibit",done:"Emotional commitment: currently none." },
  "plaque-tap": { eyebrow:"Exhibit 01 · The free evening",title:"The curator left a suspiciously vague plaque.",action:"Inspect plaque",done:"Experts believe it could be useful." },
  "spotlight": { eyebrow:"Lighting department",title:"Aim the spotlight at the next artifact.",action:"Move spotlight",done:"The object is now dramatically informed." },
  "gallery-swipe": { eyebrow:"Pocket gallery",title:"Swipe through the smallest permanent collection.",action:"Browse collection",done:"Three masterpieces. Zero gift shop." },
  "ticket-stamp": { eyebrow:"Visitor services",title:"Validate the ticket for the final room.",action:"Stamp the ticket",done:"Admission granted to one important question." },
  "chapter-card": { eyebrow:"Tiny chapter",title:"Open the next very short chapter.",action:"Continue reading",done:"Plot development unlocked." },
  "page-flip": { eyebrow:"One more page",title:"Turn the page. The editor insists.",action:"Turn page",done:"A suspiciously useful paragraph appears." },
  "bookmark-reveal": { eyebrow:"Saved place",title:"Pull the bookmark to reveal the margin note.",action:"Pull bookmark",done:"Worth keeping your place for." },
};

function copyFor(id: AskOutMiniGame, content: AskOutContent, openingMessage = "") {
  const tag = content.recipientTag.trim().replace(/^@/, "") || content.recipientName || "you";
  const recipient = content.recipientName || "you";
  const opening: Partial<Record<AskOutMiniGame, string>> = {
    "notification-tap": `@${tag} — you’ve been tagged in something suspicious.`,
    "cat-pet": `Subject: Why is ${recipient} being investigated?`,
    "owl-catch": `Special delivery for ${recipient}. The owl refuses to elaborate.`,
    "scrapbook-cover": `A very serious page about ${recipient}.`,
    "exhibit-enter": `Visitor: ${recipient}. Exhibit: a possible date.`,
  };
  return { ...COPY[id], title: openingMessage || opening[id] || COPY[id].title };
}

export function RepellingNo({ complete, content, openingMessage, playfulJourney = true, intensity = "mischievous" }: { complete: () => void; content: AskOutContent; openingMessage?: string; playfulJourney?: boolean; intensity?: AskOutPlayfulIntensity }) {
  const area=useRef<HTMLDivElement>(null),[position,setPosition]=useState({x:8,y:116}),[attempts,setAttempts]=useState(0);
  const reduced=useReducedMotion();
  const flee=()=>{setAttempts(n=>n+1);if(!playfulJourney||reduced)return;const box=area.current?.getBoundingClientRect();if(!box)return;const padding=intensity==="chaotic"?2:6;setPosition({x:padding+Math.random()*Math.max(padding,box.width-112),y:94+Math.random()*Math.max(padding,box.height-146)});};
  const copy=copyFor("repelling-no",content,openingMessage);
  return <div ref={area} className={styles.fleeArea}><p className={styles.kicker}>{copy.eyebrow}</p><h2>{copy.title}</h2><button className={styles.primary} onClick={complete}>{copy.action}</button>{playfulJourney?<button className={styles.fleeButton} style={{transform:`translate(${position.x}px,${position.y}px)`}} onPointerEnter={flee} onPointerDown={e=>{e.preventDefault();flee();}} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();flee();}}}>{["No thanks","Nope","Still nope","Nice try","Almost","This button has trust issues","Please stop chasing me 😭"][Math.min(attempts,6)]}</button>:<button className={styles.secondary} onClick={complete}>No thanks</button>}</div>;
}
function SliderInteraction({id,complete,content,openingMessage}:{id:AskOutMiniGame;complete:()=>void;content:AskOutContent;openingMessage?:string}){
  const[value,setValue]=useState(0),copy=copyFor(id,content,openingMessage),glyph=id==="wand-trail"?"✦":id==="spotlight"?"◉":id==="bookmark-reveal"?"▮":id==="gallery-swipe"?"▣":id==="evidence-board"?"?":id==="sticker-drag"?"★":id==="tape-note"?"═":"→";
  return <div className={styles.interaction}><p className={styles.kicker}>{copy.eyebrow}</p><h2>{copy.title}</h2><div className={styles.dragScene} data-kind={id}><motion.span animate={{x:`${value*1.45}%`,rotate:value/8}}>{glyph}</motion.span><i/></div><label className={styles.srOnly} htmlFor={`gesture-${id}`}>{copy.action}</label><input id={`gesture-${id}`} className={styles.gesture} type="range" min="0" max="100" value={value} onChange={e=>{const next=Number(e.target.value);setValue(next);if(next>92)setTimeout(complete,180);}}/><small>Slide to continue</small></div>;
}
function ScratchInteraction({id,complete,content,openingMessage}:{id:AskOutMiniGame;complete:()=>void;content:AskOutContent;openingMessage?:string}){const[count,setCount]=useState(0),copy=copyFor(id,content,openingMessage);return <div className={styles.interaction}><p className={styles.kicker}>{copy.eyebrow}</p><h2>{copy.title}</h2><button className={styles.scratchCard} style={{"--scratched":count/4} as React.CSSProperties} onClick={()=>{const next=count+1;setCount(next);if(next>=4)setTimeout(complete,180);}}><span>{count>=4?copy.done:copy.action}</span></button><small>Four scratches. Extremely scientific.</small></div>;}
function TapInteraction({id,complete,content,openingMessage}:{id:AskOutMiniGame;complete:()=>void;content:AskOutContent;openingMessage?:string}){
  const[activated,setActivated]=useState(false),copy=copyFor(id,content,openingMessage),glyph:Partial<Record<AskOutMiniGame,string>>={"notification-tap":"@1","cat-pet":"⌁","paw-stamp":"●","owl-catch":"⌁","envelope-open":"✉","floating-note":"▱","seal-break":"◉","scrapbook-cover":"▥","plaque-tap":"▤","ticket-stamp":"◎","chapter-card":"01","page-flip":"↷"};
  return <div className={styles.interaction}><p className={styles.kicker}>{copy.eyebrow}</p><h2>{copy.title}</h2><motion.button className={styles.objectButton} data-kind={id} animate={activated?{rotate:[0,-7,5,0],scale:[1,1.08,1]}:{scale:1}} transition={{duration:activated?.6:.25}} onClick={()=>{if(activated)return;setActivated(true);setTimeout(complete,650);}}><motion.span animate={!activated&&id==="owl-catch"?{y:[0,-8,0],rotate:[-3,4,-3]}:!activated?{y:[0,-2,0]}:{y:0}} transition={{duration:id==="owl-catch"?1.8:2.2,repeat:activated?0:Infinity}}>{glyph[id]||"✦"}</motion.span><small>{activated?copy.done:copy.action}</small></motion.button></div>;
}
function ChoiceInteraction({id,complete,content,openingMessage}:{id:"clue-cards"|"cat-nudge";complete:()=>void;content:AskOutContent;openingMessage?:string}){
  const[opened,setOpened]=useState<string[]>([]),copy=copyFor(id,content,openingMessage);
  if(id==="cat-nudge")return <div className={styles.interaction}><p className={styles.kicker}>{copy.eyebrow}</p><h2>{copy.title}</h2><div className={styles.nudgeChoices}><button onClick={e=>e.currentTarget.setAttribute("data-nudged","true")}>Probably nothing</button><button onClick={complete}>The suspiciously good plan <span>← paw</span></button></div></div>;
  return <div className={styles.interaction}><p className={styles.kicker}>{copy.eyebrow}</p><h2>{copy.title}</h2><div className={styles.clueCards}>{["Exhibit A","Exhibit B"].map((label,index)=><button key={label} data-open={opened.includes(label)} onClick={()=>{const next=Array.from(new Set([...opened,label]));setOpened(next);if(next.length===2)setTimeout(complete,500);}}><b>0{index+1}</b><span>{opened.includes(label)?(index?`${content.creatorName||"The sender"}, acting suspiciously specific.`:`${content.activity||"A good plan"}. Critics are cautiously optimistic.`):label}</span></button>)}</div></div>;
}
function FlipInteraction({complete}:{complete:()=>void}){const[flipped,setFlipped]=useState(false);return <div className={styles.interaction}><p className={styles.kicker}>Tiny photo evidence</p><h2>The clue is hiding on the back.</h2><button className={styles.polaroid} data-flipped={flipped} onClick={()=>{if(flipped)complete();else setFlipped(true);}}><span>{flipped?"It’s a date idea. Calm down.":"Evidence"}</span><small>{flipped?"Plot advanced":"Flip the Polaroid"}</small></button></div>;}
function PeelInteraction({complete,content,openingMessage}:{complete:()=>void;content:AskOutContent;openingMessage?:string}){const timer=useRef<ReturnType<typeof setTimeout>>(),[holding,setHolding]=useState(false),copy=copyFor("sticker-peel",content,openingMessage);const stop=()=>{if(timer.current)clearTimeout(timer.current);setHolding(false);};return <div className={styles.interaction}><p className={styles.kicker}>{copy.eyebrow}</p><h2>{copy.title}</h2><div className={styles.peelClue}>{copy.done}<i className={holding?styles.peeling:""}>DO NOT PEEL</i></div><button className={styles.primary} onPointerDown={()=>{setHolding(true);timer.current=setTimeout(complete,850);}} onPointerUp={stop} onPointerLeave={stop} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")complete();}}>Press and hold to peel</button></div>;}
export function InteractionBlock({id,complete,content,openingMessage}:{id:AskOutMiniGame;content:AskOutContent;openingMessage?:string;complete:()=>void}){
  const props={complete,content,openingMessage};
  if(id==="repelling-no")return <RepellingNo {...props} playfulJourney={content.playfulJourney} intensity={content.playfulIntensity}/>;
  if(["swipe-open","evidence-board","wand-trail","sticker-drag","tape-note","spotlight","gallery-swipe","bookmark-reveal"].includes(id))return <SliderInteraction id={id} {...props}/>;
  if(["scratch-clue","foil-scratch"].includes(id))return <ScratchInteraction id={id} {...props}/>;
  if(id==="sticker-peel")return <PeelInteraction {...props}/>;if(id==="flip-polaroid")return <FlipInteraction complete={complete}/>;if(id==="clue-cards"||id==="cat-nudge")return <ChoiceInteraction id={id} {...props}/>;return <TapInteraction id={id} {...props}/>;
}
export function InteractionSequence({ids,content,openingMessage,onComplete}:{ids:AskOutMiniGame[];content:AskOutContent;openingMessage?:string;onComplete:()=>void}){const[index,setIndex]=useState(0);useEffect(()=>setIndex(0),[ids]);const complete=()=>index>=ids.length-1?onComplete():setIndex(value=>value+1);return <div className={styles.interactionSequence}><InteractionBlock key={ids[index]} id={ids[index]} content={content} openingMessage={index===0?openingMessage:""} complete={complete}/>{ids.length>1&&<div className={styles.sequenceDots}>{ids.map((id,item)=><i key={id} data-active={item===index}/>)}</div>}</div>;}
