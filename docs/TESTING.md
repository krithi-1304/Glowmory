# Testing status

## Phase 0 — 2026-10-26

- `npm run typecheck`: passed.
- `npm run lint`: passed with zero warnings.
- `npm run test`: 1 file, 3 tests passed.
- `npm run build`: passed; production bundle generated.
- `npm audit --audit-level=high`: 0 vulnerabilities reported.
- `npm run test:e2e`: 8 tests passed across Chromium desktop/mobile, Firefox desktop and WebKit mobile. Checks cover local resources, no console/page errors, CSP violations, axe accessibility, bundled fonts, 200% text sizing, reduced motion, screenshots and no external requests.
- Impeccable visual review: Phase 0 shell disposition `ship`; no blocking findings. Screenshots: `.impeccable/review/desktop.png`, `.impeccable/review/mobile.png`.

## Not yet testable

Room performance, memory durability/import limits, ritual refresh safety, audio,
camera privacy and PWA update behavior require their later phase implementations.
Real phone motion permission, installation, frame-rate measurements and human
comfort testing still require manual review.

## Phase 1 — room (2026-10-26)

- `npm run verify`: typecheck, lint, 3 unit tests and production build passed; the
  audit passed with network access (`0 vulnerabilities`).
- `npm run test:e2e`: 8 tests passed across Chromium desktop/mobile, Firefox desktop
  and WebKit mobile. Accessibility, local-only requests, CSP, font loading and
  reduced motion checks passed against the WebGL room.
- Visual captures: `.impeccable/review/desktop.png` and `mobile.png`.
- The scene bundle is about 1.23 MB minified before gzip; later performance work
  should code-split heavy scene features before release.
- Manual phone frame-rate, Safari WebGL, lighting quality and owner comfort review
  remain open. Interactions are not present yet.

## Functional MVP pass — 2026-10-26

- Added local IndexedDB storage with localStorage fallback, validated export/import,
  recall weighting, writing panel, feeling picker, reader, sleeping shelf, settings,
  backup/delete controls, a short GSAP birth reveal and installable PWA assets.
- Unit tests: 8 passed across recall, import validation and palette foundations.
- Chromium smoke flow: save a memory, reload, shake/surprise recall: passed.
- This is a complete usable MVP, but the full specification still has deferred
  depth: device-motion shake permission/drag wiring, detailed boids/quality tiers,
  and optional camera hands. The eight ritual beats, breathing overlay and plain
  list view are now represented in the UI.
