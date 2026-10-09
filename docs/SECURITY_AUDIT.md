# ODE security audit — 9 October 2026

## Scope and execution

Authorized scope: source review and invented local fixtures. No production attack, customer record access, brute force, denial of service, destructive database changes or deployment was performed. Real Clerk/Supabase secrets were excluded from the scan source copy. The nine official Strix skills were installed from `usestrix/strix`.

Strix 1.7.0 was installed using the official distribution. After Docker startup was resolved, the native Windows CLI successfully launched the official sandbox and executed source-review commands against a sanitized copy of `src`, schema and tests. NVIDIA's `z-ai/glm-5.3` was used via its OpenAI-compatible API. The user-supplied one-time credential stayed in a temporary process environment/config and was redacted from the retained log; it was not written into repository source or reports. The run has a $5 limit and 40-turn bound.

Run: `ode-strix-source-20261009_08e4`. The first execution failed after real source/tool activity when provider DNS resolution failed. DNS recovered and the run was resumed twice, but it stalled after 28 recorded model requests. The resumed processes were interrupted. A fresh quick run, `ode-strix-focused-20261009_ec13`, read seven scoped upload/ownership source files, then encountered another provider DNS failure during context compaction and was interrupted. Neither run delivered a finalized report or validated finding. **The Strix assessment remains incomplete**; its CLI metadata still says `running` following interruption, which is preserved explicitly in the exported summary rather than presented as completion. This is real executed source-review activity, not a clean bill of health or an authenticated production pentest.

## Confirmed local issues and targeted repairs

| Issue | Assessment | Repair and validation | Residual limitation |
|---|---|---|---|
| Birthday signing accepted unsafe/unknown media declarations and lacked bounded file metadata | Medium: unsupported active formats could reach signing; no cross-origin script exploit is claimed | Explicit media allowlists, MIME/kind agreement, integer size limit, bounded metadata/body, safe randomized object keys, upload-origin check. Seven media-validation tests and unauthenticated signing checks pass | Apply the prepared bucket policy migration before release. Actual uploaded bytes are not content-sniffed by this patch |
| Malformed nested website content passed broad validation and could break recipient rendering | Low availability/data integrity issue within a creator's content; no ownership bypass claimed | Validate template/vibe IDs, age, palette, media URLs, dimensions, IDs, memory schema and custom-memory types. Exact valid content is retained. Twelve website validation tests pass | Runtime/adversarial production traffic was not tested |
| Public page lacked defensive embedding/MIME headers | Hardening finding; not presented as proven exploitation | `nosniff`, frame denial, referrer policy and restricted `frame-ancestors`, `base-uri`, `object-src`; verified in browser route tests | This is a partial CSP, not complete script-source enforcement |
| Unsafe provider details could be exposed by birthday signing failures | Low information disclosure | Generic signing failure response and approved upload origin | Live provider failure was not induced |

Existing owner/auth fail-closed changes in the user's initial working tree were retained and verified; they are not attributed to this restoration patch. Source/integration checks exercise ownership boundaries for websites, hampers and Ask Outs, request limits, PIN/link handling, nested payloads and real PostgreSQL semantics using local PGlite fixtures.

## Dependency advisories still open

The executed npm audit reported **20 advisory entries: 3 critical, 14 high and 3 moderate**; see `security/dependency-audit-before.json`. These counts include overlapping dependency chains and do not mean 20 independently reproduced ODE exploits.

Next.js 14.2.35 has reported runtime advisories. Vitest/tinypool have critical development-tool advisories; TypeScript ESLint, Tailwind/PostCSS and other tooling also have reported advisories. npm's proposed replacements include major Next/Vitest/Tailwind upgrades. The request prohibits automatically applying large security patches that modify unrelated functionality, so no forced framework/toolchain migration was performed. Treat these advisories as release blockers until reviewed and upgraded in a dedicated compatible migration; browser headers do not remediate them.

## Storage and production checks

Prepared but **not applied**: `database/migrations/009_birthday_media_types.sql`, restricting the birthday bucket's allowed MIME types. No live schema or existing media object was changed. Production RLS deployment state, bucket metadata, live sessions, signed URL expiry/revocation, customer assets and Vercel settings were not probed. Local auth/API tests and source/schema review cannot certify those live settings.

QA fixture routes are explicitly gated and unavailable in production. Hampers retain private asset delivery, noindex/private caching and HTTPS external-link checks. Authentication remains server enforced; removing public homepage Clerk hydration does not change creator/API ownership checks.

## Scan evidence

Executed CLI output: `security/strix-attempt.txt` and `security/strix-focused-attempt.txt`. `security/strix-execution-summary.json` records observed interruption, CLI status, request counts and estimated model costs. The two `*-coverage.json` files retain the CLI's incomplete coverage and missing-coverage caveats. No completed scan or zero-vulnerability assurance is claimed. Initial Docker/WSL/config startup failures are setup limitations, not completed scans. Raw agent databases and credentials are excluded; temporary credential configs and this task's sandbox containers were removed.
