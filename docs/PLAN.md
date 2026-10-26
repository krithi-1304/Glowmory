# Build plan

Each phase ends with `npm run verify`, appropriate browser tests, a local commit
and owner review. Later phases begin after that review. No remote or deployment.

| Phase                  | Deliverable                                                                                                  | Acceptance                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| 0 — Foundation         | Reviewed tools, strict React/TypeScript scaffold, fonts, tokens, copy, test harness, private-file exclusions | All setup checks pass; shell works in browser projects                |
| 1 — Room               | Procedural twilight room, window, lights, shelf, glass jar, responsive camera                                | Owner approves phone/laptop stills; baseline frame times recorded     |
| 2 — Memories           | IndexedDB/fallback, validated imports, migrations, export, recall logic                                      | Reload, merge and recovery tests protect data                         |
| 3 — Birth ritual       | Writing, feelings, eight animation beats, skip and calm paths                                                | Save completes before animation; refresh causes no loss/duplication   |
| 4 — Living fireflies   | Instancing, wandering, resting, age, curiosity, dust overflow                                                | 150 memories stay responsive; scene stays within capacity             |
| 5 — Recall             | Motion/drag/key/button shake, feeling choice, reader, breathing, sleeping                                    | Full low-day journey works; three draws never block continued use     |
| 6 — Access and sound   | Settings, synthesized audio, keyboard, list view, calm mode                                                  | Keyboard journeys and accessibility checks pass                       |
| 7 — Offline and polish | PWA, backup nudges, quality tiers, recovery, security review                                                 | Offline/update tests pass; physical-device and human review completed |
| 8 — Optional later     | On-device camera gestures, consent, local models, fallbacks                                                  | Separate opt-in version 2 work; app remains complete without it       |

## Deferred choices

Hosting provider and name availability are launch tasks. Languages beyond English,
daily reminders, phone camera support and shared jars are not Phase 0 decisions.
Memory of the day and future letters remain outside version 1.

## Gates that automation cannot replace

Real iOS motion permission, installation and audio; actual mid-range phone frame
rates; camera quality; the ritual's emotional feel; and feedback from 5–8 people.
Emulated mobile tests do not certify these requirements.
