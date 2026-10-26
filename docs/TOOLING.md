# Tooling research — 2026-10-26

## Skills

- Installed [Playwright](https://github.com/openai/skills/tree/main/skills/.curated/playwright)
  for live browser inspection and interaction debugging.
- Installed [security-best-practices](https://github.com/openai/skills/tree/main/skills/.curated/security-best-practices)
  for focused React/TypeScript security reviews.
- Existing: Impeccable for design craft, web-design-guidelines for UI audits,
  token-efficiency for focused work, and the owner's progress-log/teach-me skills.

Installers were read before running. The official catalog and selected skill
instructions were inspected before installation. These instructions improve
workflow; they do not replace tests, official API documentation or owner review.
No deployment skills or paid integrations are needed for this local-only phase.

## Primary sources consulted

- [Vite setup](https://vite.dev/guide/): runtime requirements and build workflow.
- [React Three Fiber installation](https://r3f.docs.pmnd.rs/getting-started/installation):
  React 19 pairs with Fiber 9; scene package installation waits until Phase 1.
- [Vitest setup](https://vitest.dev/guide/): configuration and unit-test runner.
- [Playwright setup](https://playwright.dev/docs/intro): browser engine installation
  and browser projects.
- [ESLint flat configuration](https://eslint.org/docs/latest/use/configure/configuration-files)
  and [typescript-eslint setup](https://typescript-eslint.io/getting-started/).
- [Fontsource installation](https://fontsource.org/docs/getting-started/install):
  local font imports; use the spec's static packages with Latin subsets.
- [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/): reproducible lockfile installs.
- [Official npm registry](https://registry.npmjs.org/): exact versions, publication
  dates, licenses, repositories, engines, peer ranges and lifecycle-script metadata.
- [Official Node distributions](https://nodejs.org/dist/): Node 24 LTS archive and
  SHA-256 manifest. Installed v24.21.0 for macOS arm64.

Node archive SHA-256:
`bed7eea5325e1108f32ce5228ddd6a5f0f08a499ee42aa7442aea583702f6057`.

Direct package versions and licenses are recorded below. Dependency metadata is
evidence of compatibility, not proof of safety; run the audit at every phase gate.

| Package                     | Version | License    |
| --------------------------- | ------- | ---------- |
| react                       | 19.3.0  | MIT        |
| react-dom                   | 19.3.0  | MIT        |
| vite                        | 8.3.4   | MIT        |
| @vitejs/plugin-react        | 6.1.2   | MIT        |
| typescript                  | 6.0.3   | Apache-2.0 |
| eslint                      | 10.12.0 | MIT        |
| @eslint/js                  | 10.0.1  | MIT        |
| typescript-eslint           | 8.71.2  | MIT        |
| globals                     | 17.13.0 | MIT        |
| eslint-plugin-react-hooks   | 7.1.1   | MIT        |
| eslint-plugin-react-refresh | 0.5.7   | MIT        |
| prettier                    | 3.9.10  | MIT        |
| vitest                      | 5.0.4   | MIT        |
| @playwright/test            | 1.64.0  | Apache-2.0 |
| @axe-core/playwright        | 4.13.0  | MPL-2.0    |
| @types/react                | 19.3.0  | MIT        |
| @types/react-dom            | 19.3.0  | MIT        |
| @types/node                 | 24.19.2 | MIT        |
| @fontsource/caveat          | 5.3.0   | OFL-1.1    |
| @fontsource/nunito          | 5.3.0   | OFL-1.1    |
