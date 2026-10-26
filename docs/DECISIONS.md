# Decisions

## 2026-10-26 — Phase 0

- Use the Glowmory workspace root as the application root. Preserve the original
  `glowmory-codex-kit` as supplied; copy its private working context to the root.
  Root progress and learning files are authoritative from now on.
- The owner's latest request explicitly permits relevant skill/tool installs,
  overriding the kit's old prohibition. Install only official OpenAI Playwright
  and security-best-practices skills; reuse existing Impeccable and accessibility
  guidance. No paid service or account integration is needed.
- Phase 0 only in this work session, with owner review before Phase 1, as required
  by the final specification. The shell deliberately has no pretend save/shake
  controls before those actions exist.
- Use a project-local, checksum-verified Node 24.21.0 LTS runtime. System Node
  25.2.1 falls outside Vitest 5's supported engine range. System tools are unchanged.
- Pin TypeScript 6.0.3 rather than 7: typescript-eslint 8.71.2 declares support
  below 6.1. React 19 leaves a compatible path to React Three Fiber 9.
- Pin the transitive `playwright-core` peer to 1.64.0. npm otherwise resolved
  axe's broad peer range to 1.64.1 alongside the 1.64.0 runner, producing incompatible
  Page types. Keep strict checking; use one matching browser automation version.
- Select stable direct package versions at least approximately two weeks old,
  check package identity/license/engine/peers and install with lifecycle scripts
  disabled. Generate the initial lockfile with `npm install --package-lock-only`,
  then install reproducibly with `npm ci`.
- Add only current-phase packages. Three/R3F, GSAP, state/storage, PWA and camera
  packages will be reviewed and pinned when their phase uses them; do not import
  unused heavy packages into the initial shell.
- Production CSP allows same-origin code/assets only, with no inline JavaScript,
  eval or inline stylesheet allowance. The first Drei SDF text approach was
  removed because its blob worker failed in strict offline browser tests; the
  title now uses local Caveat CSS with procedural depth shadows. Vite's
  development refresh has a separate context; production tests target the build.
- Supply `_headers` plus a build-injected CSP meta fallback. Only an actual static
  host can enforce the response headers; local preview validates the meta policy.
- Preserve the six supplied feelings, Caveat/Nunito fonts, exact palette and kind
  copy. No generated/downloaded art or audio; the room will be procedural.
- Add the missing private security checklist from the final specification.
  Save-before-ritual requires an awaited durable save, not the ordinary debounce.
  Future settings must include volume and full-ritual preference omitted from the
  brief's sample interface. No silent overwrite on import.
- Browser-local data is not encrypted. The eventual privacy/backup copy must
  explain shared-browser access, unencrypted exports and browser data removal.
- Impeccable's launcher returned permission denied. Context was read directly
  from the supplied spec; no design engine output or automated design verdict is
  claimed. Phase 0 is a foundation shell; room design belongs to Phase 1.
- Owner direction for the room: use dimensional 3D lettering as part of the
  firefly theme. The likely implementation is Drei/Troika SDF text for the live
  title and glow treatment, with true extruded `TextGeometry` reserved for
  short static labels if a local typeface JSON is available. Three.js's official
  `TextGeometry` requires typeface JSON; the bundled Caveat webfont alone is not
  that format. Keep readability and reduced-motion behavior ahead of depth.
