# Digital hampers and the Ode studio

The production application remains the Next.js 14 / React 18 app at the repository root. `clerk-nextjs/` is an independent starter and has not been modified. The twelve birthday renderers and public `/<slug>` route remain in place.

## Implemented

- `/dashboard`: two creation actions and recent websites/hampers.
- `/dashboard/websites`: account projects plus account-scoped local drafts; edit, preview, share, copy, duplicate, confirmed deletion, and token-verified recovery of old websites.
- `/create?new=1`: a separate birthday project; `/create?project=<id>`: reopen that project; `&preview=1`: the existing birthday preview.
- `/dashboard/hamper`, `/dashboard/hamper/new`, `/dashboard/hamper/[id]/edit`: hamper list and seven-stage builder.
- `/hamper/[slug]`: public, unlisted recipient experience; no account required.
- Four centrally configured themes, all ten item types, touch/keyboard arrangement, desktop/mobile preview, exactly three deliberate package activations, Burst and Scene, reduced motion, native modal focus management, and lazy media/embeds.
- Private uploads, quotas, signed asset delivery, PINs, link creation/revocation/replacement, independent duplication, confirmed deletion and durable storage cleanup.
- Dedupe-limited views, openings, item activity and outbound link analytics. Preview does not emit recipient events.
- Item editor confirmation saves immediately to the server. A failed save keeps the editor and entered content available for retry; other builder fields retain the explicit Save / Save & continue controls.

## Apply the migrations before deploying the application

Use the existing SQL migration workflow, in order:

1. `database/migrations/003_studio_ownership.sql`
2. `database/migrations/004_digital_hampers.sql`

Migrations 001 and 002 remain prerequisites on a new database. Migration 003 adds a canonical birthday project ID and optional Clerk owner ID; it does not delete records, change public slugs or replace JSON content. The existing schema has no one-project-per-owner constraint. Legacy records remain public at their original links and can be attached to an account only with their original write token. A creator without that token cannot claim an old site by guessing its slug.

Migration 004 creates `digital_hampers`, `hamper_items`, `hamper_assets`, `hamper_share_links`, `hamper_events`, `hamper_access_attempts`, and `hamper_storage_cleanup`; all use RLS with browser-role access revoked. The server uses the existing pooled PostgreSQL connection and derives owners from Clerk. No separate Supabase Auth identity is introduced.

The migration also creates **private** `ode-hamper-assets`, with a 5 MB bucket cap and allowed MIME types, and a restrictive policy shielding that bucket from broader browser storage policies. The existing public `birthday-media` bucket is unchanged. No manual table or bucket creation is necessary.

New code expects both migrations; apply them to each deployment database before application traffic reaches these routes. The connected database was repaired on 3 September 2026 using the command below, preserving its three existing birthday sites and installing the current hamper schema. Other deployment databases still need their own migration checks.

### Repair an earlier manually created hamper schema

`42703` on website listing indicates missing birthday ownership columns. `23502` on hamper creation can indicate the older `recipient_name` / `sender_name` schema, which is incompatible with the builder's empty draft creation and the current media, analytics, and access tables. Adding a default to one old column is insufficient.

The administrative repair command uses the same Next.js environment files as the app:

```text
npm run db:studio -- --check
npm run db:studio -- --apply
npm run db:studio -- --verify
```

It applies migration 003 and installs migration 004 where needed. When all five legacy hamper tables are empty, it retains them in the private `ode_legacy_hamper_v1` schema before creating the current tables. It locks and rechecks them before moving anything, refuses populated or mixed legacy schemas, preserves birthday content/slugs/write tokens/timestamps, and rolls back the whole repair if any step fails. A completed repair is safe to rerun. It never runs automatically from a web request.

`--verify` exercises website listing, draft creation, links, item saves, events, rate limits and upload reservations against the connected database inside a transaction that is always rolled back. It does not upload media or leave sample hampers behind. The repair implementation is in `scripts/repair-studio-schema.mjs` and `scripts/lib/studio-schema.mjs`; six regression tests in `tests/studioSchema.test.ts` cover the two reported failures, content preservation, refusal to move populated tables, retry behavior and rollback on a late failure.

