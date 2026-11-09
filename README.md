# Sekampfire

**Future designs and brainstorming:** [Ideas and Design Decisions](docs/IDEAS.md). This is a planning document, not a list of implemented features.

## Patch #37: Handcrafted living thermometer HUD

- **Real-looking ambient air thermometer:** the center wooden HUD panel is now a dedicated original 320x180 pixel-art instrument: carved "AIR TEMP" label, brass tube and bolts, glass glints, bulb reservoir, engraved tick marks and a Celsius reading with a custom degree glyph.
- **Beautiful but restrained motion:** colored liquid smoothly settles as the real world changes between seasons, day/night and weather; small glass glints and subtle frosty/honey accents bring the instrument to life.
- **Outside temperature isn't your personal Cold meter.** Gear, fire and Ash upgrades don't change displayed °C, while the hidden environmental Cold pressure still controls actual warmth drain. No weather, survival rate or save-version changes were made.
- **Clean HUD:** the left panel again shows only spacious Warmth and Fuel meters. Removed WOOD and RUN ASH from the center panel entirely. Wood remains available via Build/Craft interactions while the real inventory is planned. Run Ash remains visible in the Pause menu and end-of-run screens.
- **No new image assets, overlays or UI hit zones.** Pixel details stay inside the existing 105x23 central panel with translucent wood framing.
- Thermometer animation state is temporary and recalculated on loading existing runs; old version-one saves remain compatible. Real Android appearance still needs screenshot review.

## Patch #36: Cold exposure, rain dampness and Warm Boots

- **Cold is exposure pressure, not another health pool.** The top-left translucent HUD now shows WARMTH / FUEL / COLD in its original 109x23 panel, without covering any additional world scenery.
- A single environmental Cold calculation now drives ambient warmth loss. Clear daylight is mild, nights colder, rain/wind/cold snaps/blizzards raise pressure, and winter adds modest seasonal exposure. This **replaces** the previous direct storm damage bonuses to avoid stacking penalties twice.
- **Rain gradually increases dampness** when outdoors; shelter under the existing Lean-to and standing near a lit fire help dry the player. Dampness contributes to Cold rather than introducing a third meter.
- Existing craft **Warm Boots** now reduce Cold by 12 exposure points, retaining their original walking-speed advantage and saved item ID.
- **First night is gentle** (clear or windy only) to leave room to learn travel and camp management. Grooty briefly explains the new Cold bar at first nightfall.
- Warm Blood, torch protection, cabin insulation and eight-second gradual fire warming remain intact. Existing weather fuel consumption rules are unchanged.
- Optional `cold` and `dampness` fields extend the existing version-one run checkpoint; older checkpoints derive safe starting exposure without losing progress.
- Actual standalone snow weather, advanced clothing/inventory and the full Level/Milestone/Mission campaign remain separately planned rather than quietly added in this patch. Android visual readability and survival balancing still require human playtesting.

## Patch #33: Grooty's fireflies and progressive fire warmth

- **Fire warmth absorbs over time:** staying near a lit fire gradually increases recovery from roughly +2 to +8.5 warmth/s over 8 seconds before cold drain; brief walks away smoothly lose the buildup, and the Log Bench / Fireplace upgrade bonuses still apply.
- **Contextual firefly guide:** a tiny yellow-green firefly cluster and bobbing pixel arrow highlights only Grooty's next unfinished task, drawn from the current tree, camp post, fireplace, storage, workbench or interface state. Distant targets have a minimap marker.
- **Menu guidance:** once resources are ready, the same marker can lead into BUILD, its proper tab and specific upgrade/structure row, or the workbench's Tools/Timber Pack recipe. All markers are decorative and introduce no new touch zones.
- **Level 2 teaches storage before expansion** while preserving the existing five-level run-local structure. Grooty's dialogue remains the complete objective list: no extra HUD banner.
- **Settings > Guiding Fireflies:** on by default, can be switched off. The preference persists under the original metadata key, and heat soak resumes from existing v1 run checkpoints without a save version change.
- Original programmatic 320x180 pixels only, no external game art or change to Ash/balance beyond warmth.

## Patch #32: Modal controls, fence clarity and translucent HUD

- **Strict modal input:** an open menu consumes all taps inside its own panel, and never sends them to buttons on the title screen or gameplay behind it. Only tapping outside the panel, its explicit X/Back control, or the keyboard Escape/Back closes it.
- **Independent mode help:** locked Endless Night continues to open its own Coming Soon explanation; the How to Play button cannot activate through this modal.
- **Cleaner fence posts:** widened real-tree exclusions to account for canopy width. Wood drops near physical fence markers are moved just outside the fence without changing resource quantities; cleared expansion trees also drop ordinary collectible wood beyond newly claimed ground.
- **More transparent top UI:** lighter translucent charcoal panels retain the pixel-font contrast and wooden framing while allowing more of the scenery to show.
- No changes to Ash, tutorial levels, pet behavior or survival difficulty.

## Patch #31: Claim and expand your camp

