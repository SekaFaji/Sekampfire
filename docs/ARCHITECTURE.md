# Architecture and engineering policy

## Overview
Sekampfire is a portrait-safe, landscape-oriented 320×180 Canvas 2D survival game. React owns the browser shell and input subscriptions; the custom immediate-mode game remains the same simulation and renderer. The original single HTML file has been migrated to a TypeScript/Vite **source** project with no runtime TSX compiler or CDN dependencies.

## Current source layout
- `src/main.tsx` — application entry, styles and React mount
- `src/App.tsx` — Canvas lifecycle, viewport container, pointer/keyboard events, animation and checkpoint scheduling
- `src/game/config.ts` — stage, crafting, upgrade and world constants
- `src/game/companion.ts` — conservative real-drop retrieval by equipped Good Dog, with carry and delivery rules
- `src/game/museum.ts` — permanent collectible definitions, discovery rolls and original pixel-art museum rendering
- `src/game/guide.ts` - pure run-local tutorial objectives, Grooty's permanent world sprite, dialogue and small question-mark shortcut
- `src/game/statusMessages.ts` - bounded sequential status queue and centered, fade-out-safe message strip
- `src/game/campBoundary.ts` - physical two-post and east-expansion actions, claimed-land tree exclusion and native-resolution procedural palisade/cleared-ground drawing. Checkpoint fields are run-local and older progress is grandfathered.
- `src/game/cold.ts` - pure exposure target, rain dampness, clothing/shelter modifiers and frame-rate-independent Cold interpolation; sole source of weather-related ambient warmth drain.
- `src/game/warmth.ts` - pure, frame-rate-independent heat absorption and gradual loss of the retained warming bonus away from a lit fire.
- `src/game/guidance.ts` - pure guide-target selection from objective IDs plus original pixel-light markers for world/minimap/menu without hit zones.
- `src/game/quickSlots.ts` - two lightweight run-scoped equipment slots, validated IDs and existing Fire Ember action, native-resolution socket art and game-tick-driven 0.5s long press. Input adapter owns pointer capture, run checkpoint stores only known IDs, menu has no background click-through.
- `src/game/hud.ts` (#39) - four native 23px wooden plaque geometries with pixel-safe margins; temporary wood-only carried-capacity currency and run Ash panel while next inventory patch adds true slots.
- `src/game/thermometer.ts` - deterministic ambient season/time/weather Celsius model, smooth nonpersisted display settling and original 105x23 brass/glass pixel instrument renderer. Does not influence Cold/warmth gameplay.
- `src/game/hud.ts` - native 320x180 wooden resource panels and a minimap from real tree/player coordinates; render-only
- `src/game/campProgress.ts` — run-scoped station upgrades, costs, progression requirements and safe wood debit
- `src/game/nightSky.ts` — independently tested aurora and meteor parade rendering/probabilities
- `src/game/rules.ts` — extracted pure carry/storage rules with unit tests
- `src/game/math.ts` — common math helpers and tests
- `src/game/audio.ts` — browser-safe procedural sounds and configurable mixer
- `src/game/weather.ts` — independently testable weather intensity calculations
- `src/game/graphics.ts` — visual-quality preference
- `src/game/input.ts` — UI-callback-injected pointer, multi-touch and keyboard adapter
- `src/ui/viewport.ts` — pure aspect-preserving safe-area fit calculation
- `src/game/save.ts` — versioned run snapshots, permanent progress, legacy fallback
- `src/game/palette.ts` — tested 7-day four-season calendar and blended palette transitions
- `src/game/wildlife.ts` — season-to-species mappings with compatible ambient motion types
- `src/game/renderWildlife.ts` — species-specific cosmetic sprites
- `src/game/water.ts` — bounded tidal wash and sparse foam calculations
- `docs/SEASONS.md` — seasonal ecology and visual-only balance policy
- `src/game/font.ts` — independent pixel text system
- `src/game/renderUtils.ts` — shared primitive/color helpers
- `src/game/renderAtmosphere.ts` — deterministic mixed woodland parallax, world-anchored ground vegetation, bounded sky/horizon haze
- `src/game/renderSprites.ts` — player/camp/wildlife composition and sprites
- `src/game/playerLegs.ts` — tested direction-aware side-view gait, boots and toe silhouettes
- `src/game/game.ts` — **temporary migration module** containing remaining scene renderer, simulation, input and in-canvas UI. Still large and being extracted in reviewed slices, not rewritten wholesale.
- `public/privacy.html` — published policy (Vite copies public files into `dist/`)
- `.github/workflows/` — reproducible test and static Pages deployment

## Product and portability constraints
1. Game simulation must remain separate from browser-specific packaging. Do not introduce Android or iOS bridge calls into the simulation.
2. Maintain the original 320×180 logical coordinate system; adapt display scaling around it.
3. Browser build must remain fully standalone/offline-asset compatible: no runtime Babel, React CDN or Tailwind CDN.
4. Keep existing localStorage key names and checkpoint versions unchanged unless explicitly implementing tested migrations. Tutorial progress belongs to a run snapshot, not permanent meta; old v1 snapshots must resume. Do not silently invalidate existing saves.
5. Source changes must not alter unrelated game balance or art. Make focused PRs with a list of affected files, behaviour and test evidence.
6. Never claim a device/browser playtest that was not performed. Add real-device test notes separately.
7. Keep the public privacy policy accurate if new analytics, SDKs or networking are introduced.

## Next extraction slices
- Further save schema validation and migration coverage (core serializer now isolated)
- Further input/gameplay boundary separation and advanced gesture coverage (keyboard, multi-touch, hit zones now extracted and tested)
- World simulation, weather and tree/chop logic
- Remaining scene composition, lighting, UI overlays, and water reflections (individual sprite renderers extracted)
- In-canvas screens/menus
- Procedural audio engine and audio preferences

## Build gates
Use `npm ci`, `npm run check`, `npm run test`, and `npm run build` in CI. The web deploy must upload **dist/**, never the source tree. A successful build does not imply visual or store-review readiness.
