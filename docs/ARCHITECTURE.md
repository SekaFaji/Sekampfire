# Architecture and engineering policy

## Overview
Sekampfire is a portrait-safe, landscape-oriented 320×180 Canvas 2D survival game. React owns the browser shell and input subscriptions; the custom immediate-mode game remains the same simulation and renderer. The original single HTML file has been migrated to a TypeScript/Vite **source** project with no runtime TSX compiler or CDN dependencies.

## Current source layout
- `src/main.tsx` — application entry, styles and React mount
- `src/App.tsx` — Canvas lifecycle, viewport container, pointer/keyboard events, animation and checkpoint scheduling
- `src/game/config.ts` — stage, crafting, upgrade and world constants
- `src/game/rules.ts` — extracted pure carry/storage rules with unit tests
- `src/game/math.ts` — common math helpers and tests
- `src/game/game.ts` — **temporary migration module** containing the existing rendering, simulation, save logic, audio and in-canvas UI. Still too large; it will be extracted in reviewed slices, not rewritten wholesale.
- `public/privacy.html` — published policy (Vite copies public files into `dist/`)
- `.github/workflows/` — reproducible test and static Pages deployment

## Product and portability constraints
1. Game simulation must remain separate from browser-specific packaging. Do not introduce Android or iOS bridge calls into the simulation.
2. Maintain the original 320×180 logical coordinate system; adapt display scaling around it.
3. Browser build must remain fully standalone/offline-asset compatible: no runtime Babel, React CDN or Tailwind CDN.
4. Keep existing localStorage key names and checkpoint versions unchanged unless explicitly implementing tested migrations. Do not silently invalidate existing saves.
5. Source changes must not alter unrelated game balance or art. Make focused PRs with a list of affected files, behaviour and test evidence.
6. Never claim a device/browser playtest that was not performed. Add real-device test notes separately.
7. Keep the public privacy policy accurate if new analytics, SDKs or networking are introduced.

## Next extraction slices
- Save/loading and its migrations, with comprehensive corruption and reward-safety tests
- Input and interaction cancellation, with pointer + keyboard transition tests
- World simulation, weather and tree/chop logic
- Rendering layers and art sprites, including reflections
- In-canvas screens/menus
- Procedural audio engine and audio preferences

## Build gates
Use `npm ci`, `npm run check`, `npm run test`, and `npm run build` in CI. The web deploy must upload **dist/**, never the source tree. A successful build does not imply visual or store-review readiness.
