# Ode template quality pass

## Scope and evidence

All twelve existing implementations are retained. Baseline source: clean working tree on 5 September 2026. Local browser fixtures are invented; no creator data is changed. Evidence lives under `qa-screenshots/templates-before` and `templates-after`. The fixture includes seven deliberately incompatible source dimensions, all thirteen word answers, seven interests, personal details and custom memories. Scores are reviewer judgments, not laboratory measurements.

The live reference rendered in a fresh signed-out Chrome context during the initial audit. Its first fold was captured as `qa-screenshots/ode-live-before.png`. A successful single visit does not disprove the intermittent development-browser handshake. Logged-in verification requires an existing authorized session; it must not be inferred from an anonymous browser test.

## Architecture audit

- Next.js 14 App Router, React 18, Framer Motion 11, Tailwind/CSS. No GSAP or scroll library dependency. `src/motion` contains old scroll/depth helpers, currently unused by the twelve template bodies.
- `TemplateView` builds one `RenderCtx`, resolves palette/type, assigns roles, selects a template and wraps the soundtrack/countdown. Eight bodies were eagerly imported; four were client-only dynamic imports.
- All twelve use shared `Photo` and `AutoCarousel`. Most choose frame aspect from source orientation. Photo max-height caps independently override aspect ratio. Carousel renders only active slots, so intrinsic dimensions and variable text cause changing height. Autoplay is 2500 ms but hover, focus and timeout share one Boolean and can incorrectly resume. No persistent pause button.
- Every template has a distinct composition and interaction; most surrounding scenes are static. Several CSS effects run continuously. Hero entrances sometimes replay. No central executable per-template motion grammar. The unused `Reveal` hides content until an observer fires and uses `transition-all`.
- `PersonalizationSections` adds the same interests/custom-memory/archive structure after every ending, duplicating the ending. Only four interests get narrative cards. High-photo coverage validation compares the input list with itself. Standard mode has no recipient-visible complete collection.
- `projectStore` stores metadata in localStorage; blob media becomes stale after reload. Re-upload appends instead of relinking. Batch uploads are sequential but concurrent batches can race. Clear All already exists, contrary to the brief's older description; it lacks undo, keyboard focus management and persisted-media cleanup.
- Publishing uploads all media concurrently to a public Supabase bucket through an authenticated signed-upload endpoint, then saves JSON to `birthday_projects`. Failed/removed uploads have no cleanup lifecycle. Server writes check row ownership; retain these checks.
- Middleware invokes Clerk on nearly every route even when `auth.protect` is not called. Root layout mounts ClerkProvider for recipients too. `/settings` is missing from the protected list. Public birthday lookup separately requires published status and non-private visibility; preserve it.
- Shared typography uses Google Fonts. Baseline capture must load those fonts; blocked-network fallback captures are insufficient for typography scoring.

## Definitive creator inputs

| Journey | Inputs | Required output contract |
| --- | --- | --- |
| Person | gender, full name, nickname, pronouns, relationship | Dedication language; full-name byline; display name; supplied pronoun credit; relationship dedication |
| Their world | up to three vibe IDs; custom description | Composable art direction: motion, accent type, density, print frames, separators, interaction; custom description as introductory note |
| Style/age | template ID, age, birthday date | Composition; numeral/milestone treatment; dated dedication and optional timeline reference |
| Palette | palette ID, five custom colors | Ground, readable foreground, panel, accents; all five colors have a visible role |
| Photos | files, mode, hero, order, crop fit, focal point, caption, location, capture date | Lossless collection plan; hero; ordered frames; object fit/position; visible caption/metadata and accessible full view |
| Words | one-sentence, three-words, things-they-love, favorite-place, favorite-song, favorite-movie, inside-joke, always-says, current-obsession, known-for, unforgettable-memory, birthday-message, ending-line | Named template scenes and complete personal notes, without truncating a supplied answer |
| Interests | preset interests and custom interest text | One narrative or visual moment for every selection |
| Custom memories | label, value, mark, prominence (up to 10) | Template-local memory fragments, mark and semantic emphasis |
| Sound | file, volume, start offset, fade-in, fade-out, loop | Recipient-controlled audio playback |
| Release | slug, private/link/public visibility, unlock time, publish/archive | Public address, access/indexing policy, countdown and publication lifecycle |

