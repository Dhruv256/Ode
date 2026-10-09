# ODE landing-page improvements

## Composition and readability

The baseline's absolutely positioned photo collage collided with heading/copy on desktop and smaller laptops, including 1366×768 and 1280×720. The hero now uses an intrinsic two-column composition; mobile uses normal document flow. Original Bodoni/Fraunces/Anton/monospace typography, paper, rust, pink and photographic collage remain.

Fluid heading sizing and line height suit each section. The process uses readable two-column steps; captions/navigation/footer text have usable minimum sizes. Navigation wraps instead of hiding its links. CTAs have 44px minimum targets and visible keyboard focus. The logo reserves its exact 42px/34px dimensions, preventing intrinsic-image layout shifts.

Hero text renders immediately rather than waiting invisibly for hydration/entrance animations. Below-fold section motion and the photo composition remain. Hero photographs have responsive source sets, explicit dimensions and decoding hints; the closing image loads lazily. Existing typefaces are served locally with their licenses and two critical font preloads.

The public homepage no longer mounts Clerk or runs its development-session handshake. Static studio/sign-in links enter the existing protected dashboard/auth routes, whose providers and owner checks remain. Sign-in uses the existing dedicated sign-in page rather than a homepage modal. Public creator/auth links disable automatic prefetching, eliminating canceled sign-in redirects discovered in the final network check. This avoids loading authentication just to read the public exhibition.

## Digital Hampers

`#hampers` is a substantial pink/paper parcel chapter and a visible navigation destination. It explains a hamper as a collection of notes, photographs, voices, drawings and links, compared with a birthday website's continuous story.

The physical preview uses ODE's actual Hamper object renderer: folded letter, polaroid, cassette and wrapped box. The CTA goes to **`/dashboard/hamper/new`**, the existing creator route. No new Hamper product flow or item limit was introduced. The CTA was followed in browser QA with invented API responses; live database creation was not used.

Template tickets are real `/create` links, with their visible labels as accessible names and a count derived from the actual registry. Copy now promises a share link rather than implying all recipient content is inherently private.

## Responsive evidence

The automated matrix captures 100% and 125% effective zoom at:

| Viewport | Result |
|---|---|
| 1920×1080 | No horizontal overflow or hero/collage collision |
| 1440×900 | No horizontal overflow or hero/collage collision |
| 1366×768 | No horizontal overflow or hero/collage collision |
| 1280×720 | No horizontal overflow or hero/collage collision |
| 1024×768 | No horizontal overflow or hero/collage collision |
| 768×1024 | No horizontal overflow or hero/collage collision |
| 430×932 | No horizontal overflow or hero/collage collision |
| 390×844 | No horizontal overflow or hero/collage collision |
| 360×800 | No horizontal overflow or hero/collage collision |

Zoom is emulated with reduced CSS viewport dimensions and device scaling; it is not a claim of manual native browser-zoom testing. Captures and measured rectangles are in `qa-screenshots/restoration-after/landing/` and `results.json`; baseline evidence is in `restoration-before/landing/`.

## Quality audits

Lighthouse was run against a local production build, not a development server. The first run scored performance 38, accessibility 99, best practices 79 and SEO 92. After typography/image/label repairs, an intermediate run scored 50/100/79/100 with CLS reduced from 0.103 to 0.057 and LCP from 9.6s to 7.2s. That run still included the Clerk development-key redirect chain. The final audit after separating public/auth loading is recorded in the QA report.

Accessibility findings addressed: duplicate logo alt text, accessible ticket names that excluded some visible text, small navigation/CTA targets, and hidden mobile navigation. `robots.txt` now provides actual crawler rules instead of resolving through the birthday-slug fallback. Crawler rules do not provide authorization; creator APIs retain server checks.

Lighthouse measures a throttled local lab run. External image delivery and machine contention vary; these results do not establish field Core Web Vitals or a production SLA. No production deployment was performed.

The final production audit scored **72 performance, 100 accessibility, 100 best practices and 100 SEO**. CLS was **0.004**, TBT **20 ms**, and LCP **6.8 s**. Public landing authentication isolation removed the Clerk development-key redirect chain and its audit failures. LCP remains above the desired threshold; external image delivery and local throttling still affect it. Raw sanitized evidence: `qa-screenshots/restoration-after/landing/lighthouse-production-final.json`.

The final build's public navigation was also captured at all 18 viewport/scale combinations, with authentication enabled and the static studio/sign-in links present: `qa-screenshots/restoration-production-final/landing/`. All cases had no measured overflow or hero/copy/gallery collision and no page errors. After the prefetch repair, no local auth prefetch requests failed. Eight combinations had no failed requests; later combinations encountered intermittent external Unsplash DNS/timeouts. Those failures remain recorded in `results.json`; earlier full-photo captures and Lighthouse evidence are retained. External image delivery remains an availability/performance limitation.
