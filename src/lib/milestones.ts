import type {
  BirthdayMilestone,
  MilestoneDefinition,
  MilestoneTitleMap,
  TemplateId,
} from "./types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MILESTONE SYSTEM — central configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * All milestone logic lives here. Components never hardcode "if age === 25".
 * Each milestone defines its own language, modules, and treatment style,
 * and adapts its headline per template via MILESTONE_TEMPLATE_TITLES.
 */

export const MILESTONES: Record<BirthdayMilestone, MilestoneDefinition> = {
  16: {
    age: 16,
    numeral: "XVI",
    label: "SIXTEEN",
    tagline: "Sixteen frames of you.",
    treatmentStyle: "scrapbook-stamp",
    modules: [
      { id: "sixteen-frames", title: "16 Frames", note: "A contact strip of sixteen moments." },
    ],
  },
  18: {
    age: 18,
    numeral: "XVIII",
    label: "CHAPTER 18",
    tagline: "The first page of adulthood.",
    treatmentStyle: "archival-chapter",
    modules: [
      { id: "eighteen-things", title: "18 Things We Love About You" },
    ],
  },
  21: {
    age: 21,
    numeral: "XXI",
    label: "TWENTY ONE",
    tagline: "Twenty one memories and counting.",
    treatmentStyle: "typographic-poster",
    modules: [
      { id: "twentyone-memories", title: "21 Memories", note: "No assumptions. Just stories." },
      { id: "twentyone-wishes", title: "21 Wishes" },
    ],
  },
  22: {
    age: 22,
    numeral: "XXII",
    label: "CHAPTER XXII",
    tagline: "Repetition becomes rhythm.",
    treatmentStyle: "repetition-motif",
    modules: [
      { id: "22-22", title: "22 / 22" },
      { id: "22-tiny-things", title: "22 Tiny Things That Make You, You" },
    ],
  },
  25: {
    age: 25,
    numeral: "XXV",
    label: "QUARTER CENTURY",
    tagline: "Twenty five years in the making.",
    treatmentStyle: "editorial-cover",
    modules: [
      { id: "first-25", title: "The First 25" },
      { id: "quarter-century-of", title: "¼ Century Of You" },
    ],
  },
  50: {
    age: 50,
    numeral: "L",
    label: "FIVE DECADES",
    tagline: "Fifty years of stories.",
    treatmentStyle: "cinematic-title-card",
    modules: [
      { id: "five-decades", title: "Five Decades", note: "One decade at a time." },
      { id: "fifty-stories", title: "50 Years of Stories" },
    ],
  },
  100: {
    age: 100,
    numeral: "C",
    label: "A CENTURY",
    tagline: "A hundred years, held carefully.",
    treatmentStyle: "archival-chapter",
    modules: [
      { id: "century", title: "100 Years" },
      { id: "generations", title: "Generations" },
      { id: "life-in-chapters", title: "A Life in Chapters" },
      { id: "messages", title: "Messages" },
      { id: "family-archive", title: "Family Archive" },
    ],
  },
};

/**
 * Milestone headline language PER TEMPLATE.
 * The same birthday speaks differently through each visual system —
 * this is the contract that keeps milestones template-dependent.
 */
export const MILESTONE_TEMPLATE_TITLES: Record<
  BirthdayMilestone,
  MilestoneTitleMap
> = {
  16: {
    "contact-sheet": "FRAME 016",
    "polaroid-wall": "SIXTEEN SHOTS",
    yearbook: "CLASS OF 16",
    cinema: "SIXTEEN CUTS",
  },
  18: {
    archive: "FILE Nº 18",
    yearbook: "CHAPTER EIGHTEEN",
    "sunday-morning": "EIGHTEEN SUNDAYS",
  },
  21: {
    cinema: "TWENTY ONE TAKES",
    "poster-city": "21 UP",
    dreamscape: "TWENTY ONE DREAMS",
  },
  22: {
    "internet-person": "V.22",
    "cut-and-paste": "22 × 22",
    "contact-sheet": "ROLL 22",
  },
  25: {
    "cover-star": "ISSUE 025",
    cinema: "25 YEARS IN THE MAKING",
    "internet-person": "VERSION 25.0",
    archive: "QUARTER CENTURY ARCHIVE",
    "poster-city": "25 / POSTER NO. 1",
    dreamscape: "TWENTY FIVE SUNSETS",
    "after-dark": "25 AFTER DARK",
    yearbook: "MOST LIKELY TO — AT 25",
  },
  50: {
    cinema: "FIVE DECADES: A FEATURE",
    "cover-star": "THE 50TH EDITION",
    archive: "HALF-CENTURY COLLECTION",
    "sunday-morning": "FIFTY GOOD MORNINGS",
  },
  100: {
    archive: "THE CENTURY ARCHIVE",
    cinema: "A LIFE IN ONE HUNDRED SCENES",
    "cover-star": "CENTENNIAL EDITION",
    yearbook: "100 YEARS — CLASS FOREVER",
  },
};

/** Fallback headline when a milestone + template pair has no bespoke title. */
const FALLBACK_TITLES: Record<BirthdayMilestone, string> = {
  16: "SIXTEEN",
  18: "CHAPTER 18",
  21: "TWENTY ONE",
  22: "CHAPTER XXII",
  25: "QUARTER CENTURY",
  50: "FIFTY YEARS",
  100: "A CENTURY",
};

export function isMilestone(age: number | null): age is BirthdayMilestone {
  return age !== null && (MILESTONE_AGES_SAFE as readonly number[]).includes(age);
}

const MILESTONE_AGES_SAFE = Object.keys(MILESTONES).map(Number);

export function milestoneOf(
  age: number | null
): MilestoneDefinition | undefined {
  return isMilestone(age) ? MILESTONES[age] : undefined;
}

/**
 * Resolve the milestone headline for a given template.
 * Always template-aware; never falls back to a generic standalone string
 * without acknowledging the template's own voice.
 */
export function milestoneTitleFor(
  age: number | null,
  templateId?: TemplateId
): string | undefined {
  const milestone = milestoneOf(age);
  if (!milestone || !templateId) return undefined;
  return (
    MILESTONE_TEMPLATE_TITLES[milestone.age][templateId] ??
    templateMilestoneFallback(milestone, templateId)
  );
}

function templateMilestoneFallback(milestone: MilestoneDefinition, templateId: TemplateId): string {
  const age = milestone.age;
  const titles: Record<TemplateId, string> = {
    "contact-sheet": `ROLL ${String(age).padStart(3, "0")}`,
    "cut-and-paste": `${age} PIECES OF EVIDENCE`,
    "cover-star": `ISSUE ${String(age).padStart(3, "0")}`,
    cinema: `${age} YEARS IN THE MAKING`,
    "internet-person": `VERSION ${age}.0`,
    archive: `${age}-YEAR COLLECTION`,
    "after-dark": `${age} AFTER DARK`,
    "sunday-morning": `${age} MORNINGS AROUND THE SUN`,
    "polaroid-wall": `${age} FRAMES`,
    dreamscape: `CHAPTER ${milestone.numeral}`,
    "poster-city": `${age} / THE CITY EDITION`,
    yearbook: `CLASS OF ${age}`,
  };
  return titles[templateId] ?? FALLBACK_TITLES[age];
}
