"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import {
  createEmptyProject,
  type BirthdayProject,
  type CreatorStepId,
  type CustomMemoryBlock,
  type Gender,
  type Interest,
  type Memory,
  type MemoryKey,
  type PhotoMode,
  type Relationship,
  type PublishingSettings,
  type SoundtrackAsset,
  type TemplateId,
} from "@/lib/types";
import { uid } from "@/lib/utils";
import { activeLocalWebsite, localWebsites, saveLocalWebsite } from "@/lib/localWebsites";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PROJECT STORE — single source of truth for the creator session.
 * ─────────────────────────────────────────────────────────────────────────────
 * · Reducer-based, so every mutation is explicit and testable.
 * · Autosaves the serializable project to localStorage (debounced).
 * · Photo Files cannot be serialized: on restore, blob URLs are flagged
 *   `needsRelink` instead of pretending they still work.
 */


export const CREATOR_STEPS: CreatorStepId[] = [
  "gender",
  "person",
  "world",
  "style",
  "age",
  "color",
  "photos",
  "words",
  "preview",
];

/* ── Actions ─────────────────────────────────────────────────────────────── */

type ProjectAction =
  | { type: "hydrate"; project: BirthdayProject }
  | { type: "setGender"; gender: Gender }
  | {
      type: "patchPerson";
      patch: Partial<{
        fullName: string;
        nickname: string;
        pronouns: string;
        relationship: Relationship;
      }>;
    }
  | { type: "toggleVibe"; vibeId: string }
  | { type: "setCustomVibe"; text: string }
  | { type: "setTemplate"; templateId: TemplateId | undefined }
  | { type: "setAge"; age: number | null; birthdayDate?: string }
  | { type: "setPalette"; paletteId: string }
  | { type: "setCustomPaletteColors"; colors: string[] }
  | { type: "addPhotos"; photos: BirthdayProject["photos"] }
  | { type: "setPhotoMode"; mode: PhotoMode }
  | {
      type: "patchPhoto";
      photoId: string;
      patch: Partial<BirthdayProject["photos"][number]>;
    }
  | { type: "removePhoto"; photoId: string }
  | { type: "movePhoto"; photoId: string; direction: -1 | 1 }
  | { type: "reorderPhotos"; orderedIds: string[] }
  | { type: "setHeroPhoto"; photoId: string }
  | { type: "markPhotosStale" }
  | { type: "setMemoryAnswer"; key: MemoryKey; answer: string; skipped?: boolean }
  | { type: "skipMemory"; key: MemoryKey }
  | { type: "addCustomMemory"; memory: CustomMemoryBlock }
  | { type: "patchCustomMemory"; memoryId: string; patch: Partial<CustomMemoryBlock> }
  | { type: "removeCustomMemory"; memoryId: string }
  | { type: "toggleInterest"; label: string }
  | { type: "addCustomInterest"; label: string }
  | { type: "removeInterest"; interestId: string }
  | { type: "patchPublishing"; patch: Partial<PublishingSettings> }
  | { type: "setSoundtrack"; soundtrack?: SoundtrackAsset }
  | { type: "gotoStep"; step: CreatorStepId };

const STEP_INDEX = new Map(CREATOR_STEPS.map((s, i) => [s, i]));

function touch(state: BirthdayProject): BirthdayProject {
  return { ...state, updatedAt: new Date().toISOString() };
}

function advanceFurthest(state: BirthdayProject, step: CreatorStepId) {
  const current = STEP_INDEX.get(state.furthestStep) ?? 0;
  const next = STEP_INDEX.get(step) ?? 0;
  return next > current ? step : state.furthestStep;
}

const MILESTONE_AGE_SET = new Set([16, 18, 21, 22, 25, 50, 100]);