Reserved types `guestMessages`, `passwordProtected`, `associatedMemoryId`, analysis flags and soundtrack profile ID are not questions in the current journey. They must not be counted as collected inputs. Milestone is derived from age, not an independent creator answer. Internal IDs, timestamps, dimensions and file MIME type are operational metadata, not personal narrative.

## Storyboards approved for implementation

Read each row left to right. These are the actual compositions, with shared personal details inserted **inside** the story before its final scene. Across all scenes: ENTRY is once at meaningful viewport entry; IDLE is none unless noted; EXIT is ordinary uninterrupted scroll. Heading anchors remain still; supporting media receives a short stagger. Interaction names below are the only scenes needing additional state transitions. On mobile, side-by-side narratives stack, controls remain reachable, and decorative overlaps become bounded pairs.

| Template | Scenes, purpose and content / photo role / input | Entry and interaction grammar | Mobile / collection strategy |
| --- | --- | --- | --- |
| Contact Sheet | Roll leader identifies recipient/age → primary exposure/hero with location/date → film advance/carousel → handwritten words → paired exposures → loupe/detail + inside joke → memory/paired text → proof sheet → personal annotations → birthday message → end of roll/ending | Darkroom opacity development on primary image; mechanical horizontal frame advance; stationary labels; loupe toggles detail, no moving text | One stable landscape film frame; compact proof grid, film numbering; portrait hero remains intentional |
| Cut & Paste | Name/age poster → taped hero → handwritten phrases → tear/detail + known-for → paired scraps → obsession sticker/feature → peel joke → memory/photo → rotating stack → personal scraps → hidden letter/message → closing poster | Tactile placement, small deterministic rotations; damped pickup; tear slides away; note opens on click; no perpetual bobbing | Two-column scraps only when space permits; one stable stack frame; long note stays in flow |
| Cover Star | Cover/name/age/hero → profile/known-for/place → pull quote → photo pair → editorial rotation/favorites → private sidebar/joke → fold-out memory → personal feature → editor's letter → back cover | Editorial horizontal mask; brief page fold on a single portrait; disciplined crossfade; type remains readable | Cover becomes typography followed by portrait; features stack; uniform editorial plates |
| Cinema | Studio credit condensed into opening → starring title/age → hero → descriptor intertitle → film montage → catchphrase → paired scenes → quiet memory → personal credits → birthday message → ending credits/post-credit image | Camera-scale entrance on hero once; widescreen mask on montage; controlled film cuts; quiet letter remains still | No blank intermission screen; widescreen strips, portrait full-view available; complete reel in compact rows |
| Internet Person | Optional short boot with skip → personal desktop/full name/age → photo app → favorites app → memory/joke app → message app → personal files → birthday.exe ending | Window expansion; direct app switching; progress uses transform; button feedback; no forced wait to access files | Five accessible app controls wrap; consistent window frame; complete collection accessible outside preview rotation |
| Archive | Catalogue/title/age → primary artifact/hero → gallery one → drawer/detail → dated timeline → quotation → gallery two → annotated memory → personal catalogue → letter → collection remains open | Lateral catalogue reveal; drawer opens on command; gallery crossfade; labels remain still | Timeline columns become readable rows; dated collection groups; uniform catalogue thumbnails |
| After Dark | Night title/age → flash hero → paired party images → type beat → vertical roll → quotation/joke → click-to-reveal flash/detail → song label → secondary pair → quiet memory → personal night notes → message → lights out | Brief localized exposure reveal, no full-screen strobe; vertical film transport; still song text; pointer trail removed | Fixed portrait roll; no pointer effect on touch; high-photo flash contact sheet; ending also works with zero photos |
| Sunday Morning | Name/age + window-lit hero → descriptor → photo/catchphrase → favorite things → folded joke → paired table roll → memory → personal postcards → birthday letter → signature | One window-light passage; gentle opacity; folded note/letter opens without compressing reading space; most content still | Remove decorative empty light scene; postcard grid; letter expands in flow, no projected edge-on tap target |
| Polaroid Wall | Wall title/age → first cluster/hero+pair → descriptor → second cluster/feature+memory → rail → personal pinned notes → message → wall pullback → last print/ending | Deterministic small placement rotations; bounded drag only on desktop; photo opens accessible viewer; no looping orbit | Bounded two-column wall, single rail frame; modal fits viewport with focus return; full wall uses small square prints |
| Dreamscape | Dream title/name/age → first island/hero → portal/feature → catchphrase → memory island → liquid/joke → orbit/favorites → second portal → paired skies → personal constellation → message → final light/ending | Soft scale and elliptical reveal; localized surface response; portal opens on command; no continuous spinning border | Pair becomes ordinary staggered grid; rectangular full-view preserves face/group; compact constellation gallery |
| Poster City | Age poster/hero → street dedication → poster rail → turning billboard/message + storefront/loves → type ticker → second street → memory poster → personal street notices → tower/name → city exit/ending | Horizontal poster wipe; click billboard flips with readable flow content; decisive controlled transitions; no elastic movement | Billboard uses content-sized planes; long message controls height; street grid uses consistent portrait posters |
| Yearbook | Front cover/name/age → intro spread/descriptor+words → photo spreads → favorites → pocket/memory → signed jokes → personal margin notes → letter spread → back cover/ending | Short book turn; no automatic interruption of long letters; pocket pickup with damped travel; still handwriting | Spread pages stack with a stable scrollable reading viewport; collection index offers every photo without waiting through 25 turns |

