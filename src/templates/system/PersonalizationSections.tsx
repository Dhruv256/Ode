"use client";

import type { RenderCtx } from "./types";
import { Photo } from "./photo";
import { highPhotoArchive, resolvePhotoMode, validatePhotoUsage } from "@/lib/birthdayCapabilities";

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
      <h2>The things that light up<br /><em>{ctx.name}&apos;s world.</em></h2>
      <div className="tp-interest-index">{ctx.interests.map((interest) => <span key={interest}>{interest}</span>)}</div>
    </div>
    <div className="tp-interest-cards">
      {ctx.interests.slice(0, 4).map((interest, index) => { const language = interestLanguage(interest); return <article key={interest} data-interest={interest.replace(/[^a-z0-9]+/g, "-")}>
        <b aria-hidden>{language.mark}</b>
        <p>{String(index + 1).padStart(2, "0")} · {language.eyebrow}</p>
        <h3>{language.line}</h3>
      </article>; })}
    </div>
  </section>;
}

function CustomMemoryChapter({ ctx }: { ctx: RenderCtx }) {
  const memories = (ctx.project.customMemories ?? []).filter((memory) => memory.label.trim() || memory.value.trim()).slice(0, 10);
  if (!memories.length) return null;
  return <section className="tp-custom-memories" data-experience-chapter aria-label="Personal memories and inside jokes">
    <header><p>THE DETAILS ONLY WE KNOW</p><h2>Notes from<br /><em>the margins.</em></h2></header>
    <div>{memories.map((memory, index) => <article key={memory.id} data-prominence={memory.prominence}>
      <span>{memory.icon || String(index + 1).padStart(2, "0")}</span>
      <p>{memory.label || "A tiny detail"}</p>
      <blockquote>{memory.value || "A memory waiting to be written."}</blockquote>
    </article>)}</div>
  </section>;
}

function HighPhotoChapter({ ctx }: { ctx: RenderCtx }) {
  if (resolvePhotoMode(ctx.project) !== "high-photo") return null;
  const photos = highPhotoArchive(ctx.photos);
  const usage = validatePhotoUsage(ctx.photos, photos.map((photo) => photo.id));
  return <section className="tp-high-photo" data-experience-chapter data-photo-usage-valid={usage.valid} aria-label={`Complete archive of ${photos.length} photos`}>
    <header><p>THE COMPLETE ARCHIVE · {usage.renderedCount}/{usage.uploadedCount} ASSIGNED</p><h2>Not one memory<br /><em>left behind.</em></h2></header>
    <div className="tp-high-photo-grid">{photos.map((photo, index) => <div key={photo.id} data-photo-slot={index + 1}>
      <Photo photo={photo} treatment={ctx.treatment} aspect="aspect-[4/5] w-full" footprint="unbounded" captionFallback={`memory ${index + 1}`} />
      <small>{String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</small>
    </div>)}</div>
  </section>;
}

export function PersonalizationSections({ ctx }: { ctx: RenderCtx }) {
  const hasExtra = ctx.interests.length || (ctx.project.customMemories?.length ?? 0) || resolvePhotoMode(ctx.project) === "high-photo";
  if (!hasExtra) return null;
  return <aside className="tp-personalization" data-template-voice={ctx.id}>
    <InterestChapter ctx={ctx} />
    <CustomMemoryChapter ctx={ctx} />
    <HighPhotoChapter ctx={ctx} />
    <footer><span>ODE / MADE PARTICULARLY</span><p>{ctx.memories.ending || `Still becoming, still entirely ${ctx.name}.`}</p></footer>
  </aside>;
}
