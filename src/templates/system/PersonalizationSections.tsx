"use client";

import type { RenderCtx } from "./types";
import { useState } from "react";
import type { PhotoAsset } from "@/lib/types";
import { Photo } from "./photo";
import { highPhotoArchive, resolvePhotoMode } from "@/lib/birthdayCapabilities";
import { chronologicalPhotos, LIFE_STAGES, photoStage } from "@/lib/photoIntelligence";
import { TEMPLATE_FRAMES } from "./frames";
import { nativeMemoryKeys } from "./inputContract";
import { VIBE_MODIFIERS } from "./motion";
import { PhotoViewer } from "./PhotoViewer";
import { personalAnswers } from '@/lib/personalization';

const INTEREST_LANGUAGE: Record<string, { mark: string; eyebrow: string; line: string }> = {
  gaming: { mark: "LVL", eyebrow: "player one energy", line: "Every great story deserves one more level." },
  "formula 1": { mark: "LAP", eyebrow: "on the racing line", line: "Fast instincts, brave corners, unforgettable laps." },
  football: { mark: "90′", eyebrow: "match-day spirit", line: "The kind of person you always want on your side." },
  travel: { mark: "✦", eyebrow: "next departure", line: "For the places already loved and the ones still ahead." },
  books: { mark: "CH.", eyebrow: "well read", line: "A life with dog-eared chapters worth returning to." },
  movies: { mark: "SC.", eyebrow: "now showing", line: "The scene-stealer in every room." },
  music: { mark: "BPM", eyebrow: "current rotation", line: "Some people simply make the whole room sound better." },
  chai: { mark: "☼", eyebrow: "steeped slowly", line: "For long conversations and one more warm cup." },
  coffee: { mark: "☼", eyebrow: "house favourite", line: "Best served with stories that run late." },
  dogs: { mark: "••", eyebrow: "approved by paws", line: "A soft spot that says everything." },
  cats: { mark: "≈", eyebrow: "quietly chosen", line: "Independent taste, excellent company." },
  photography: { mark: "ISO", eyebrow: "caught in the frame", line: "Always noticing the detail everyone else missed." },
  cooking: { mark: "1:1", eyebrow: "house recipe", line: "Equal parts instinct, generosity, and extra flavour." },
  fashion: { mark: "LOOK", eyebrow: "personal edition", line: "Never merely dressed—always unmistakably themselves." },
  art: { mark: "№", eyebrow: "from the studio", line: "A life composed with colour, nerve, and a point of view." },
};

function interestLanguage(label: string) {
  return INTEREST_LANGUAGE[label] ?? { mark: "+", eyebrow: "part of their world", line: `${label.replace(/\b\w/g, (c) => c.toUpperCase())}, in their own unmistakable way.` };
}

function InterestChapter({ ctx }: { ctx: RenderCtx }) {
  if (!ctx.interests.length) return null;
  return <section className="tp-interest-chapter" data-experience-chapter aria-label={`Things ${ctx.name} is into`}>
    <div className="tp-interest-heading">
      <p>FIELD NOTES / THEIR WORLD</p>
      <h2>{ctx.id === 'cinema' ? 'The soundtrack to their world.' : ctx.id === 'archive' ? 'Filed under: favourite things.' : ctx.id === 'cut-and-paste' ? 'A few things worth sticking around for.' : ctx.id === 'yearbook' ? 'Their extracurriculars.' : ctx.id === 'poster-city' ? 'On every street corner.' : `A little more ${ctx.name}.`}</h2>
      <div className="tp-interest-index">{ctx.interests.map((interest) => <span key={interest}>{interest}</span>)}</div>
    </div>
    <ul className="tp-interest-list">
      {ctx.interests.map((interest, index) => <li key={`${interest}-${index}`} data-interest={interest.replace(/[^a-z0-9]+/g, "-")}><b aria-hidden>{interestLanguage(interest).mark}</b><span>{interest}</span></li>)}
    </ul>
  </section>;
}

function CustomMemoryChapter({ ctx }: { ctx: RenderCtx }) {
  const memories = (ctx.project.customMemories ?? []).filter((memory) => memory.value.trim()).slice(0, 10);
  if (!memories.length) return null;
  return <section className="tp-custom-memories" data-experience-chapter aria-label="Personal memories and inside jokes">
    <header><p>THE DETAILS ONLY WE KNOW</p><h2>Notes from<br /><em>the margins.</em></h2></header>
    <div>{memories.map((memory, index) => <article key={memory.id} data-prominence={memory.prominence}>
      <span>{memory.icon || String(index + 1).padStart(2, "0")}</span>
      <p>{memory.label.trim() ? memory.label : "A detail only we know"}</p>
      <blockquote>{memory.value}</blockquote>
    </article>)}</div>
  </section>;
}

