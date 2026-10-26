# Glowmory

Good days don't go. They glow.

A private, local-first memory jar for the web. **Current implementation: Phase 0
foundation only.** The room, saving, recall and offline installation are upcoming;
the current screen is a small branded shell, not the finished experience.

## Run locally

Use Node 24 LTS. A verified Node 24.21.0 binary is installed locally on the owner's
Mac; activate it in each terminal with:

```sh
export PATH="$PWD/.tools/node/bin:$PATH"
node --version
npm ci
npm run dev
```

On another computer, install Node 24 LTS from [nodejs.org](https://nodejs.org/)
first; `.tools` is machine-local and is not committed. Dependencies are pinned in
`package.json` and the lockfile. `.npmrc` disables dependency install scripts.

## Checks

```sh
npm run verify
npm exec playwright install chromium firefox webkit
npm run test:e2e
npm run format:check
```

`verify` runs types, lint, unit tests, a production build and a dependency audit
(fails on high/critical findings). The audit needs network access. Browser tests
use the production build on port 4173; build first when running them separately.
They cover Chromium desktop/mobile, Firefox desktop and WebKit mobile emulation.
Install browser binaries again after a Playwright upgrade.

## Build and preview

```sh
npm run build
npm run preview
```

The output is `dist/`. Future hosting must serve it over HTTPS and apply
`public/_headers` (or equivalent host settings). A CSP meta tag provides a partial
fallback; it cannot implement all HTTP headers. Vite preview does not apply
`_headers`. No host, repository remote, publishing or deployment is configured.

## Structure

`src/app` holds the app shell; `src/styles` and `src/scene/palette.ts` hold the
visual foundations; `src/strings.ts` holds UI copy. Remaining folders reserve the
spec's scene, ritual, logic, storage, store, audio, hands and UI boundaries.
`tests/unit` and `tests/e2e` hold automated checks.

See [the build plan](docs/PLAN.md), [decisions](docs/DECISIONS.md),
[tooling research](docs/TOOLING.md) and [testing status](docs/TESTING.md).

The owner's original specifications, local agent instructions and learning logs
are excluded through `.git/info/exclude`. Keep manual backups of those files.