## Baseline matrix and final validation

Baseline: all 24 desktop/mobile runs completed; 120 individual screenshots and six comparison sheets reviewed. Each carousel was observed over five samples at 2.5-second intervals. Normal sample only at this stage; large-photo and text stress scores below include source findings and are provisional until the stress suite runs. The baseline measured Contact Sheet's mobile carousel changing from 507.7px to 321.2px and desktop paired frames differing by more than 100px. Cut & Paste's text carousel changed by over 350px at desktop.

Scores /10, higher is better. `Bugs` means freedom from animation bugs. `Critical` means overall critical-issue health. `50+` is initial implementation assessment, not a passed 75-photo browser test.

| Template | Desktop | Mobile | Photos | Type | Space | Scroll | Motion | Bugs | Carousel | Crop | Inputs | 50+ | Interests | Vibe | Custom | Ending | Perf | A11y | Critical |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Contact Sheet | 6 | 5 | 3 | 6 | 5 | 5 | 5 | 5 | 3 | 5 | 4 | 6 | 5 | 1 | 7 | 4 | 6 | 5 | 4 |
| Cut & Paste | 6 | 5 | 3 | 6 | 5 | 5 | 6 | 5 | 2 | 5 | 4 | 6 | 5 | 1 | 7 | 4 | 6 | 4 | 4 |
| Cover Star | 7 | 6 | 3 | 7 | 6 | 6 | 5 | 6 | 3 | 5 | 4 | 6 | 5 | 1 | 7 | 4 | 6 | 5 | 4 |
| Cinema | 6 | 5 | 3 | 6 | 4 | 4 | 6 | 5 | 3 | 5 | 4 | 6 | 5 | 1 | 7 | 4 | 5 | 5 | 4 |
| Internet Person | 6 | 5 | 3 | 7 | 6 | 7 | 6 | 5 | 3 | 5 | 4 | 6 | 5 | 1 | 7 | 4 | 6 | 4 | 4 |
| Archive | 7 | 6 | 3 | 7 | 6 | 6 | 5 | 6 | 3 | 5 | 3 | 6 | 5 | 1 | 7 | 4 | 6 | 5 | 4 |
| After Dark | 6 | 5 | 3 | 5 | 4 | 4 | 5 | 4 | 3 | 5 | 4 | 6 | 5 | 1 | 7 | 4 | 4 | 4 | 3 |
| Sunday Morning | 6 | 5 | 3 | 7 | 5 | 5 | 5 | 4 | 3 | 5 | 4 | 6 | 5 | 1 | 7 | 4 | 5 | 4 | 4 |
| Polaroid Wall | 7 | 6 | 7 | 7 | 6 | 6 | 6 | 5 | 5 | 5 | 3 | 6 | 5 | 1 | 7 | 4 | 6 | 4 | 4 |
| Dreamscape | 6 | 5 | 3 | 6 | 4 | 4 | 6 | 4 | 3 | 4 | 3 | 6 | 5 | 1 | 7 | 4 | 5 | 4 | 3 |
| Poster City | 6 | 4 | 3 | 5 | 5 | 5 | 6 | 4 | 3 | 5 | 4 | 6 | 5 | 1 | 7 | 4 | 6 | 4 | 3 |
| Yearbook | 6 | 5 | 7 | 6 | 5 | 6 | 6 | 4 | 3 | 5 | 4 | 6 | 5 | 1 | 7 | 4 | 6 | 4 | 4 |

