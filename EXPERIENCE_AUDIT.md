# Ode template experience audit

The recipient experience now uses twelve separate structural systems. Shared code is limited to media rendering, deterministic photo allocation, accessible carousel behavior, and low-level motion/accessibility helpers.

| Template | Structural skeleton | Signature interaction | Content order before message / ending |
| --- | --- | --- | --- |
| Contact Sheet | leader → developing hero → film rail → notes → pair → loupe → vertical strip → memory → proofs | darkroom loupe | sentence, place, words, song, known-for, joke, saying, movie, loves, obsession, memory |
| Cut & Paste | paper → taped photo → phrase → tear → pair → sticker → peel note → memory → stack → letter | tear + peel | words, loves, obsession, saying, joke, sentence, movie, song, place, known-for, memory |
| Cover Star | cover → profile → page turn → quote → pair → rotation → sidebar → fold-out → letter → back cover | editorial page fold | known-for, sentence, words, song, movie, obsession, loves, place, saying, joke, memory |
| Cinema | studio → credits → bounded hero → scenes → montage → intertitle → intermission → memory → credits → post-credit | cinematic dolly / projector cut | sentence, known-for, song, movie, words, obsession, joke, saying, place, loves, memory |
| Internet Person | boot → home screen → single active app → messages → birthday.exe | desktop window depth | words, known-for, obsession, song, movie, loves, place, joke, saying, sentence, memory |
| Archive | cover/index → artifact → room → drawer → timeline → quote → room → memory artifact → letter → close | artifact drawer | known-for, sentence, place, words, loves, obsession, song, movie, saying, joke, memory |
| After Dark | entry → flash → pair → type → vertical roll → quote → flash frame → pulse → pair → memory → lights out | flash freeze | known-for, words, song, obsession, loves, joke, saying, movie, place, sentence, memory |
| Sunday Morning | light → hero → line → breathing light → photo/quote → favorites → note → table roll → memory → letter | moving window light | sentence, saying, loves, place, song, movie, words, known-for, obsession, joke, memory |
| Polaroid Wall | cluster → pull → cluster → orbit → note → conditional archive wall → last frame | spatial pull-forward | words, sentence, place, loves, joke, saying, song, movie, obsession, known-for, memory |
| Dreamscape | opening → island → portal → statement → island → liquid → orbit → portal → one overlap → quiet message → object | refractive portal | memory, sentence, words, place, song, movie, obsession, loves, known-for, saying, joke |
| Poster City | entrance → street → poster rail → billboard → storefront → vertical type → street → memory poster → tower → exit | turning billboard | known-for, sentence, loves, obsession, song, movie, words, saying, joke, place, memory |
| Yearbook | front cover → self-turning spreads → photo spreads → favorites → pocket → signatures → letter → back cover | physical page turn | words, known-for, sentence, loves, saying, joke, song, movie, place, obsession, memory |

## Enforced guardrails

- `Photo` applies compact, normal, or cinematic footprint caps. Mobile cinematic media is capped at 68svh; desktop cinematic media is capped at 72vh and 82vw.
- Dense montage allocation begins only at 21 uploads. Ordinary chapters expose no more than three simultaneous photographs.
- Film strips, poster rails, stacks, orbiting frames, editorial rotations, and book spreads use the shared automatic carousel: looped autoplay, hover/focus/pointer pause, delayed resume, swipe, keyboard arrows, visible controls, and reduced-motion manual mode.
- Native horizontal rails and visible scrollbars are prohibited by `npm run qa:templates`.
- Every registry flow contains all thirteen creator memory keys once. `birthday-message` and `ending-line` remain separate final beats.
- Original color is the default. Black-and-white is limited to deliberate accents; Archive and Yearbook no longer impose collection-wide monochrome treatments.

## Verification commands

```text
npm run qa:templates
npm run typecheck
npm run build
```

Browser screenshot regression remains a separate visual QA step and requires a local Playwright-compatible browser runner.
