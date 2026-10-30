# Sekampfire

A cozy survival pixel-art game built with Canvas 2D, React and TypeScript. Gather wood, keep the fire burning, build a camp and survive the Long Night.

**Play:** https://sekafaji.github.io/Sekampfire/

## Development (Windows, macOS or Linux)

Requirements: Node.js 22+ and npm. The production build bundles the game and all runtime dependencies; it does not load Babel, React or Tailwind from a CDN.

```bash
npm ci
npm run dev        # local browser game
npm run check      # TypeScript typecheck
npm run test       # repeatable unit tests
npm run build      # production game in dist/
npm run preview    # verify production output
```

**Deployment:** Merging to `main` runs checks and builds `dist/` for GitHub Pages. The public URL and save keys stay unchanged after the migration.

## Gameplay

- Hold the left/right side of the screen or press A/D to walk. Movement immediately interrupts an unfinished chop (and does not damage the tree). To chop again, release and repress ACT.
- Press ACT or E to chop trees, feed the fire and interact. Hold ACT for repeated chopping while stationary.
- Base capacity is 5 logs; a permanent and a crafted backpack each add 8 capacity, up to 21. The bag has three visual sizes with one small sprite per carried log.
- Start with a branch for chopping; craft the **Wood Axe** (existing save-compatible maul craft ID) at the workbench, or earn the permanent Grandpa's Axe upgrade.
- The player turns toward the camera when idle, with a two-eye face, and retains visible facial detail when moving left.
- Fullscreen is responsive, with CSS immersive fallback on browsers lacking the fullscreen API and safe-area-aware canvas fitting.
- Gather 15 logs for each initial workbench/pile site, then craft boots, pack and other gear at the bench. Build a camp, survive seasonal days and the Long Night, and earn ash for permanent upgrades.
- Menus include settings, credits, a privacy policy, audio mixer, High/Low visual effects, and a two-step save reset.
- An unfinished run can be continued from the title menu after reopening the browser. Completed runs bank earned ash and clear the checkpoint. Win/death/retirement results now offer **Main Menu** without banking rewards again.

## Professional foundation — modularization phase 2

- `src/App.tsx`: browser/React lifecycle, input and drawing loop
- `src/game/config.ts`: immutable world and crafting configuration
- `src/game/rules.ts`: extracted pure gameplay formulas with unit tests
- `src/game/math.ts`: pure math utilities with unit tests
- `src/game/audio.ts`: procedural action sound, wind ambience and saved mixer preferences
- `src/game/graphics.ts`: standalone visual-effects preference
- `src/game/weather.ts`: pure weather blending function and unit tests
- `src/game/save.ts`: permanent-progress and active-run persistence, validated separately
- `src/game/palette.ts`: season selection and blended palettes
- `src/game/font.ts`: standalone pixel-font drawing and text measurement
- `src/game/renderUtils.ts`: shared color, pixel and random helpers
- `src/game/renderSprites.ts`: all 18 standalone player/tree/camp/world sprite renderers
- `src/game/game.ts`: **preserved world simulation, remaining scene rendering, and in-canvas UI** — still being separated in small, tested patches
- `src/game/input.ts`: isolated keyboard, pointer and multi-touch adapter
- `src/ui/viewport.ts`: tested aspect-preserving fullscreen dimensions and safe-area fitting
- `src/main.tsx` and `src/styles.css`: application bootstrap and built styles
- `public/privacy.html`: published data-handling policy
- `docs/ARCHITECTURE.md`: engineering rules and staged extraction plan
- `docs/MOBILE.md`: Android-first / iOS-later packaging readiness
- `docs/BACKLOG.md`: all approved but unfinished user requests (including player idle, wooden axe, wooden ring, better trees and mobile fullscreen)

### Important limits
This is the **foundation restructuring milestone**, not a completed production game or mobile app. Rendering, player art and mobile viewport still need further work. Source restructuring is deliberately behaviour-preserving; the outstanding improvements are tracked in [the backlog](docs/BACKLOG.md), not incorrectly marked done.

Existing progress keys (`sekampfire-meta-v1` and `sekampfire-run-v1`) are preserved. `base: './'` in Vite keeps output asset paths relative for GitHub Pages and future native packaging. `android/` and `ios/` projects have **not** been created; they will be added only when native builds are requested.

See [architecture](docs/ARCHITECTURE.md), [mobile plan](docs/MOBILE.md), [backlog](docs/BACKLOG.md), and [privacy policy](public/privacy.html).
