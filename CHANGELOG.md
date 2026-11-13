# Changelog

This is a concise record of meaningful milestones, not a replacement for the complete [patch history](docs/DEVELOPMENT_HISTORY.md). The repository's pull requests are the source of truth for individual code changes.

## 2026-11-13 - Station interactions and navigation cleanup (Patch #69)

- Moved physical station entry, fireplace/stored-wood actions and station action rows into `src/game/stationActions.ts`.
- Moved menu close/Back transitions and selection handling into `src/game/menuNavigation.ts`, while keeping the old `game.ts` exports and input adapter callbacks.
- Added focused tests for physical reach, STORE vs TAKE, upgrade confirmations and run Ash, nested menu navigation, and keyboard selection.
- Preserved the existing UI, balance, save schema and player progression without adding dependencies.

## 2026-11-13 - Crafting and construction cleanup (Patch #68)

- Extracted workbench recipe rows into `src/game/craftingMenu.ts` and building/station upgrade actions into `src/game/buildingMenu.ts`, while retaining the existing `game.ts` exports and on-screen menu routing.
- Preserved two-tap crafting, upgrade and building confirmations, original wood costs, real Ash grants, axe ownership, final-cabin gates and persistent Log Museum progress.
- Added focused regression tests for exact payments, locked recipes, real station upgrades, campaign construction and museum save data. No graphics, gameplay balance or save schema changes.

## 2026-11-13 - Settings transparency and menu cleanup (Patch #67)

- Matched the Settings family visually to the lighter title-menu aesthetic: reduced stacked modal veil, panel fill, selected-row highlight and Audio slider background opacity. Kept the Ash Shop and all other modal palettes unchanged.
- Moved shared list-menu drawing and Settings/Audio option rows into dedicated modules, preserving on-screen hit zones, keyboard navigation, preferences and two-step save-reset protection.
- Added visual geometry/opacity regression checks and navigation safeguards. No save schema or gameplay economy changes.

## 2026-11-13 - Incremental engine cleanup (Patch #66)

- Moved the ambient update loop and woodland event scheduler into `src/game/ambientUpdate.ts`, preserving existing time progression, particle/snow effects, random events and the Canvas loop exports.
- Added focused checks for status timing, quick-slot holds, woodland spawns and seasonal effects. No save schema, game balancing or artwork changes.

## 2026-11-13 - Codebase maintenance (Patch #65)

- Extracted seeded scenery and tree generation from the main game module.
- Extracted version-one run restoration into a dedicated hydration module.
- Added deterministic generation, save restoration and backwards-compatibility tests.
- Added repository conventions, local documentation-link verification and CI checks.

## 2026-11-12 - Repository and gameplay

- [PR #64](https://github.com/SekaFaji/Sekampfire/pull/64): professional README, documentation index, preserved history and collaboration templates.
- [PR #63](https://github.com/SekaFaji/Sekampfire/pull/63): clearer Ash Shop and eight-level permanent fire capacity, up to 500 fuel.
- [PR #62](https://github.com/SekaFaji/Sekampfire/pull/62): permanent camp mastery tiers, with physical buildings and Cold protection kept distinct.

## Earlier work

- Four-season pixel-art forest survival, camp construction, crafting and equipment.
- Local browser progress and unfinished-run checkpoints.
- Bingsu companion and collectible Log Museum.
- Long Night finale and First Settlement progression.
- Native-resolution canvas, TypeScript/Vite project and automated tests.

For detailed changes, gameplay tradeoffs and the original patch chronology, read the [development history](docs/DEVELOPMENT_HISTORY.md), [design archive](docs/DESIGN_ARCHIVE.md) and [commit history](https://github.com/SekaFaji/Sekampfire/commits/main/).
