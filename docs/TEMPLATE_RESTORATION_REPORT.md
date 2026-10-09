# ODE template restoration

## Scope and recovery

All **12 registered templates** remain present with their original IDs. The initial commit and all 16 available commits contain this twelve-template collection. The requested target of 50 templates and dedicated Cinema/Dreamscape scroll-video variants are absent; the owner confirmed there is no additional branch or source containing them. Existing Cinema and Dreamscape experiences were preserved.

Work is on `codex/restore-ode-personality`, based on `4729825`. Existing tracked changes were backed up as a binary patch and untracked work copied to `C:\Users\dhruv\AppData\Local\Temp\ode-restoration-20261009`, excluding environment credentials. No wholesale revert, production deployment, database reset, or original-asset deletion was performed. Pre-existing Ask Out work and the Hamper 20-per-category/120-total limits were retained.

Historical references: `434fa18` and the versions before `ce4a04d` exposed the original dark film/night identities, orientation-dependent framing, title cards and small interactions. `ce4a04d` introduced useful collection, reading and accessibility behavior but flattened headings, palettes and photographic proportions. Restoration selectively recovered those artistic choices while retaining the newer product capabilities.

## Template inventory and changes

Every row passed desktop/mobile rendering and empty, short-name, long-message and 75-photo content tests. Normal and photographic screenshot matrices include all twelve templates at 1440 and 390 CSS pixels. Screenshots use invented messages and public demonstration photographs, never customer projects.

| Template | Problem / historical intent | Restoration and retained personality | Verification |
|---|---|---|---|
| Contact Sheet | Dark film identity became a light generic palette; oversized framing and flattened typography; empty darkroom-note scene | Dark film leader, paper annotation chapters, source-aware frames and photographer's loupe; two selected monochrome treatments rather than a monochrome collection; darkroom/final text develops on entrance | Visual matrix, 0/1/12/75 photos, keyboard loupe and clear final-message timing |
| Cut & Paste | Generic headings and repeated interest cards diluted ransom type and handwriting; empty rotating phrase section | Original ransom/display lettering, tape, tear and peel interactions; handwriting preserved; empty phrase scene omitted; paper-step messages and compact interests | Visual matrix, content cases, keyboard tear reveal |
| Cover Star | Fixed portraits cropped landscapes; heading split an ordinary name inside its desktop column | Editorial cover/profile/fold rhythm retained; heading fitted to its own column; source-aware photos; editor's letter and back-cover reveal | Desktop/mobile proof, long name/messages, collection cases |
| Cinema | Opening ODE title lost; pale foundation and captions over photographs weakened film grammar | ODE PICTURES title card, dark matte, paper intertitles, bounded 16:9 frames with containment, credits outside photographs, paced closing credits; semantic finale exists with no photographs | Visual proof, empty finale regression, content and frame tests |
| Internet Person | Shared oversized additions diluted the personal-desktop structure | Boot, apps, windows, saved-file carousel and birthday.exe retained; compact console interests; terminal-paced personal and closing messages | Desktop/mobile content cases and stable mixed-photo carousel/manual pause |
| After Dark | Light palette replaced night; first flash did not actually flash; empty type-beat scene | Dark foundation, single restrained tap flash and song pulse with reduced-motion fallback; empty beat omitted; deliberate flash portrait treatment; closing words reveal independently | Visual matrix and content cases; no empty photo-dependent finale |
| Sunday Morning | Source photos forced into postcard proportions; generic shared headings and unnecessary favourite scene | Soft light, original serif/handwriting, folded note and letter retained; source-aware stills, stable table carousel; absent favourites omitted; letter sentences and finale unfold deliberately | Visual matrix, content cases, keyboard folded-note test |
| Polaroid Wall | Cropping/large repeated sections weakened the instant-print wall | Square prints retained with containment for mismatched sources; spatial wall and draggable/tappable prints preserved; pin-paced message; finale still exists with no photos | Visual matrix, 75-photo collection, modal containment/focus/Escape |
| Archive | Forced portraits and an empty timeline; broad heading overrides dulled catalogue typography | Catalogue lettering, drawer, labels and timeline retained; source-aware artifacts; empty timeline omitted; annotated compact interests and paced catalogue message | Visual matrix, content cases, keyboard drawer |
| Dreamscape | Uniform framing and additional generic cards overwhelmed islands/portals | Original dreamscape, liquid surface, islands and portals retained; bounded source-aware photos and controlled two-photo composition; dream message resolves completely from blur | Visual matrix, content cases, full-photo portal/focus/Escape |
| Poster City | Forced portraits; empty city-text scene; closing text depended on a finale photo | Poster rails, halftone accents, billboard flip and storefront remain; empty text rail omitted; message waits for billboard turn; independent finale with/without image | Visual matrix and content cases |
| Yearbook | Fixed portrait framing/shared type weakened printed spreads; nested controls hard to distinguish | Cover, spreads, keepsake pocket, signatures and letters retained; source-aware photos within stable carousel frames; named control groups distinguish page turns from nested favourites | Visual matrix, all content cases, keyboard keepsake pocket |