function reducer(state: BirthdayProject, action: ProjectAction): BirthdayProject {
  switch (action.type) {
    case "hydrate":
      return action.project;

    case "setGender":
      return touch({
        ...state,
        person: { ...state.person, gender: action.gender },
        furthestStep: advanceFurthest(state, "person"),
      });

    case "patchPerson":
      return touch({ ...state, person: { ...state.person, ...action.patch } });

    case "toggleVibe": {
      const has = state.vibes.vibes.includes(action.vibeId as never);
      const vibes = has
        ? state.vibes.vibes.filter((v) => v !== action.vibeId)
        : state.vibes.vibes.length >= 3
          ? state.vibes.vibes // max 3 — ignore extra selections
          : [...state.vibes.vibes, action.vibeId as never];
      return touch({ ...state, vibes: { ...state.vibes, vibes } });
    }

    case "setCustomVibe":
      return touch({
        ...state,
        vibes: { ...state.vibes, customVibe: action.text },
      });

    case "setTemplate":
      return touch({ ...state, templateId: action.templateId });

    case "setAge": {
      const milestone = MILESTONE_AGE_SET.has(action.age ?? NaN)
        ? (action.age as never)
        : undefined;
      return touch({
        ...state,
        age: action.age,
        birthdayDate: action.birthdayDate ?? state.birthdayDate,
        milestone,
      });
    }

    case "setPalette":
      return touch({ ...state, paletteId: action.paletteId });

    case "setCustomPaletteColors":
      return touch({ ...state, customPalette: action.colors });

    case "addPhotos":
      return touch({
        ...state,
        photos: [...state.photos, ...action.photos],
      });

    case "setPhotoMode":
      return touch({ ...state, photoMode: action.mode });

    case "patchPhoto":
      return touch({
        ...state,
        photos: state.photos.map((p) =>
          p.id === action.photoId ? { ...p, ...action.patch } : p
        ),
      });

    case "removePhoto":
      return touch({
        ...state,
        photos: state.photos
          .filter((p) => p.id !== action.photoId)
          .map((p, i) => ({ ...p, order: i })),
      });

    case "movePhoto": {
      const photos = [...state.photos];
      const from = photos.findIndex((p) => p.id === action.photoId);
      if (from === -1) return state;
      const to = from + action.direction;
      if (to < 0 || to >= photos.length) return state;
      const [moved] = photos.splice(from, 1);
      photos.splice(to, 0, moved);
      return touch({
        ...state,
        photos: photos.map((p, i) => ({ ...p, order: i })),
      });
    }

    case "reorderPhotos": {
      const byId = new Map(state.photos.map((p) => [p.id, p]));
      const photos = action.orderedIds
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map(
          (p, i) =>
            ({ ...(p as BirthdayProject["photos"][number]), order: i }) as BirthdayProject["photos"][number]
        );
      return touch({ ...state, photos });
    }

    case "setHeroPhoto":
      return touch({
        ...state,
        photos: state.photos.map((p) => ({
          ...p,
          isHero: p.id === action.photoId,
          heroEligible: true,
        })),
      });

    case "markPhotosStale":
      return {
        ...state,
        photos: state.photos.map((p) =>
          p.previewUrl.startsWith("blob:") ? { ...p, needsRelink: true } : p
        ),
      };

    case "setMemoryAnswer": {
      const memories: Memory[] = [
        ...state.memories.filter((m) => m.key !== action.key),
        {
          id: uid(),
          key: action.key,
          answer: action.answer,
          skipped: action.skipped ?? false,
        },
      ];
      return touch({ ...state, memories });
    }

    case "skipMemory": {
      const memories: Memory[] = [
        ...state.memories.filter((m) => m.key !== action.key),
        { id: uid(), key: action.key, answer: "", skipped: true },
      ];
      return touch({ ...state, memories });
    }

    case "addCustomMemory":
      if ((state.customMemories?.length ?? 0) >= 10) return state;
      return touch({ ...state, customMemories: [...(state.customMemories ?? []), action.memory] });

    case "patchCustomMemory":
      return touch({
        ...state,
        customMemories: (state.customMemories ?? []).map((memory) =>
          memory.id === action.memoryId ? { ...memory, ...action.patch } : memory
        ),
      });

    case "removeCustomMemory":
      return touch({
        ...state,
        customMemories: (state.customMemories ?? []).filter((memory) => memory.id !== action.memoryId),
      });

    case "toggleInterest": {
      const existing = state.interests.find(
        (i) => i.label.toLowerCase() === action.label.toLowerCase()
      );
      const interests: Interest[] = existing
        ? state.interests.filter((i) => i.id !== existing.id)
        : [...state.interests, { id: uid(), label: action.label, custom: false }];
      return touch({ ...state, interests });
    }

    case "addCustomInterest": {
      const label = action.label.trim();
      if (!label) return state;
      if (state.interests.some((i) => i.label.toLowerCase() === label.toLowerCase()))
        return state;
      return touch({
        ...state,
        interests: [...state.interests, { id: uid(), label, custom: true }],
      });
    }

    case "removeInterest":
      return touch({
        ...state,
        interests: state.interests.filter((i) => i.id !== action.interestId),
      });

    case "patchPublishing":
      return touch({ ...state, publishing: { ...state.publishing, ...action.patch } });

    case "setSoundtrack":
      return touch({ ...state, soundtrack: action.soundtrack });

    case "gotoStep":
      return touch({ ...state, furthestStep: advanceFurthest(state, action.step) });

    default:
      return state;
  }
}

