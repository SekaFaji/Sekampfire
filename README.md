# Sekampfire

A cozy survival pixel-art game built with Canvas 2D, React and TypeScript. Gather wood, keep the fire burning, build a camp and survive the Long Night.

**Play:** https://sekafaji.github.io/Sekampfire/

## Permanent progression, companions and log collecting

- **Finish / continue:** After surviving the Long Night, choose **End Run & Bank Ash** or **Continue Surviving**, which retains unbanked Run Ash. Victory choice persists across checkpoint reloads. Menu > End Run requires confirmation. Existing Ash earning rates and the Long Night trigger have not been changed.
- **Ash clarity:** Run Ash is earned during the current run; Banked Ash is persistent Shop currency. Banked Ash stays safe through future runs.
- **Shop:** **Upgrades / Pets / Coming Soon** with the close button above the three tabs. Owned Good Dog remains on the original `up.dog` permanent save key and can be equipped/unequipped through Pets.
- **Dog:** follows the player, carries at most **2 actual dropped logs**, deposits them in wood storage or hands them to the player, and never creates wood from nothing. Cargo and position persist with run checkpoints.
- **BUILD / CRAFT:** Build uses **Structures / Upgrades** tabs; the workbench uses **Tools / Supplies**.
- **Permanent Log Museum:** build once under **BUILD > Structures** for 20 wood, then visit from Build or the title screen. The small display building appears in later runs; its collection is permanent.
- **Four original log collectibles:** Ordinary (common), Twisted (uncommon), Hand (rare) and Figure-8 (legendary). The first felled tree grants the common discovery; later unique finds use provisional odds for playtesting. They are separate from ordinary firewood and cannot be accidentally burned.
- Future run tiers, a later Long Night, and a new Ash-from-firewood formula remain **undecided**, not secretly implemented.

## Camp progression and night spectacles

- **Aurora:** a 20% chance at ordinary nightfall. Glowing sky bands render above nighttime darkness; aurora survival still earns the existing Ash bonus.
- **Shooting Star Parade:** a separate rarer sky event which spawns repeated meteor streaks through the night. Nighttime skies remain purely cosmetic except for the existing Aurora bonus.
- **Wood Axe:** crafted axe now uses a brown carved wooden wedge and bindings; Grandpa's Axe remains metallic.
- **Camp improvements:** the **BUILD** button now includes **Fireplace, Workbench and Log Storage**, each upgradeable twice with wood. The first selection arms a confirmation; tapping again pays wood.
- **First-tier requirement:** improve all three stations to level 1 before the final **Cabin and Hearth** stage. Level 2 upgrades are optional.
- Fireplace tiers strengthen warmth near the campfire and reduce fuel burn. Log storage tiers provide 20 and then 20 more capacity beyond the previous limit. Workbench tiers unlock the **Kindling Bundle** and **Ember Lantern** recipes; a mastered workbench reduces future craft prices by 2 wood.
- The workbench upgrade is also available inside the workbench menu. Built stations change sprite appearances as they improve.
- These are **run-scoped**, not permanent Ash upgrades. Existing saved runs use the same v1 checkpoint key; absent station levels load as zero.

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

## Patch #12 - visual motion and menu polish