### Template-specific baseline issues

- Contact Sheet: film cells and paired exposures use mismatched dimensions; labels are exceptionally small; three endings/afterword rhythms dilute the last line.
- Cut & Paste: text carousel changes height dramatically; peel layer projects outside the paper; image captions and shadows risk collision; descriptor omitted.
- Cover Star: portrait/landscape carousel changes frame; favorite ticker disappears at mobile; long headline uses a narrow line height; several OR answers silently suppress others.
- Cinema: two opening title cards and an empty intermission delay recipient content; repeatable hero zoom; inconsistent film ratio; important details are not in the credits.
- Internet Person: no h1; boot blocks app access; five tiny app labels; hidden apps do not expose all supplied details; rotating photos cannot be quickly scanned.
- Archive: date timeline selects only three dates; drawer can suppress the inside joke when a caption exists; changing gallery frames; no life-stage service.
- After Dark: full-screen flash and permanent pulsing text; expensive pointer trail; typography loses the intended condensed voice in several scenes; ending disappears without a finale photo.
- Sunday Morning: unused light-only scene; edge-on folded letter creates a poor tap target; note max-height clips long text; misaligned carousel margins vary per active index.
- Polaroid Wall: modal has no focus trap/Escape behavior; desktop drag can cross bounds; large mobile prints create long scroll; most word answers unused.
- Dreamscape: fixed-height absolute overlapping photos; perpetual portal rotation; cropped portal contains no accessible full-view focus handling; ending tied to a photo.
- Poster City: billboard front text is visibly clipped at mobile; long message has fixed absolute bounds; vertical name creates unnecessary length; ending tied to a photo.
- Yearbook: first visible spread contains no photos; autoplay interrupts reading; nested carousel competes with parent; signed notes use overlapping absolute placement.

The scores above preserve the original baseline. The final scoped review and verification limits are recorded below.

### Post-repair smoke matrix (2026-09-06)

The repaired QA fixture was rerun at 390px and 1440px for all 12 templates (24 runs), with screenshots at 0/25/50/75/100% scroll, full-page photo discovery, and five 2.5-second carousel samples. The matrix reported **0 horizontal-overflow failures, 0 broken images, 0 page errors, and stable carousel frame heights in all 24 runs**. This is a deterministic fixture smoke pass; the larger photo-count, real-upload, reduced-motion, keyboard/modal, and production build checks remain outstanding.

## Final scoped review — 2026-09-06

The existing 100 tests and original 24 clean visual runs were retained as the baseline. This continuation concentrated on the remaining browser checks and reproduced regressions; it did not redesign passing template compositions.

### Reproduced defects fixed

- Text carousels reserved their reading space but rendered invisible words because an `[aria-hidden]` CSS selector also matched `aria-hidden="false"`. The selector now matches only `true`. Browser checks confirm visible words, timed advancement, hover/focus pause, and arrow-key navigation.
- The full-photo dialog allowed Tab to move out of its sole close control. Forward/reverse Tab now wrap across visible dialog controls. Escape, the close button, focus return to the originating thumbnail, and restoration of body scrolling were verified.
- The photo editor exposed focal-point placement only through clicking the image. Labelled horizontal/vertical range controls now provide a keyboard path.
- After Dark interest cards retained a hard-coded dark background with dark text under the selected light palette. They now use the existing palette panel variable. The reproduced pairing changed from `#202020` with dark text to a light panel with `rgb(27,24,21)` text; a targeted browser screenshot verifies the correction.
- Development and production shared generated output, allowing builds to corrupt live QA chunks or fail on Windows trace locks. Development now uses `.next-dev`, QA uses `.next-qa`, and production uses `.next` (or the preserved explicit `.next-build` override). Standard production builds succeeded while QA continued serving successfully. No generated-cache deletion is needed for the normal workflow.

