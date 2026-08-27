# Birthday World — an interactive birthday website generator

A curated, art-directed generator. The person's photos, personality and memories
carry the whole site — not a navbar/hero/cards/features template.

> **Phase 1 (this repo)** is the creator foundation. Full generated template
> renders are intentionally staged for Phase 2.

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript (strict)
- Tailwind CSS 3 (design tokens in `tailwind.config.ts`)
- Framer Motion for entrance/ambient motion (respects `prefers-reduced-motion`)
- No state library — a typed `useReducer` store in `src/state/` autosaves to
  localStorage. GSAP / ScrollTrigger / R3F slots are reserved via `MotionProfile`.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Product flow

`01 PERSON → 02 WORLD → 03 STYLE → 04 AGE → 05 COLOR → 06 PHOTOS → 07 WORDS → 08 PREVIEW`

The generator opens directly on **"Who are we celebrating?"** (gender-first,
non-stereotypical editorial art direction). Every prior step is reachable from the
Preview shell, and the project autosaves continuously.

## Architecture map

```
src/
  app/                  layout (fonts), root page, globals.css (paper/ink tokens, grain)
  lib/
    types.ts            extensible BirthdayProject schema — the single source of truth
    vibes.ts            12 personality vibes (+ custom describe-them-yourself)
    templates.ts        12-slot TEMPLATE registry (ids, type/motion profiles, features,
                        photo counts, milestone treatment, suggested palettes)
    milestones.ts       central MILESTONES config + PER-TEMPLATE titles
                        (e.g. 25 + cover-star → "ISSUE 025")
    palettes.ts         18 curated directions (+ custom engine), full color systems
    interests.ts        chips + motif hints (subtle, never a costume)
    questions.ts        Step 07 memory questions (all optional, all skippable)
    utils.ts            cn(), uid(), hex helpers
  state/projectStore.tsx reducer + Context + localStorage autosave
  components/
    ui/Editorial.tsx    StepHeading, ActionButton, TextField, Chip, SkipButton
    creator/CreatorApp.tsx  step orchestrator + top bar
    creator/TemplatePreview.tsx 12 distinct CSS-only selector compositions
    creator/steps/      gender · person · world · style · age · color · photos · words · preview
```

## Extending in Prompt 2 (the point of the design)

- **Templates**: add a renderer module per id in `src/templates/<id>/` and resolve it
  through a registry (mirroring `lib/templates.ts`). No giant conditional.
- **Milestones**: already adapt per template via `milestoneTitleFor(age, templateId)`.
- **Motion**: `MotionProfile` is declarative; swap CSS/Framer for GSAP timelines or
  R3F cameras by mapping the same profile object — project state never changes.
- **Photo analysis**: `PhotoAsset.analysis` stays `undefined` until a real pass fills it.
  Nothing is fabricated.
- **Publishing / guest messages**: `PublishingSettings` + `GuestMessage` are already
  in the schema.

## Anti-AI-slope rules upheld

No rounded-card soup · no glassmorphism · no purple gradients · no feature-card grids ·
no testimonials · no "Stripe with balloons". Paper ground, ink type, hairline rules,
asymmetric editorial composition, `prefers-reduced-motion` everywhere.