The connected-database repair and rolled-back live verification both passed. All 71 unit/database tests, typecheck, lint and the production build pass after the repair changes. Server error logs now include only PostgreSQL error codes and schema identifiers (table/column/constraint), excluding private failing-row details.

On Windows, a running dev server can hold `.next/trace` open. Set `ODE_ISOLATED_BUILD=true` when running `npm run build` to verify production output in the ignored `.next-build` directory without stopping that server. Normal builds and development continue to use `.next`. Use the same environment flag with `npm start` only when intentionally serving that isolated output.

## Environment

Keep the existing `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`), and Clerk keys.

Add:

- `HAMPER_ACCESS_SECRET`: a cryptographically random server-only secret of at least 32 characters. Used for signed PIN access cookies and anonymous analytics identifiers. Rotating it invalidates existing access cookies.
- `CRON_SECRET`: a random server-only bearer secret used by Vercel Cron for cleanup.

Set `NEXT_PUBLIC_CLERK_ENABLED=true` for the authenticated cloud studio. With Clerk deliberately disabled, local birthday drafts can still be edited, but cloud writes fail closed; there is no shared development owner.

`vercel.json` schedules `/api/hamper-maintenance` once daily at 03:00 UTC. Configure `CRON_SECRET` in Vercel. Deleting a hamper queues its asset paths in the same database transaction. The scheduled route retries failed deletions and collects abandoned uploads. Young assets wait three hours before cleanup so a still-valid upload URL cannot recreate a deleted file. Normal saves/deletes also attempt due cleanup.

The local upload failure was traced to template values for the Supabase URL and service key. The URL was corrected to match the working database project, the user supplied the real server key, and missing local privacy/cron secrets were generated without logging their values. Restart the development server after changing `.env.local`. These local secrets are ignored by Git and must be configured separately in deployment environments; deploying is not required to test uploads locally.

The storage adapter now rejects placeholder configuration clearly and reads Supabase's actual `content_type` metadata field, while retaining support for older metadata shapes. Previously, a successfully uploaded photo could fail finalization because the MIME type was read as empty.

## Upload and privacy details

- Source photos: JPEG/PNG/WebP, maximum 5 MB; client compression to WebP and a maximum 1800-pixel edge when supported. Audio: maximum 2 MB. Videos are links only.
- Photos reserve the bucket's 5 MB maximum before the server issues a Supabase upload URL. Finalization reads actual object size/type from Supabase. Voice uploads pass through a bounded 2 MB server endpoint so a photo-sized signed upload cannot bypass the smaller audio cap. Reserved photo capacity counts toward both quotas. Near a quota boundary, a small photo can require freeing a little additional space until the reservation is finalized.
- Storage paths are generated server-side as `clerkUserId/hamperId/itemId/randomAssetId`. Client-provided paths and byte counters are never authoritative.
- Database constraints and transactional locks enforce 10 hampers, 30 items, per-type limits, 25 MB per hamper and 200 MB per account. Duplication copies logical media to separate paths.
- PINs use salted Node scrypt. Incorrect attempts are limited in PostgreSQL to five per hamper/client window of 15 minutes. Successful unlock grants a signed, HttpOnly, SameSite cookie. Changing/removing the PIN invalidates existing grants. PIN item data is withheld until authorization succeeds.
- Revoking a link prevents new page/API access immediately. Previously issued asset URLs can remain valid for up to 15 minutes, and recipients can keep content already downloaded.
- Public routes use explicit DTOs, no-index robots directives, no-store caching and a no-referrer policy. Embeds load only after the corresponding item opens. No arbitrary backend URL crawling, maps API, music upload or payment service is used.
- Analytics accepts only known events, validates item membership and active publication/PIN state, rate-limits writes, and dedupes per signed browser session / 30-minute window. Client IPs are HMACed for rate limiting, never included in creator reports. As with any unauthenticated analytics, counts are approximate.

## Verification

Commands:

```text
npm run typecheck
npm run lint
npm test
npm run qa:templates
npx playwright install chromium webkit
npm run test:browser
npm run build
```

Opt-in connected-service checks are available with `npm run test:hamper:live`. They use the local development environment, exercise the real repository for adding/reloading/editing/removing all ten item types inside a rolled-back database transaction, and test real private photo/voice uploads, metadata, signed downloads and copies. Only the freshly generated test paths are removed afterward. They do not run as part of `npm test`, and never invoke global background storage cleanup. Both live checks passed after fixing the upload configuration and metadata contract.

