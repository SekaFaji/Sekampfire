# Architecture

Sekampfire is a browser-first, landscape-oriented 320 x 180 Canvas 2D game. **React** manages the browser shell while the custom **TypeScript game engine** owns gameplay state, rendering and pixel-native menus. **Vite** bundles the site; **Vitest** provides regression tests.

## Source map

| Path | Responsibility |
| --- | --- |
| `src/main.tsx` and `src/App.tsx` | React startup, Canvas, animation loop, input and checkpoint scheduling |
| `src/ui/viewport.ts` | Aspect-preserving canvas fitting and safe areas |
| `src/game/game.ts` | Main state engine and remaining scene/simulation integration; still being extracted in tested slices |
| `src/game/worldGeneration.ts` | Seeded mountain, star and sparkle creation, plus bounded woodland spawning and tree tiers |
| `src/game/runHydration.ts` | Run checkpoint restoration and safe v1 fallback values, without an import cycle into the main engine |
| `src/game/ambientUpdate.ts` | Animation timers, particles, snow, critters and woodland events, maintained independently of active gameplay |
| `src/game/config.ts` and `rules.ts` | Stages, recipes, upgrade data and core carrying/storage formulas |
| `src/game/input.ts`, `menuScreens.ts`, `inventoryMenu.ts` | Input routing and native-resolution menus |
| `src/game/listMenuRenderer.ts` | Shared native-pixel list menu frame, hit zones, row rendering and Settings-specific translucent palette |
| `src/game/settingsMenu.ts` | Settings and Audio option definitions and persistent preference actions; receives close callback from the engine |
| `src/game/craftingMenu.ts` | Run-scoped workbench recipes, confirmation gates, real wood payments and equipped-axe protection |
| `src/game/buildingMenu.ts` | Station upgrade confirmation, build-plan actions, camp construction and permanent Log Museum ownership |
| `src/game/shopCategories60.ts`, `shopCards51.ts`, `shopScroll58.ts` | Ash Shop categories, card art, movement and selection |
| `src/game/campBoundary.ts`, `campProgress.ts` | Physical camp placement and run-scoped station upgrades |
| `src/game/campLegacy53.ts`, `campMastery62.ts` | Permanent prebuilt foundations and masteries for new runs |
| `src/game/firewood52.ts`, `fireCapacity63.ts` | Wood fuel rolls, consumption, maximum fuel and heat strength |
| `src/game/cold.ts`, `warmth.ts`, `thermometer.ts` | Cold exposure, Warmth recovery and local air temperature |
| `src/game/inventory.ts`, `equipment50.ts`, `companion.ts` | Items, equipment and Bingsu's real-log delivery |
| `src/game/save.ts` | Permanent meta storage, validation and unfinished-run checkpoints |
| `src/game/render*.ts`, `hud.ts`, `font.ts`, `palette.ts` | World art, HUD, pixel font and seasonal palettes |
| `src/game/audio.ts`, `graphics.ts` | Audio and visual preferences |
| `public/privacy.html` | Privacy information published with the game |

Most gameplay modules have matching `*.test.ts` files under `src/game/`. Keep related tests adjacent to the code they cover.

## State and data flow

1. The React application creates and drives the engine.
2. The engine updates a run using player inputs, elapsed time and the permanent upgrade snapshot.
3. Gameplay modules calculate actual resources, status, survival and environment behavior.
4. Canvas rendering uses the resulting state; menus register bounded touch/keyboard actions.
5. `save.ts` stores permanent Ash upgrades separately from active-run checkpoints.

### Save compatibility

- Permanent save key: `sekampfire-meta-v1`.
- Unfinished-run checkpoint: `sekampfire-run-v1`.
- Purchasing permanent upgrades during a run must not silently retrofit its existing run snapshot.
- New optional run fields must default safely when older checkpoint data lacks them.
- Never change storage keys or save versions without an explicit, tested migration.

## Browser and deployment boundaries

- The production build has no runtime TypeScript compiler, React CDN or Tailwind CDN.
- Vite's relative asset base supports the GitHub Pages `/Sekampfire/` path.
- Android and iOS projects are **not** currently present. Follow the [mobile plan](MOBILE.md) before beginning native packaging.
- Deployment builds and publishes `dist/`, not the repository source files.

## Quality gates

```bash
npm ci
npm run check
npm run test
npm run build
```

The combined command is `npm run validate`. Run `npm run repo:check` for fast repository-structure and local-documentation-link verification (the historical archives are excluded from link linting). The [CI workflow](../.github/workflows/ci.yml) checks repository hygiene, type safety, tests and build; the [Pages workflow](../.github/workflows/pages.yml) deploys the public game.

A green CI check does not establish visual quality, mobile usability or store review readiness. Physical-device QA remains separate.

## Engineering policy

- One focused behavioral change per pull request; do not rewrite large unrelated modules.
- Preserve genuine gameplay values, resources and checkpoint behavior unless the change is explicitly approved.
- Keep Canvas geometry based on the same 320 x 180 logical resolution.
- Keep browser APIs and future native integrations outside pure simulation wherever practical.
- Add focused tests for balance, purchases, hitboxes, saving and user-facing regressions.
- Record decisions and outstanding work in [design notes](IDEAS.md) and the [current backlog](BACKLOG.md); preserve old investigations in the [archives](README.md).

## Incremental extraction plan

The remaining `src/game/game.ts` module should be separated carefully into reviewed, tested units for rendering and scene routing. World generation, checkpoint hydration and the ambient-effects updater have already been isolated with focused regression tests. The run simulation, station selection, Ash Shop, general menu routing and scene rendering remain in `game.ts` for future careful extraction. Workbench recipes and construction/upgrade row actions are now independent modules. Settings/Audio option rows and shared list-menu painting are now independently maintained, while the Ash Shop and other panels keep their existing opacity. Do not begin a broad architecture rewrite as part of a visual patch.
