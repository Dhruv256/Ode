# ODE QA regression report — 9 October 2026

## Scope

All **12 registered templates** remain available. Repository/history inventory and the user's confirmation establish that no dedicated Cinema/Dreamscape scroll-video variants exist in this checkout or another source. Original native scenes remain; no replacement variants were invented. The user's existing Ask Out work and Hamper item limits/features were retained.

## Verification

| Check | Result |
|---|---|
| Unit/integration | 159 tests across 14 files passed, including 18 stable-question/legacy/whitespace tests and two legacy editing/skipping regressions |
| TypeScript | Passed |
| Next lint | No warnings/errors |
| Registered-template structural audit | 12 unique registered experiences retained |
| Full Chromium recipient/product regression | 109 cases passed: 64 restoration/context, 19 Ask Out, 26 Hamper. The additional timing/spacing case passed separately (110 distinct cases total) |
| Final cross-browser smoke | Chrome/Edge/WebKit: 14 passed, one Windows WebKit synthetic-microphone test skipped |
| Production build | Final post-context isolated build passed, with 22 static pages generated |
| Landing responsiveness | 9 viewport sizes × normal/125% scale = 18 cases; no measured horizontal overflow or hero/copy/image collision |
| Final production Lighthouse | Performance 72, accessibility 100, best practices 100, SEO 100; CLS .004, TBT 20 ms, LCP 6.8 s |

Tests use invented fixtures and explicitly enabled local QA routes. Server tests use PGlite/PostgreSQL semantics and provider mocks; no customer database was modified. Protected creator API reads/signing return 401 without an authenticated user. Hamper recipient object dialogs preserve native behavior, focus and Escape closing.

The production network review found canceled auth-link prefetch redirects; automatic prefetching was disabled on public creator/auth CTAs, then the final build, navigation/API smoke tests and 18-size matrix were rerun. No local auth request failures remained. The first eight matrix cases had no failed requests; later cases recorded external Unsplash DNS/timeouts. These environment/CDN failures are retained as limitations rather than hidden or counted as successful media loads.

## Visual coverage

Desktop 1440×900 and mobile 390×900 were captured for every template at opening, 25%, middle, 75% and ending. Separate complete passes cover normal text, real portrait/group photographs, long names/messages, and multiline/emoji question context. Synthetic media additionally cover portrait, landscape, square, extreme ratio and tiny sources. Each pass records console errors, failed requests, broken images, photo IDs and horizontal overflow.

Evidence directories:

- `qa-screenshots/restoration-before/`: baseline inventory and visual reference.
- `qa-screenshots/restoration-after/`: repaired layouts and landing viewport matrix.
- `qa-screenshots/restoration-photographic/`: real photograph frame/containment review.
- `qa-screenshots/restoration-long/`: all-template long copy.
- `qa-screenshots/restoration-context-final/`: final recipient label and multiline spacing captures; six proof sheets cover all 12 templates at both widths.
- `qa-screenshots/restoration-production-final/landing/`: the final production navigation at all 18 viewport/scale combinations.

Every normal/photographic/long/context pass completed 24 viewport/template combinations without horizontal overflow, broken fixture images or page errors. Final question wording is drawn from form field IDs, and all saved answers are checked exactly, including leading/trailing whitespace, punctuation, emoji and line breaks. Optional skipped answers do not acquire labels; duplicate historical IDs collapse to one question. Reading-copy repetition is intentional and user-opened.

## Failures found and resolved

Early browser checks exposed a missing no-photo Cinema footer and unstable carousel-frame measurement; markup and layout measurement were repaired. Keyboard tests then identified ambiguous nested Yearbook controls, now named independently. Dialog image assertions were corrected to check CSS containment on the rendered image and orientation attributes on its frame.

Visual assertions caught develop/drift text remaining permanently blurred because a later CSS selector won; specificity was corrected and complete message visibility verified. New emoji/multiline captures exposed collision from tight inherited poster baselines; personalized answers now use readable line spacing while decorative headlines retain their original composition.

The new mapping test initially used an invalid synthetic hamper UUID, and one mobile test counted nodes before dynamic template loading completed. Fixture validity and the explicit rendering wait were fixed; neither product validation nor checks were disabled.

## Limits and release considerations

The unavailable video variants, real customer face positions/media/audio, live authenticated Clerk/Supabase/Vercel integration and production storage policy were not certified. Browser zoom is viewport/device-scale emulation, not manual OS zoom. Lighthouse is a local throttled lab measurement, and its LCP remains above target. Critical/high dependency advisories and the unapplied bucket restriction are detailed in `SECURITY_AUDIT.md`.

Strix executed source-review calls but provider DNS/connection failures prevented a completed assessment, including the fresh focused retry. No validated Strix finding or completed security clearance is claimed. See `SECURITY_AUDIT.md` and its exported execution/coverage evidence.

No deployment, production database migration or customer-content deletion was performed. The user subsequently requested committing and pushing all workspace changes on `codex/restore-ode-personality`. Existing assets were checked for accidental deletion; temporary scan credentials and raw agent state were excluded from repository evidence.