Saving/upload follow-up verification: 80 unit/database tests passed; both connected-service checks passed; seven targeted browser checks passed (the complete ten-item creator flow, failed-save retry, touch/drawing and recording), with the existing Windows WebKit synthetic-microphone skip. Typecheck, lint and the isolated production build passed. Photo and voice were tested against real private Supabase Storage, not only mocked transport responses.

The server suite runs the actual production migrations and SQL against an isolated PGlite PostgreSQL instance. It tests authorization, slug uniqueness, drafts/revocation, PIN verification and cookies, database quotas, actual upload-size verification, event membership/deduplication, stale edits, duplication/cascades, legacy ownership and multiple birthday records. Tests replace external Clerk/Storage transports with fixtures; no production writes occur.

The browser suite uses the same creator and recipient components with mocked persistence. Chromium exercises Burst/Scene at 320, 360, 375, 390, 412, 430, 768, 1366, 1440 and 1920-pixel widths, all ten items, preview/replay, publish, reduced motion, dialog focus and overflow. Additional installed Chrome/Edge and WebKit projects cover the four themes, touch drawing, touch reorder where CDP is available, voice playback, iframe sizing and logo navigation. WebKit on Windows is an engine-level check, not a physical iPhone/Safari hardware test.

Local verification on 3 September 2026: 65 unit/database tests passed; 33 distinct browser checks passed across the matrix and targeted reruns. The WebKit synthetic-microphone recording test was skipped because that Windows engine has no synthetic input source; recording pause/resume/preview/re-record passed in Chrome and Edge. The twelve existing birthday template structural checks passed. Windows sandbox restrictions interfered with test-server teardown in targeted runs; the final targeted rerun outside the sandbox passed.

Final `typecheck`, lint (zero warnings/errors), and the production build passed. A scan of all 47 generated browser assets found no configured server-secret values or application database/storage/access-secret references. The Clerk SDK includes an environment-variable name, but no configured Clerk secret value. Production HTTP checks confirmed homepage 200, both QA routes 404, and unauthenticated website/hamper/project/media APIs 401. API authentication uses an explicit JSON response so Clerk's default not-found rewrite cannot fall through to the legacy birthday slug route.

`npm run dev:qa` runs the isolated UI harness at `http://localhost:3100/qa/hamper`; use `?mode=builder`, `?style=scene`, and `?theme=buttercup-picnic`. `/qa/hamper` and its synthetic audio return 404 in production regardless of the QA environment flag. The harness contains invented fixtures and does not bypass any real owner API.

Before production release, perform a staging smoke test with real Clerk accounts, Supabase signed uploads, a second browser opening a PIN-protected link, link revocation and the cleanup cron. These connected-service checks require deployed migrations and the environment variables above.

## Changed code areas

- `src/components/dashboard/`, `src/app/dashboard/`: studio navigation and creation lists.
- `src/state/projectStore.tsx`, `src/lib/localWebsites.ts`, `src/lib/websiteProjects.ts`, `src/lib/serverAuth.ts`: account-scoped birthday persistence and authorization.
- `src/app/create/page.tsx`, `src/components/creator/CreatorApp.tsx`, `src/app/api/projects/`, `src/app/api/websites/`, `src/app/api/media/sign/`: existing creator integration and logo correction.
- `src/features/hamper/`: types, canonical item registry, validation, themes, builder, recipient renderer, item controls, server persistence, privacy and storage.
- `src/app/api/hampers/`, `src/app/api/hamper/`, `src/app/api/hamper-maintenance/`, `src/app/hamper/`: owner/public interfaces.
- Migrations 003/004, middleware, environment example, Next headers, Vercel cron, test/lint configuration, package manifests and test fixtures.

Birthday media copies deliberately share existing public media URLs. Those legacy objects are not removed when deleting a website, so older duplicates remain intact; independent storage cleanup is implemented for hampers.

The dependency audit still reports advisories in the existing Next.js 14 runtime and its bundled PostCSS. Newly added test dependencies were updated to patched compatible versions. A Next.js major-version security upgrade remains separate work and should precede a production release on an affected deployment.