function HighPhotoChapter({ ctx }: { ctx: RenderCtx }) {
  const [selected,setSelected]=useState<PhotoAsset|null>(null);
  if (!ctx.photos.length) return null;
  const photos = ["archive","cinema","yearbook"].includes(ctx.id) ? chronologicalPhotos(ctx.photos) : highPhotoArchive(ctx.photos);
  return <section className="tp-high-photo" data-experience-chapter aria-label={`Complete archive of ${photos.length} photos`}>
    <details open={resolvePhotoMode(ctx.project)==="high-photo"} className="tp-collection">
    <summary><span>THE COMPLETE COLLECTION</span><h2>All {photos.length} moments.<br /><em>Every one belongs.</em></h2><p>Open the collection · tap any photo to see the whole frame</p></summary>
    <div className="tp-high-photo-grid">{photos.map((photo, index) => <div key={photo.id} data-photo-slot={index + 1}>
      <button type="button" onClick={()=>setSelected(photo)} aria-label={`Open photo ${index+1}${photo.caption?`: ${photo.caption}`:""}`}>
        <Photo photo={photo} treatment="none" ratio={TEMPLATE_FRAMES[ctx.id].collection} aspect="w-full" footprint="unbounded" showCaption={false} />
      </button>
      <small>{String(index + 1).padStart(2, "0")} · {photo.caption || "A moment kept"}</small>
      {(photo.location||photo.dateTaken||photoStage(photo)!=="unknown")&&<small>{[photo.location,photo.dateTaken,photoStage(photo)!=="unknown"?LIFE_STAGES[photoStage(photo)]:undefined].filter(Boolean).join(" · ")}</small>}
    </div>)}</div>
    </details>
    {selected&&<PhotoViewer photo={selected} onClose={()=>setSelected(null)}/>}
  </section>;
}

export function PersonalizationSections({ ctx }: { ctx: RenderCtx }) {
  const native=nativeMemoryKeys(ctx.project,ctx.id,ctx);
  const answers=personalAnswers(ctx.project.memories);
  const notes=answers.filter(memory=>!native.has(memory.key));
  const relationship=ctx.project.person.relationship?.replaceAll("-"," ");
  const dedication=relationship&&relationship!=="other"?`For my ${relationship}`:ctx.project.person.gender==="female"?"For the birthday girl":ctx.project.person.gender==="male"?"For the birthday boy":"Made for you";
  return <aside className="tp-personalization" data-template-voice={ctx.id}>
    <section className="tp-personal-notes" aria-label="Personal dedication">
      <header><p>{dedication} · {ctx.age ?? "another"} years of being you</p><h2>{ctx.fullName}</h2><p>{[ctx.project.person.nickname,ctx.project.person.pronouns,ctx.project.birthdayDate].filter(Boolean).join(" · ")}</p></header>
      <div className="tp-vibe-imprint">{ctx.project.vibes.vibes.map(vibe=><span key={vibe} data-vibe-mark={vibe}>{VIBE_MODIFIERS[vibe]?.accent}</span>)}</div>
      {ctx.project.vibes.customVibe&&<p className="tp-custom-vibe"><small>Your own kind of energy</small><span>{ctx.project.vibes.customVibe}</span></p>}
      {notes.length>0&&<dl className="tp-notes-grid">{notes.map(note=><div key={note.key} data-creator-input={`memory.${note.key}`} data-personalization-key={note.key}><dt>{note.question}</dt><dd>{note.answer}</dd></div>)}</dl>}
      {answers.some(m=>native.has(m.key))&&<details className="tp-reading-copy"><summary>Read every note at your own pace</summary><dl className="tp-notes-grid">{answers.filter(m=>native.has(m.key)).map(note=><div key={note.key} data-personalization-key={note.key}><dt>{note.question}</dt><dd>{note.answer}</dd></div>)}</dl></details>}
    </section>
    <InterestChapter ctx={ctx} />
    <CustomMemoryChapter ctx={ctx} />
    <HighPhotoChapter ctx={ctx} />
  </aside>;
}