### Verification evidence

| Check | Result and evidence |
| --- | --- |
| 75 binary originals | Passed: 75 encoded JPEG/PNG files uploaded through the actual PhotosStep and ProjectProvider. Five source dimensions include portrait, landscape, square, panorama, and low resolution. Every restored file was compared byte-for-byte after reload. |
| Missing originals | Passed: removed five IndexedDB originals, reloaded to reproduce stale photos, reuploaded matching filenames, and verified all original IDs/order were retained without duplicates. |
| Clear/undo/reload | Passed: removed all 75 photos, restored with Undo, reloaded, and verified all 75 originals remained available. |
| Complete collection | Passed in all 12 templates using the 75 restored binary originals. Each collection exposed 75 thumbnail controls. |
| Modal/reduced motion | Passed in all 12 templates: keyboard open, decoded full image, Tab containment, Escape, focus return; the observed carousel did not advance under reduced motion. |
| Normal carousel interaction | Passed on Sunday Morning: visible text, autoplay advancement, hover pause, focus pause, keyboard advance. Reverse Tab, close-button focus return, and scroll unlock also passed. |
| Stress matrix | 60 cases passed: each of 12 templates at 5/25/50/60/75 photos, empty/short/normal/long words, widths 320/390/1440. Exact collection counts, zero broken images, zero horizontal overflow, zero hidden carousel words, zero unnamed template buttons, zero page errors. |
| Final visual review | 120 new screenshots at desktop/mobile and 0/25/50/75/100% positions, using 60 photos and long copy. Google Fonts were loaded (5–8 loaded font faces per template). Six comparison sheets plus targeted full-size frames were inspected. After Dark was recaptured after the contrast repair. |
| Public recipient | Production server: `/anolaa-25` returned 200; unknown recipient returned 404. Fresh Chrome contexts at 390/1440 opened the recipient directly, with no Clerk navigation. |
| Creator protection | Fresh Chrome contexts at 390/1440 redirected `/create` and `/dashboard` to sign-in. `/api/websites` and `/api/projects` returned 401 to signed-out requests. Non-navigation requests to creator pages returned Clerk's protected 404 behavior. |
| QA isolation | QA pages returned 404 in production; the new media harness is gated by both development mode and explicit `ODE_QA_MODE`. |
| Static checks | Final typecheck and lint passed. Standard production build passed with QA running separately. |

Reproduction commands: `npm run dev:qa`, then `node scripts/remaining-qa.mjs`, `node scripts/template-stress-qa.mjs`, `node scripts/interaction-qa.mjs`. Final font-loaded capture: `node scripts/final-visual-qa.mjs`; proof sheets: `node scripts/template-proof-sheets.mjs final`. Production route scripts use ports 3200/3201 and require the configured database/Clerk network access. All data used by the media harness is isolated under local owner `qa-media`.

Evidence locations:

- `qa-screenshots/remaining/results.json`: 17 passing binary-media and template-interaction checks.
- `qa-screenshots/remaining/interactions.json`: normal-motion interaction checks.
- `qa-screenshots/remaining/routes.json` and `browser-routes.json`: production access results; navigation paths omit handshake query payloads.
- `qa-screenshots/final-audit/results.json`: 60-case stress matrix.
- `qa-screenshots/templates-final/`: font-loaded screenshots; targeted After Dark capture supersedes its earlier frames.
- `qa-screenshots/remaining/after-dark-contrast-fixed.png`: focused contrast repair evidence.

### Final scores