## Shared repairs, without a shared artistic layout

- Removed shared heading line-height/mobile-size overrides; native template classes and typefaces control normal headings again.
- Normal photographs follow source orientation. Square instant prints and cinematic mattes remain intentional; excessive mismatch and detected group photos use containment. Manual crop/focal choices are retained.
- Mixed-source carousels receive the template's fixed repeated frame through a context, preventing layout-height jumps. Each carousel retains its animation kind and existing autoplay/reading controls. Controls are named groups for nested navigation.
- `MessageReveal` preserves exact whitespace, punctuation and emoji. Twelve template modes choose their own rhythm and opacity/filter treatment. Each text starts on its own entrance; Poster City's concealed message is gated by the flip. Reduced motion displays readable text immediately. A screenshot assertion caught and fixed CSS specificity that otherwise kept develop/drift text blurred.
- Long copy and long first names wrap without inventing replacement wording. Native notes plus the complete reading copy retain every supplied message.
- Compact interest lists follow each template's materials and labels; they replace repetitive large generic interest cards. Optional empty carousels/timeline disappear. Complete photo collections remain collapsed for ordinary gifts and available for high-photo gifts; no content was discarded to shorten the page.
- The exact existing six font families are self-hosted in compressed Unicode subsets, with OFL licenses and source SHA-256 manifests. No replacement font system was introduced.

## Recipient question context

All 13 creator questions now carry recipient wording in the same `MEMORY_QUESTIONS` schema. Stable original IDs and renderer aliases resolve through `questionIds.ts`; saved records containing only an original field ID remain readable. `personalAnswers` skips unanswered/skipped entries and de-duplicates question IDs without trimming or rewriting answers. Native OR-fallbacks choose a label from the actual source field, never the answer text. Photo-caption fallbacks do not inherit a memory-question label.

Native answers keep their existing magazine spread, film intertitle, pinned handwriting, terminal, museum annotation, dream or poster placement. The shared primitive only adds a small contextual heading; template-specific fonts, materials, marks and layouts remain. Questions arrive before answers; message units start after that anticipation pause. Multiline answers get readable line spacing even when an original poster headline uses a tight baseline. Text carousels reserve the full pair's height and extend their interval for reading; Yearbook pages allow the longest message to finish. Photo carousels retain their original product cadence.

Remaining notes and an optional complete reading copy use the same schema labels. Conditional native branches are accounted for, so questions already used by a reachable scene do not also become standalone notes. Repeated saved IDs collapse to one question. The complete reading copy intentionally offers a second, user-opened way to read the narrative at one's own pace.

Digital Hamper fields use their actual item-editor schema IDs and recipient labels. Captions, song/voice titles, notes, map reasons, coupon descriptions/codes, newspaper headlines and the opening message retain their native objects and dialogs. Saved hamper text now preserves leading/trailing whitespace and multiline content; URL/slug normalization remains separate.

Added 18 mapping/preservation tests, two legacy editing/skipping regressions, and desktop/mobile tests for every template with long, multiline, emoji, skipped and historical-ID fixtures, plus all ten keepsake types in all five hamper themes. Reopening old records resolves their original question IDs in the creator form; replacing or skipping an answer removes its legacy entry correctly. Final context captures are in `qa-screenshots/restoration-context-final/`.

## Evidence and limits

See `qa-screenshots/restoration-before/`, `restoration-after/`, `restoration-photographic/`, `restoration-long/` and `restoration-context-final/`. Each template has opening/25%/middle/75%/ending captures; four-template proof sheets provide desktop and mobile comparisons. The photographic pass checks actual portraits and a group photograph; artificial shape fixtures separately cover extreme ratios and tiny source images.

Real customer-specific face positions, live storage delivery, customer audio, and absent dedicated scroll-video variants cannot be certified by these fixtures. Existing native inline-video handling was retained. Browser QA uses explicitly enabled local fixture routes; those routes are disabled in production.
