# Development backlog

This is the **current planning view**, not a historical list of every completed patch. The [full backlog archive](BACKLOG_ARCHIVE.md) retains the original implementation notes.

## Current priorities

| Priority | Work | Status |
| --- | --- | --- |
| High | Make the next campaign stage playable with clear missions, rewards and progression after First Settlement | Planned |
| High | Review Ash Shop readability and touch scrolling on an actual landscape Android phone | Needs real-device QA |
| High | Test Fire Capacity levels and Cold/Warmth balancing in winter and Long Night play | Needs gameplay QA |
| Medium | Polish the visual scale of heavily fueled fires and check their impact on the camp scene | Review |
| Medium | Test inventory, pet actions, carry weight and restore-from-checkpoint after longer runs | Needs QA |
| Medium | Continue extracting focused simulation and rendering code from `src/game/game.ts`, with tests; world generation and run hydration already isolated | Ongoing |
| Later | Add Android packaging and native lifecycle/save testing | Not started |
| Later | Plan iOS packaging after Android viability and device testing | Not started |

## Development rules

- Preserve all real saved progress and the existing storage keys; migrations require explicit tests.
- Avoid changing unrelated game balance or artwork in a maintenance patch.
- Prefer playable, verifiable features over unfinished menu placeholders.
- Never mark real-device QA completed without screenshots or device test results.
- Keep the [project README](../README.md) focused on what the current game actually does.
- Record individual patch evidence in pull requests and, if necessary, the [development archive](DEVELOPMENT_HISTORY.md), rather than continuously extending the root README.

## Completed foundations

The current game already includes a browser build, four-season environment, camp construction, permanent Ash upgrades, Fire Capacity up to 500, real Cold protection, Bingsu's log retrieval, the Log Museum, local save/checkpoint support, CI and GitHub Pages deployment.

For prior patch-specific details, see [development history](DEVELOPMENT_HISTORY.md) and [historical backlog](BACKLOG_ARCHIVE.md).
