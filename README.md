# Birthday World — an interactive birthday website generator

A curated, art-directed generator. The person's photos, personality and memories
carry the whole site — not a navbar/hero/cards/features template.

> The creator flow and all twelve generated template renderers are already in
> this repository. Supabase persistence is enabled through the server publish
> route; media storage/auth are configured separately as described below.

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript (strict)
- Tailwind CSS 3 (design tokens in `tailwind.config.ts`)
- Framer Motion for entrance/ambient motion (respects `prefers-reduced-motion`)
- No state library — a typed `useReducer` store in `src/state/` keeps a local
  draft cache. Published projects are read server-side from Supabase through
  `src/lib/publishedProjects.ts`.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Supabase + Vercel setup

1. Create a Supabase project and copy the pooled PostgreSQL URL from **Connect →
   Session pooler**. Put it in a local `.env.local` as `DATABASE_URL` and add
   the same variable in Vercel for Development, Preview, and Production. Keep
   passwords URL-encoded and never commit `.env.local`. Do not use the Storage
   project URL here: `DATABASE_URL` must start with `postgresql://` and comes
   from the Supabase **Connect** panel.
   On Windows, [`Configure Supabase Database.cmd`](Configure%20Supabase%20Database.cmd)
   prompts for a newly rotated password, encodes it, and copies the complete
   Session Pooler URI for Vercel.
2. Run [`database/migrations/001_published_birthday_projects.sql`](database/migrations/001_published_birthday_projects.sql)
   in the Supabase SQL editor. The app uses `postgres` with SSL and a small
   connection pool, which is appropriate for Vercel functions.
3. Deploy with the native Next.js preset. The dynamic `/<slug>` route reads only
   rows whose status is `published` and visibility is not `private`; it is not
   statically generated.

The current UI initially stores selected photos as browser object URLs. On
publish, the browser now requests a server-signed upload URL and sends the file
directly to Supabase Storage, then saves the permanent media URL with the world.
Run [`database/migrations/002_birthday_media_storage.sql`](database/migrations/002_birthday_media_storage.sql)
in the Supabase SQL editor, then add `NEXT_PUBLIC_SUPABASE_URL` plus a server-only
`SUPABASE_SECRET_KEY` in Vercel. Older projects may use the supported legacy name
`SUPABASE_SERVICE_ROLE_KEY`. The `birthday-media` bucket is public so recipients
can load permanent images; its upload URLs are signed by the server and the
secret must never use a `NEXT_PUBLIC_` prefix.

The SQL migration is intentionally reproducible. Once creator authentication
and Storage credentials are available, add `owner_id`/RLS policies and
`project_photos` storage metadata rows in a follow-up migration; the current
write-token guard protects slug updates in this unauthenticated prototype.

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