/* ── Persistence ─────────────────────────────────────────────────────────── */

function loadProject(owner: string): BirthdayProject | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = activeLocalWebsite(owner);
    // Guard against schema drift between versions.
    if (!parsed || typeof parsed !== "object" || !parsed.id) return null;
    const empty = createEmptyProject();
    return {
      ...empty,
      ...parsed,
      photos: Array.isArray(parsed.photos) ? parsed.photos : [],
      photoMode: ["auto", "standard", "high-photo"].includes(parsed.photoMode ?? "auto") ? (parsed.photoMode ?? "auto") : "auto",
      interests: Array.isArray(parsed.interests) ? parsed.interests : [],
      memories: Array.isArray(parsed.memories) ? parsed.memories : [],
      customMemories: Array.isArray(parsed.customMemories) ? parsed.customMemories.slice(0, 10) : [],
      guestMessages: Array.isArray(parsed.guestMessages) ? parsed.guestMessages : [],
      vibes: parsed.vibes && Array.isArray(parsed.vibes.vibes) ? parsed.vibes : empty.vibes,
      publishing: { ...empty.publishing, ...(parsed.publishing ?? {}) },
    };
  } catch {
    return null;
  }
}

/* ── Context ─────────────────────────────────────────────────────────────── */

interface ProjectContextValue {
  project: BirthdayProject;
  hydrated: boolean;
  dispatch: React.Dispatch<ProjectAction>;
  /** Navigate to a step (records progress). */
  goToStep: (step: CreatorStepId) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children, projectId, fresh = false, ownerKey = "device" }: { children: React.ReactNode; projectId?: string; fresh?: boolean; ownerKey?: string }) {
  const [project, dispatch] = useReducer(
    reducer,
    undefined,
    createEmptyProject
  );
  const [hydrated, setHydrated] = React.useState(false);
  const [syncError, setSyncError] = React.useState("");

  // Restore once on mount, flagging dead blob URLs honestly.
  useEffect(() => {
    let cancelled = false;
    async function restore() {
      try {
        const legacy = loadProject(ownerKey);
        let stored = fresh ? null : legacy;
        if (projectId) {
          const cached = localWebsites(ownerKey)[projectId];
          const response = await fetch(`/api/websites/${encodeURIComponent(projectId)}`);
          const result = await response.json();
          if (!response.ok && !cached) throw new Error(result.error || "This website could not be opened.");
          stored = cached && (!result.project || cached.updatedAt > result.project.updatedAt) ? cached : result.project;
        }
        if (!cancelled) {
          if (stored) dispatch({ type: "hydrate", project: { ...stored, photos: stored.photos.map(p => ({ ...p, needsRelink: p.previewUrl.startsWith("blob:") || p.needsRelink })) } });
          setHydrated(true);
        }
      } catch (error) { if (!cancelled) setSyncError(error instanceof Error ? error.message : "Unable to restore your website."); }
    }
    void restore();
    return () => { cancelled = true; };
  }, [projectId, fresh, ownerKey]);

  // Debounced autosave.
  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      try {
        saveLocalWebsite(ownerKey, project);
      } catch {
        /* storage full or unavailable — session continues in memory */
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [project, hydrated, ownerKey]);

  useEffect(() => {
    if (!hydrated || project.publishing.status !== "draft") return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/websites", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ project, token: project.publishing.publishToken }), signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setSyncError("");
      } catch (error) { if (!controller.signal.aborted) setSyncError(error instanceof Error ? error.message : "Cloud save unavailable; your draft is saved on this device."); }
    }, 1000);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [project, hydrated]);

  const goToStep = useCallback((step: CreatorStepId) => {
    dispatch({ type: "gotoStep", step });
  }, []);

  const value = useMemo(
    () => ({ project, hydrated, dispatch, goToStep }),
    [project, hydrated, goToStep]
  );

  return (
    <ProjectContext.Provider value={value}>
      {syncError && <p role="status" className="border-b border-line bg-paper px-5 py-3 text-sm">{syncError} {hydrated ? "Your draft is kept on this device." : <a href="/dashboard">Return to dashboard</a>}</p>}
      {hydrated ? children : <p className="p-8">Opening your website…</p>}
    </ProjectContext.Provider>
  );
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used inside <ProjectProvider>");
  return ctx;
}

