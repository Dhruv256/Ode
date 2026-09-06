"use client";

import React, { useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import type { BirthdayProject, TemplateId } from "@/lib/types";
import { resolveProjectColors } from "@/lib/palettes";
import { milestoneOf, milestoneTitleFor } from "@/lib/milestones";
import { memoryAnswerOf } from "@/lib/questions";
import { TEMPLATE_STYLE } from "./system/fonts";
import { buildTheme, themeVars } from "./system/theme";
import { assignRoles } from "./system/roles";
import type { MemBundle, RenderCtx } from "./system/types";

/* ── template modules ── */
const ContactSheet = dynamic(() => import("./contact-sheet"));
const CutAndPaste = dynamic(() => import("./cut-and-paste"));
const CoverStar = dynamic(() => import("./cover-star"));
const InternetPerson = dynamic(() => import("./internet-person"));
const Archive = dynamic(() => import("./archive"));
const AfterDark = dynamic(() => import("./after-dark"));
const SundayMorning = dynamic(() => import("./sunday-morning"));
const Yearbook = dynamic(() => import("./yearbook"));

const Cinema = dynamic(() => import("./cinema"));
const PolaroidWall = dynamic(() => import("./polaroid-wall"));
const Dreamscape = dynamic(() => import("./dreamscape"));
const PosterCity = dynamic(() => import("./poster-city"));

import { cn } from "@/lib/utils";
import { SoundtrackControl } from "@/components/media/SoundtrackControl";
import { CountdownGate } from "./system/CountdownGate";
import { TemplateMotion, vibeDirection, MOTION_PROFILES } from "./system/motion";
import { TEMPLATE_FRAMES, FRAME_RATIOS } from "./system/frames";
import { InputUsageQa } from "./system/InputUsageQa";
import { chronologicalPhotos } from "@/lib/photoIntelligence";
import { useMobileComposition, usePerformanceTier, type PerformanceTier } from "./system/responsive";

const REGISTRY: Record<TemplateId, React.ComponentType<{ ctx: RenderCtx }>> = {
  "contact-sheet": ContactSheet,
  "cut-and-paste": CutAndPaste,
  "cover-star": CoverStar,
  cinema: Cinema,
  "internet-person": InternetPerson,
  archive: Archive,
  "after-dark": AfterDark,
  "sunday-morning": SundayMorning,
  "polaroid-wall": PolaroidWall,
  dreamscape: Dreamscape,
  "poster-city": PosterCity,
  yearbook: Yearbook,
};

export function buildMemories(project: BirthdayProject): MemBundle {
  const m = (key: Parameters<typeof memoryAnswerOf>[1]) => memoryAnswerOf(project.memories, key);
  return {
    oneSentence: m("one-sentence"),
    threeWords: m("three-words"),
    thingsTheyLove: m("things-they-love"),
    place: m("favorite-place"),
    song: m("favorite-song"),
    movie: m("favorite-movie"),
    insideJoke: m("inside-joke"),
    alwaysSays: m("always-says"),
    obsession: m("current-obsession"),
    knownFor: m("known-for"),
    memory: m("unforgettable-memory"),
    message: m("birthday-message"),
    ending: m("ending-line"),
  };
}

function firstName(project: BirthdayProject): string {
  const raw = project.person.nickname || project.person.fullName;
  const first = (raw || "You").split(" ")[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

const DENSE_TEMPLATES: TemplateId[] = ["contact-sheet", "archive"];

export function buildCtx(
  project: BirthdayProject,
  id: TemplateId,
  device: "desktop" | "mobile",
  edit: boolean,
  onEdit?: (key: string, value: string) => void,
  performanceTier: PerformanceTier = "medium",
): RenderCtx {
  const colors = resolveProjectColors(project.paletteId, project.customPalette) ?? ["#F4F0E7", "#1B1815", "#B4502A", "#6E56CF", "#5A6B4D"];
  const theme = buildTheme(colors);
  const style = TEMPLATE_STYLE[id];
  const ordered = [...project.photos].sort((a, b) => a.order - b.order);
  const photos = ["archive","cinema","yearbook"].includes(id) ? chronologicalPhotos(ordered) : ordered;
  const dense = DENSE_TEMPLATES.includes(id);
  const roles = assignRoles(photos, { dense, strips: true });

  return {
    id,
    project,
    colors,
    theme,
    treatment: style.treatment,
    fonts: style.fonts,
    name: firstName(project),
    fullName: project.person.fullName || "Our person",
    age: project.age,
    milestone: milestoneOf(project.age),
    title: milestoneTitleFor(project.age, id) ?? `${project.age ?? "A"} — a celebration`,
    photos,
    hero: roles.find(r=>r.role==="hero")?.photo ?? photos[0],
    finalePhoto: roles.find((r) => r.role === "finale")?.photo ?? photos[photos.length - 1],
    roles,
    interests: project.interests.map((i) => i.label.toLowerCase()),
    memories: buildMemories(project),
    edit,
    device,
    performanceTier,
    onEdit,
  };
}

/**
 * Renders the full generated experience for a project + template + device.
 * Also exposes the theme as CSS custom properties so templates can consume
 * palette tokens via var(--tp-*).
 */
export function TemplateView({
  project,
  templateId,
  device = "desktop",
  edit = false,
  onEdit,
  className,
}: {
  project: BirthdayProject;
  templateId: TemplateId;
  device?: "desktop" | "mobile" | "auto";
  edit?: boolean;
  onEdit?: (key: string, value: string) => void;
  className?: string;
}) {
  const viewportIsMobile = useMobileComposition();
  const root = useRef<HTMLDivElement>(null);
  const performanceTier = usePerformanceTier();
  const resolvedDevice = device === "auto" ? (viewportIsMobile ? "mobile" : "desktop") : device;
  const ctx = useMemo(
    () => buildCtx(project, templateId, resolvedDevice, edit, onEdit, performanceTier),
    [project, templateId, resolvedDevice, edit, onEdit, performanceTier]
  );
  const Body = REGISTRY[templateId];
  const vars = useMemo(() => themeVars(ctx.theme), [ctx.theme]);
  const direction = vibeDirection(project.vibes.vibes);

  if (!Body) {
    return <div className="p-10 font-mono text-sm">This visual system is unavailable.</div>;
  }

  return (
    <TemplateMotion id={templateId} vibes={project.vibes.vibes}><div
      ref={root}
      className={cn("birthday-template relative", className)}
      data-template={templateId}
      data-composition={resolvedDevice}
      data-performance-tier={performanceTier}
      data-vibes={project.vibes.vibes.join(" ")}
      data-motion-profile={MOTION_PROFILES[templateId].name}
      style={{ ...vars, "--tp-display": ctx.fonts.display, "--tp-mono":ctx.fonts.mono, "--tp-density":direction.density, "--tp-repeat-ratio":FRAME_RATIOS[TEMPLATE_FRAMES[templateId].repeated], background: ctx.theme.bg, color: ctx.theme.text, fontFamily: ctx.fonts.body } as React.CSSProperties}
    >
      {onEdit ? <><SoundtrackControl soundtrack={project.soundtrack} templateId={templateId} preview /><Body ctx={ctx} /></> : <CountdownGate ctx={ctx}><SoundtrackControl soundtrack={project.soundtrack} templateId={templateId} /><Body ctx={ctx} /></CountdownGate>}
      {process.env.NODE_ENV !== "production" && <InputUsageQa project={project} templateId={templateId} root={root}/>}
    </div></TemplateMotion>
  );
}