- Woodcutting now animates the shoulder, elbow and gripping hand together; the branch/axe pivot follows the wrist through wind-up, impact and recovery without changing chop speed or damage.
- Shoreline wildlife (foxes, rabbits and low-enough birds) now participates in the existing water-reflection pass, alongside the dog and player. A very faint foreground treeline reflection adds depth without duplicating distant mountains or the full sky.
- Title actions are a compact central list. **How to Play** is its own right-side plaque (or H shortcut); bottom-left framed buttons link to [Discord](https://discord.gg/794QQWJEeP) and [YouTube](https://youtube.com/@sekafajigames). Both open only on a user's tap.
- No new gameplay progression, telemetry, fire-noise loops, or save migrations.

## Patch #18 - crafting confirmation, readable arrows, seasonal water

- **Workbench safety**: tap the same craft twice (or select twice with keyboard) before paying any wood. The first tap displays **CONFIRM? / TAP AGAIN TO CRAFT**. Switching items, navigating away or closing the menu clears the pending confirmation, and resources are rechecked at purchase. Existing crafting costs, ids and saves are unchanged.
- **Movement accessibility**: daylight and night movement arrows have a dark one-pixel outline and clear pale centres, so they're readable over bright ground and dark foliage. Existing arrow positions, hitboxes, fade timing and movement controls stay unchanged.
- **Water/reflections**: a more natural scanline reflection distortion with subtle depth fade, restrained broken travelling glints, and season-coloured shoreline wash for autumn/winter/spring/summer. Reflection sources, terrain, wildlife and physics remain untouched.
- Added automated tests for purchase confirmation, cancellation, resource loss between taps, arrow contrast and bounded water calculations. Real-phone screenshot QA remains pending.

## Patch #17 - woodland art and atmospheric depth

- Existing distant forest layers now render deterministic mixed **fir, pine, and broadleaf** silhouettes rather than near-identical triangle columns, preserving their parallax movement, color palettes and reflections.
- Winter broadleaf trees have bare branches; spring growth is compact, summer foliage is fuller, and autumn crowns have broken leaf clumps. Mountain peaks have irregular shoulders and more natural snow ledges.
- Sparse world-anchored ground vegetation changes with the seasons while leaving camp interactables unobstructed.
- Soft sunrise/sunset haze and subtle middle-distance separation improve depth. Campfire lighting has a smoother warm falloff while retaining the original night overlay and fire mechanics.
- All changes are cosmetic. World generation, day length, gameplay movement, collision, saves, audio, UI and assets are untouched. New pure rendering tests check deterministic geometry and layer bounds; phone screenshot quality still requires visual approval.

## Patch #16 - player character art polish

- Fixed side-facing shoes/toes to follow the player's actual left/right facing direction, including the crafted-boot variants. The previous leg geometry did not react to facing direction, making shoes appear backward when walking right.
- Improved alternating steps, leading/rear leg shading, shoe soles and ankle cuffs. Walking arms now reach horizontally as well as vertically, with restrained one-pixel body-weight movement.
- **Unchanged:** idle front-facing pose, articulated chopping swing and branch/axe progression, original pack-cargo sprites and 320×180 gameplay/world coordinates.
- New pixel-geometry regression tests for mirrored foot poses, toe highlights, six chops, both facings and backpacks with 0, 5, 13 and 21 logs. Actual in-browser phone screenshots still require separate visual approval.

## Menu and illustrated guide
- Title subtitle is **FOUR SEASONS. ONE FIRE.** and its central actions fit their actual rows without an empty footer.
- **Shop** replaces the Upgrades title action; Ash upgrades remain functional and use the same saved upgrade IDs/costs. A second, nontransactional **Coming Soon** tab is inactive except for navigation; no payment features or offers.
- **How to Play** is a seven-page visual walkthrough using the game's actual world sprites: movement, fire, wood gathering, workbench construction, crafting, camp expansion and permanent Ash upgrades. Buttons and keyboard arrows/A-D/E step through it; gameplay is not altered.
- A new seven-day seasonal calendar now progresses **autumn → winter → spring → summer** (repeat), changing tree details and three wildlife species per season. Current weather probabilities and survival difficulty deliberately remain unchanged.
- Movement edge highlights fade in/out and soften toward the centre; the river has small back-and-forth shoreline waves with sparse low-opacity foam. See [season design](docs/SEASONS.md).

## Gameplay

- Hold the left/right side of the screen or press A/D to walk. Movement immediately interrupts an unfinished chop (and does not damage the tree). To chop again, release and repress ACT.
- Press ACT or E to chop trees, feed the fire and interact. Hold ACT for repeated chopping while stationary.
- Base capacity is 5 logs; a permanent and a crafted backpack each add 8 capacity, up to 21. The bag has three visual sizes with one small sprite per carried log.
- Start with a branch for chopping; craft the **Wood Axe** (existing save-compatible maul craft ID) at the workbench, or earn the permanent Grandpa's Axe upgrade.
- The first camp stage is now **Wood Ring** (8 wood), a visible timber windbreak with the original wind-protection effect; tree sprites have detailed layered silhouettes and winter-only snow caps.
- The player turns toward the camera when idle, with a two-eye face, and retains visible facial detail when moving left.
- Fullscreen is responsive, with CSS immersive fallback on browsers lacking the fullscreen API and safe-area-aware canvas fitting.
- Gather 15 logs for each initial workbench/pile site, then craft boots, pack and other gear at the bench. Build a camp, survive seasonal days and the Long Night, and earn ash for permanent upgrades.
- Menus include settings, credits, a privacy policy, audio mixer, High/Low visual effects, and a two-step save reset.
- An unfinished run can be continued from the title menu after reopening the browser. Completed runs bank earned ash and clear the checkpoint. Win/death/retirement results now offer **Main Menu** without banking rewards again.

## Professional foundation - modularization phase 2

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
- `src/game/game.ts`: **preserved world simulation, remaining scene rendering, and in-canvas UI** - still being separated in small, tested patches
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