Scores are editorial judgments out of 10 within the tested Chrome scenarios, not Lighthouse results or WCAG certification. A score of 8 means solid with polish opportunities; 9 means strong within the checked scope. Performance is deliberately unscored because no physical-device CPU/memory or Core Web Vitals run was performed. The shared input validator reports coverage, not proof of the artistic quality of every input's manifestation.

| Template | Desktop | Mobile | Photos | Type | Space | Scroll | Motion | Bugs | Carousel | Crop | Inputs | 50+ | Interests | Vibe | Custom | Ending | Perf | A11y | Critical |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Contact Sheet | 8 | 8 | 9 | 8 | 8 | 8 | 8 | 9 | 9 | 8 | 8 | 9 | 7 | 7 | 8 | 8 | — | 8 | 9 |
| Cut & Paste | 8 | 8 | 9 | 8 | 8 | 8 | 8 | 9 | 9 | 8 | 8 | 9 | 7 | 7 | 8 | 8 | — | 8 | 9 |
| Cover Star | 8 | 8 | 9 | 8 | 8 | 8 | 8 | 9 | 9 | 8 | 8 | 9 | 7 | 7 | 8 | 8 | — | 8 | 9 |
| Cinema | 8 | 8 | 9 | 8 | 8 | 8 | 8 | 9 | 9 | 8 | 8 | 9 | 7 | 7 | 8 | 8 | — | 8 | 9 |
| Internet Person | 8 | 8 | 9 | 8 | 8 | 8 | 8 | 9 | 9 | 8 | 8 | 9 | 7 | 7 | 8 | 8 | — | 8 | 9 |
| Archive | 8 | 8 | 9 | 8 | 8 | 8 | 8 | 9 | 9 | 8 | 8 | 9 | 7 | 7 | 8 | 8 | — | 8 | 9 |
| After Dark | 8 | 7 | 9 | 7 | 8 | 8 | 8 | 9 | 9 | 8 | 8 | 9 | 7 | 7 | 8 | 8 | — | 7 | 8 |
| Sunday Morning | 8 | 8 | 9 | 8 | 8 | 8 | 8 | 9 | 9 | 8 | 8 | 9 | 7 | 7 | 8 | 8 | — | 8 | 9 |
| Polaroid Wall | 8 | 8 | 9 | 8 | 8 | 8 | 8 | 9 | 9 | 8 | 8 | 9 | 7 | 7 | 8 | 8 | — | 8 | 9 |
| Dreamscape | 8 | 8 | 9 | 8 | 8 | 8 | 8 | 9 | 9 | 8 | 8 | 9 | 7 | 7 | 8 | 8 | — | 8 | 9 |
| Poster City | 8 | 7 | 9 | 7 | 8 | 8 | 8 | 9 | 9 | 8 | 8 | 9 | 7 | 7 | 8 | 8 | — | 7 | 8 |
| Yearbook | 8 | 8 | 9 | 8 | 8 | 8 | 8 | 9 | 9 | 8 | 8 | 9 | 7 | 7 | 8 | 8 | — | 8 | 9 |

Visual observations: Contact Sheet retains readable film sequencing; Cut & Paste's handwritten long copy remains in flow; Cover Star's long name wraps heavily in narrow editorial columns; Cinema retains readable widescreen scenes; Internet Person stays the most compact; Archive's dated collection remains legible; After Dark's condensed body typography is less comfortable for long reading; Sunday Morning's letter/collection pacing remains calm; Polaroid Wall's high-count grid stays bounded; Dreamscape preserves full-view access despite decorative masks; Poster City's condensed type remains dense on mobile; Yearbook's complete collection avoids waiting through all spreads. Shared interest cards still feel related across templates and the gaming grid competes somewhat with text. These are retained polish observations, not speculative redesigns in this pass.

### Limits of this sign-off

This completes the scoped local regression and visual pass. The uploads were real encoded raster files generated for testing, not a creator's private camera library. HEIC, large video originals, storage-quota exhaustion, physical iOS/Android devices, screen-reader usability, and authenticated publishing/cloud media deletion were not exercised. Browser checks used Chrome; they do not establish Safari/Firefox equivalence. The route run used the previous passing production bundle for auth (auth code was unchanged in this continuation); the final build verifies the new UI fixes. No deployment or remote project modification was performed.