- **First Camp:** Grooty teaches you to chop a tree, place one real log at the western boundary post and one at the eastern post. When both are built, a handcrafted wooden palisade appears behind the camp.
- **Building gate:** Structure construction and station improvements become available after the two posts are built. Lighting the starter campfire remains possible while claiming land.
- **Eastern expansion:** in tutorial Level 2, spend five actual logs at the eastern expansion marker to extend the palisade and clear more territory. Trees stop respawning inside claimed land, and existing trees within newly claimed ground become ordinary wood pickups.
- **Camp organization:** Grooty, workbench, fire and storage remain near the center; the permanently collectible Log Museum is moved into the eastern expansion and unlocked for purchase there. Already-owned Museums remain owned and visitable.
- **Run-local:** fences and expansions reset each new run. Version-one run checkpoints keep progress, and previously upgraded/crafted camps from older saves are grandfathered into the first fence without losing buildings.
- **Visual:** original procedural pixel fencing, pointed varied planks, timber crossbeams, posts and subtle cleared ground. All drawn behind existing camp objects, player and wildlife. No collision changes or imported game graphics.
- Real-device Android appearance and tutorial pacing still need playtesting.



A cozy survival pixel-art game built with Canvas 2D, React and TypeScript. Gather wood, keep the fire burning, build a camp and survive the Long Night.

**Play:** https://sekafaji.github.io/Sekampfire/

## Patch #28: Endless Night mode preview (locked)

- The title screen now has a subdued **ENDLESS NIGHT** button directly above **HOW TO PLAY**.
- Tapping it opens a short **COMING SOON** explanation for a possible future standalone survival mode. It does not start gameplay, unlock content, spend Ash or modify saves.
- The existing campaign, its finite Long Night finale, the win/bank choice and optional **Continue Surviving** are unchanged. Endless Night is a separate mode proposal whose rules are still being designed.

## Patch #29: Real-game HUD refinement

- The gameplay minimap is now a **thin, full-width wooden-framed strip**, still driven by the actual world, trees, player, camp structures and fire.
- **Three compact resource panels** sit directly below the map: warmth/fuel, wood/Run Ash/storage, and day/weather/season with Menu.
- The existing **single top-center message** and Grooty `?` shortcut keep their previous interaction positions while picking up warmer colors to match the HUD.
- **Build / ACT / Torch controls** get a restrained wood-and-charcoal pixel-art finish; their mobile touch hitboxes stay exactly the same.
- Drawn with Sekampfire's existing 320x180 canvas renderer and pixel font. No generated scenery, replacement game sprites, gameplay balance changes or save migration.
- Automated geometry checks cover the minimap and control positions; final Android visual approval is still needed.

## Patch #27: Grooty and cleaner gameplay messages

- **Cleaner screen:** the 203×25 always-visible tutorial objective banner is gone. The small `?` button below the resource HUD opens the same guide, and talking to Grooty in the camp still shows every tutorial task.
- **Top-center events:** tree chopping, gathering, crafting, level milestones and other brief messages appear in one narrow, fading status strip just below the main HUD. Messages queue rather than stacking over the player; long lines wrap within the panel.
- **Grooty name:** every displayed reference to the stationary friendly guide tree has been updated without modifying existing progress keys or resetting saves.
- **Scope:** no changes to building requirements, Ash earnings, Dog, Museum or the Long Night.

## Patch #26: First Camp tutorials and Grooty

- **Five levels per run:** First Flame, Log Storage, Tools of the Trade, A Warmer Home and the Homestead. The current objective is tracked during gameplay and can be expanded into a checklist.
- **Grooty:** a friendly talking tree with a face stays beside the camp to explain the next task. Approach the tree and press ACT, or tap the small ? button to see its advice.
- **Runs reset to Level 1:** progress in the five lessons is not permanent. Existing permanent Ash purchases and the Museum remain permanent; future Camp Legacy Ash upgrades will be designed separately.
- **Long Night:** after the final cabin, the existing one-night finale and Bank/Continue choice remain unchanged in this foundation patch. A separate optional Endless Night mode is only a locked preview for now.
- **Museum:** no title-menu entry. Build the permanent collection hut inside the camp and use ACT to visit it; existing collections are not lost.

## Permanent progression, companions and log collecting

- **Finish / continue:** After surviving the Long Night, choose **End Run & Bank Ash** or **Continue Surviving**, which retains unbanked Run Ash. Victory choice persists across checkpoint reloads. Menu > End Run requires confirmation. Existing Ash earning rates and the Long Night trigger have not been changed.
- **Ash clarity:** Run Ash is earned during the current run; Banked Ash is persistent Shop currency. Banked Ash stays safe through future runs.
- **Shop:** **Upgrades / Pets / Coming Soon** with the close button above the three tabs. Owned Good Dog remains on the original `up.dog` permanent save key and can be equipped/unequipped through Pets.
- **Dog:** follows the player, carries at most **2 actual dropped logs**, deposits them in wood storage or hands them to the player, and never creates wood from nothing. Cargo and position persist with run checkpoints.
- **BUILD / CRAFT:** Build uses **Structures / Upgrades** tabs; the workbench uses **Tools / Supplies**.
- **Permanent Log Museum:** build once under **BUILD > Structures** for 20 wood, then visit from Build or the physical camp building. The small display building appears in later runs; its collection is permanent.
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
