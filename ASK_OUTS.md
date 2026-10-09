# Ask Outs

Ask Out is Ode's third independent creation type. It does not share persistence or public routes with Birthday Websites or Digital Hampers.

## Routes

- `/askout/create` — authenticated creator/editor with a live mobile preview.
- `/dashboard/askouts` — owner-scoped list, status, dates, response summary, edit, preview, copy and delete.
- `/askout/[slug]` — unlisted public recipient experience.
- `/api/askouts` and `/api/askouts/[id]` — owner-scoped creation and editing.
- `/api/askout/[slug]/responses` — public, deduplicated response recording.

## Database setup

Apply `database/migrations/008_ask_outs.sql` after the existing migrations, or run `npm run db:studio -- --apply`. It creates `ask_outs` and `ask_out_responses`, enables RLS, and revokes direct browser-role access. Creator ownership is always derived from Clerk on the server.

Responses are deliberately narrow: viewed, started, tell-more, accepted and declined, plus the selected day label and activity. The server stores a one-way session hash only; it does not collect pointer movement, failed playful-button attempts, or behavioral profiles.

## Product behavior

The creator supplies all logistics. Publishing requires a recipient, creator, date, pickup time, destination, searchable map address, activity, and three editable semantic day choices. Every theme starts with four curated, compatible interactions; creators can use three to five while the grouped public experience remains seven screens or fewer. The optional Playful Yes-Only Journey adds one theme-specific forward-only mischief gate before the invitation, with Light, Mischievous or Chaotic intensity. It never changes the final consent card: “Yes :)”, “Tell me more” and a stationary “Not this time” remain available and end the flow respectfully.

Five render themes use the same content model but ship with distinct flows: Tagged Message, Cat Investigation, Magical Message, Sticker Scrapbook and Tiny Exhibit. Each begins with four curated, compatible interactions that the creator can toggle or reorder. Accepted invitations expose the creator-entered details, a Google Maps search, an `.ics` calendar file and a save-details action.

Original transparent theme scene plates live in `public/askout-assets/`. They were generated specifically for Ask Out, resized to a mobile-friendly 900 px bound, and encoded as alpha WebP assets.

## Verification

`tests/browser/askout.spec.ts` covers 360×800, 390×844, 393×852 and 430×932, all five themes, direct refresh, desktop interaction journeys, Playful Yes-Only gates, creator-to-publish, Tell Me More, accept, decline, map and calendar behavior. Server integration tests execute the real migration in PGlite and verify owner isolation, draft privacy, response deduplication, custom copy persistence and both consent outcomes.
