# Sekampfire — outstanding requests and quality backlog

## Patch #49 - Bingsu visual and movement reconstruction
- [x] Rebuild Bingsu's in-world white Dogo Argentino silhouette at realistic small native-pixel proportions compared with the player.
- [x] Use one mirrored pixel-art sprite for both directions, with stable paws, grounded shadow, gentle breathing, tail wag, and visible two-log carry pose.
- [x] Change walk animation to advance from actual world movement, never arbitrary global timer stepping while idle.
- [x] Make Bingsu follow the player's actual position with a relaxed proximity band rather than snapping across the player when facing direction flips.
- [x] Keep a short real-world pickup leash; only travel to the Log Storage when the player is near camp; never fabricate or destroy logs.
- [x] Preserve dog pickup cargo, 40-Ash unlock, existing pet equip data and v1 checkpoint compatibility.
- [x] Add new proportion, mirror, gait, follow, log-transfer and old-save tests.
- [ ] Check actual phone landscape proportions, walking and turning, night silhouette and two-log carry visually. This still needs device QA.

## Proposed follow-up patches from approved roadmap
- [ ] **Patch #50 - Inventory & equipment:** a side-by-side backpack with dedicated AXE and PET equipment slots. Permanent starter Stick as fallback; equip/unequip an owned axe or Bingsu from Inventory, while keeping the existing quick slots. Persistent pet state and equipment migrations.
- [ ] **Patch #51 - Ash Shop:** replace the plain list with original pixel-art upgrade boxes, one selectable card, detailed effects at the bottom and a distinct BUY confirmation button. Pets become unlock-only in Shop, while equipping occurs in Inventory.
- [ ] **Patch #52 - Wood & fuel:** data-driven species definitions, random Pine Log fuel value 5-20 at the moment of burning, keep wood stacks as materials. Verify early-run balance and ensure rare Museum collectibles remain separate.


## Patch #48 - No phantom camp lights; every fence corner; storage Take button
- [x] Remove two unearned max-level camp "window" light sources and three invisible mid-fence spotlights; night illumination comes only from actual lit fires and torches.
- [x] Keep the original east junction post visible and buildable after camp expansion while adding a third outer-east post and independent 7-dawn torch.
- [x] Keep previously built inner east torches in place when expanding in an active P48 run. Migrate already-expanded P47 saves' old right torch to the outer post to preserve its original position, with no free second torch.
- [x] Keep torch warmth shelter proportional to the actually lit adjacent fence sections; the new expansion isn't fully protected until its outer endpoint is lit.
- [x] Add a third translucent bobbing **TAKE** circle in the center when Log Storage contains wood; left default ACT/STORE and right UPGRADE are still separate actions.
- [x] Show exact stored logs and real pile capacity beneath Log Storage and in the nearby-world label.
- [x] Test all three torch locations, night light source list, save migration, expired lamps, Store/Take and carrying limits.
- [ ] Check on a real Android phone in nighttime rain, winter and at camp level 6; visually verify there are no lit patches without visible flames, especially after expanding the fence.
- [ ] Check third storage circle legibility, count visibility and one-tap TAKE with mixed carried/stored logs on a landscape touchscreen.


## Patch #47 - Pocket Ash Shop, ambient cold, Museum unlock, fence torches and opacity
- [x] Make Ash a single-line small panel directly under MENU; tapping it opens the real banked-Ash Shop rather than banking Run Ash.
- [x] Remove Toolbar from the pause menu, while keeping equipment quick slots and Inventory assignment.
- [x] Make genuinely colder local ambient Celsius increase Warmth loss using the existing Cold pipeline, with a bounded factor and no unrelated reset.
- [x] Prevent unusual/rare/legendary Museum Log discoveries until the real permanent Museum is constructed. Ordinary log and historical collectible ownership survive.
- [x] Build one torch at each real finished fence post for 2 carried Pine Logs, lasting seven dawns each and expiring visibly; both active posts shelter the claimed interior, one post shelters locally.
- [x] Add gently cool-toned night illumination to the fence posts, distinct from the warm Campfire. Keep the lighting effect within a smaller radius.
- [x] Save independent torch timers in the unchanged v1 run snapshot, compatible with old saves, and preserve normal fenced expansion behavior.
- [x] Lower HUD, control, shop/inventory/guide/menu overlay opacity without making game controls decorative or unclickable.
- [ ] Test the extra night lighting and warmth protection in an actual Android landscape run, including seven-dawn torch expiry, high cold pressure and expanded fence.
- [ ] Verify new HUD/Shop single-line panel, all modal text contrast, and sunlight/season scenery behind buttons on a phone.


## Patch #46 - Explicit station selection, floating circular controls, right Ash
- [x] No station bubbles appear on proximity alone. First ACT on a finished station selects it; second ACT performs the primary action. While selected, ACT continues using the default action without opening a generic panel.
- [x] Replace opaque rectangular station buttons with translucent rounded pixel-art buttons, short labels and a restrained vertical bob. Touch regions and Grooty's goal markers follow the same animated geometry.
- [x] Move Run Ash from beneath the Weight plaque to a dedicated right-aligned panel immediately under MENU; keep kg weight unchanged.
- [x] Clear station selection and pending upgrade confirmation on departure or opening/closing other menus; keep these transient fields out of v1 saves.
- [x] Keep existing two-tap station upgrade spending and original Workbench detailed crafting/blueprint lists.
- [ ] Real Android landscape check: circle visual contrast by season/time/weather, reachable touch targets, ACT tapping twice, campfire firelight and Ash stack over the world.
- [ ] Retire legacy station modal helpers after real-device signoff, if they are truly no longer necessary.


## Patch #45 - Proximity station actions, weight HUD and backpack button
- [x] Show an always-visible dedicated bottom-right pixel-art inventory button; remove redundant Pause Inventory entry while preserving the I key.
- [x] Display real kg weight instead of occupied inventory stack slots, without changing Pine Logs (1 kg each), 5/13/21 kg capacities, or earned Ash.
- [x] Show the real station's main and upgrade actions automatically on approach, without opening the old station overlay from ACT.
- [x] ACT and primary icon trigger the same existing action. Upgrade arrow uses existing wood cost and double-press confirmation. Workbench has a third in-world Plans button.
- [x] Preserve Workbench recipe/plan menus and exact fireplace, storage and station upgrade effects.
- [x] Relocate Grooty's firefly guidance to the real nearby buttons.
- [ ] Test all interaction bubbles, the weight HUD and bottom-right bag position on an actual Android landscape display with both touch and keyboard.
- [ ] Consider retiring the now-unreachable legacy station overlay helpers and old modal tests in a dedicated cleanup after device verification.


## Patch #44 - Level 1 completion and Ash banking
- [x] New campaign runs enter a dedicated pending victory screen on completion of The First Settlement's third milestone. Old run checkpoints stay on the former five-guide-group/Long Night path.
- [x] Record real Run Ash reward sources for dawn, aurora, structures and station improvements; attribute unknown older balances honestly, with no fabricated completion payout.
- [x] Explicit bank action unlocks Level 2, deposits pending Run Ash once and returns with replay/Shop/Main Menu actions. No bank on just seeing the win dialog.
- [x] Add optional run save fields and permanent unlock plus durable banking receipt; preserve v1 checkpoint identifier and Shop purchases.
- [x] Title shows Level 2 unlocked, clearly **COMING SOON** because playable Level 2 missions are not yet shipped.
- [ ] Validate portrait-safe landscape Android completion screen, resume across app/browser restart, no double-bank after repeated taps, and Ash Shop transition on real hardware.
- [ ] Patch #45: implement playable Level 2 mission architecture, Ash farming goals and deliberate in-game Ash Shop access. Define whether/how permanent starting structures are earned before coding.
- [ ] Revisit classic Long Night access for fresh campaign runs as campaign chapters expand, preserving the finite original challenge and old checkpoints.


## Patch #43 - First Settlement milestone foundation
- [x] Introduce three named Level 1 milestones in Grooty's dialogue while retaining old run-local five-group tutorial completion and all legacy save keys.
- [x] Require a physical ACT conversation with Grooty as the first mission.
- [x] Add a visible Pine Grove landmark beyond the east camp fence, night-only visit, physical return home, dawn completion and a retry path for missed nights. Guide fireflies navigate out and back.
- [x] Persist scouting and conversation flags in the v1 run save; completed legacy guide groups remain completed.
- [x] Prevent a long milestone checklist from colliding with the guide modal's hint/status area.
- [ ] Android and actual gameplay QA: night scout survival timing, Grove marker readability, 320x180 dialogue scrolling and checkpoint resume on a device.
- [ ] Next #44: real campaign level completion, clear banked/run Ash summary, permanent unlocks and Level 2 entry. Existing additional cabin Camp Challenges are retained during the transition and their destination needs explicit design before replacement.


This is a tracked product backlog; **not completed merely because it is documented**. Keep source-verified implementation and phone-tested behaviour separate. Prioritize these after Clean Foundation is confirmed stable.

## Priority 0 - user-approved unfinished features / fixes
- [x] Patch #42: remove remote BUILD (Pause and B shortcut); Workbench-local building plans, first structures still built from physical sites, local station ACCESS/UPGRADE and optional BUILD PLANS pixel popups, two-step station upgrades, Grooty guidance retargeted, storage and fire interactions conserved, v1 save-compatible tests. Android screenshot/gameplay QA pending.
- [ ] Follow-up: validate small station popups and fire interactions on Android, especially when surviving a cold night; consider allowing a lightweight rapid stoke interaction without exposing remote upgrades.
- [ ] Later: complete campaign Level / Milestone / Mission structure with end-of-level Ash banking, mission durations and permanent prebuilt Ash upgrades; not part of #42.
## Priority 0 - user-approved unfinished features / fixes
- [x] Patch #41: two compact square native-pixel toolbar slots with touch-friendly zones, craftable reusable Ember Torch assigned directly from Equipment or picker, compatible older Ember save keys, Bingsu the Dogo Argentino shop profile and white in-world sprite, Grooty's 5 current tutorial groups reworded as numbered missions. Device QA pending.
- [ ] Next #42: remove BUILD from pause (and direct remote B shortcut), place first construction at actual physical worksite, open new building plans through completed Workbench and implement each built structure's local ACCESS/UPGRADE popup with confirmation. Retarget Grooty's fireflies to physical sites/popups.
- [ ] Future: expand Bingsu's companion traits and potential defense mechanics only after gameplay risks and balancing are designed; he currently fetches real logs and stays near his person.
## Priority 0 - user-approved unfinished features / fixes
- [x] Patch #40: MMO-style native backpack/equipment window, interactive 5x4 slot grid and item inspector, original icons, HUD/keyboard/Pause inventory access, canonical Pine Logs stack, legacy wood adapter, separate slot-count and weight capacities, crafted gear and version-one run migration. Android visual QA pending.
- [ ] #41: smaller square quick slots, actual inventory assignment and crafted Torch; retain existing Ember until real item ownership is established.
- [ ] #42: Build only from physical camp sites and Workbench, station-local ACCESS/UPGRADE popups, confirmation and updated Grooty wayfinding.
## Priority 0 - user-approved unfinished features / fixes
- [x] Patch #39: four compact top HUD panels (Warmth/Fuel, smaller local °C | weather instrument, interim INV wood carry / Run Ash, Day/Season/Menu). One thermometer smoothly follows nearby fire heat without changing existing Cold survival mechanics. Android layout QA pending.
- [ ] Next #40: actual MMO-style inventory slots/stacking, Pine Logs/Pine Trees, equipment categories, inventory UI opened from HUD; replace temporary wood-based INV capacity readout with actual slots.
- [ ] Next #41: shrink two quick slots to square pixel-art equipment sockets and assign real usable inventory items.
- [ ] Next #42: remove BUILD from Pause, construct only at world sites / crafting station, implement physical ACCESS/UPGRADE popups with confirmation, and retarget Grooty guidance.
## Priority 0 - user-approved unfinished features / fixes
- [x] Patch #38: wider, polished thermometer; state-driven settlement minimap with fences, expansion, actual building sites and completed stations; two run-saved configurable quick slots replacing BUILD/TORCH, long-press assignment for existing Fire Ember, Build via pause menu, re-targeted Grooty guidance. Device visual QA pending.
- [ ] Next: real multi-resource inventory, Pine Logs/Pine Trees, collectible/craftable Ember Torch item and additional assignable active tools. Only existing Fire Ember action is assignable in #38.
## Priority 0 - user-approved unfinished features / fixes
- [x] Patch #37: bespoke animated brass/glass pixel-art outside-temperature instrument replacing wood/Ash stats in the middle HUD, spacious Warmth/Fuel on left, ambient season/day/weather °C independent of personal Cold; run-save compatible, source pixel-geometry tests. Android visual review pending.
- [ ] Next UI idea: proper multi-resource inventory then two assignable quick slots replacing persistent Build/Torch buttons, with long-press picker and safe contextual menu access. Not part of #37.
## Priority 0 - user-approved unfinished features / fixes
- [x] Patch #36 source: compact 3-row WARMTH/FUEL/COLD panel, rain dampness, smoother single-source Cold-driven warmth loss, existing boots insulation, progressive fireplace warming compatibility, gentle first night, Grooty explanation, optional Cold/dampness v1 save fields, deterministic tests. Real Android balance and UI QA pending.
- [ ] Future weather phase: separate snow weather event (beyond existing winter particles), level-controlled storm scheduling, later protective clothing and inventory; not part of #36.
## Priority 0 - user-approved unfinished features / fixes
- [x] Patch #33: 8s gradually accelerating fire warmth, saved heat soak, Grooty firefly/arrow wayfinding across world, minimap, BUILD/Craft tabs and rows; persistent guide visibility toggle; reorder storage before eastern expansion. Real phone visual testing, readability and balance still pending.
## Priority 0 - user-approved unfinished features / fixes
- [x] Patch #32 source: strict modal hit-zone isolation and inside/outside/X/back behavior, no title/game click-through, translucent wooden top HUD, wider tree-canopy spawn exclusion and wood pickups relocated off posts without losing resources. Regression tests included; Android visual QA pending.
## Priority 0 - user-approved unfinished features / fixes
- [x] Patch #31 source: two one-log claimed boundary posts, palisade behind camp, eastern five-log expansion, relocated Museum, claimed-ground no-respawn trees with existing trees converted into regular pickups, Grooty levels 1-2 integrated, v1 checkpoint-compatible old-run protection. Native device visual and pacing QA pending.
- [ ] Later: Ash Camp Legacy upgrade preserving fence and expansion across runs; not introduced in this patch.

- [x] Patch #30 source: fix overlapping lock and double-drawn ENDLESS NIGHT title label by drawing the button exactly once with separated icon/text spacing. Preserve the Coming Soon popup and original touch zone; pixel-geometry regression test added. Phone visual QA pending.

- [x] Patch #29: source-based HUD refresh at 320x180. Live full-width framed minimap, three compact resource panels, wooden in-water buttons, warmer Grooty shortcut and queued notification strip. Touch hitboxes and gameplay preserved; added render geometry tests. Phone screenshot QA remains pending.

- [x] Patch #28: locked ENDLESS NIGHT preview added directly above How to Play in the title-screen right-side controls. Click opens Coming Soon explanation with keyboard/touch close; no new gameplay mode, save keys or Ash costs. Source tests added; phone layout QA still required.

- [x] Patch #27: rename Grooty across visible dialogue, world labels and tutorials; replace persistent objective panel with a tiny ? shortcut and use one queued top-center fading message strip for temporary events. Source tests added; real Android visual QA pending.

- [x] Patch #26 source: five real run-scoped tutorial levels with optional guide HUD access, fixed talking-tree guide Grooty with ACT dialogue and dynamic hints, Museum removed from title actions but retained as camp building. Version-one run checkpoints store objective counters; new runs reset to Level 1. Automated tests added; Android browser playtesting still pending.
- [ ] Future optional separate **Endless Night** game mode: concept not finalized. Keep the current finite campaign Long Night and its Bank/Continue choices as-is. The menu preview is intentionally locked until a later design decision.
- [ ] Later: Ash-funded Camp Legacy upgrades preserving actual station levels between runs. No permanent tutorial level unlocks.

- [x] Patch #23: compact dynamic title menu, separate Shop header and Upgrades/Pets/Coming Soon tabs, compact Build Structures/Upgrades and Craft Tools/Supplies tabs, banked vs pending Ash labels, Long Night victory choice to bank or continue and resume safe checkpoint. Source-tested; phone QA pending.
- [x] Patch #24: Good Dog retains ownership, moves into Pets for equip/unequip, follows, carries up to 2 actual world-drop logs, deposits to storage/player and persists cargo. Source-tested; device gameplay QA pending.
- [x] Patch #25: four permanent uniquely shaped collectible logs, constructed permanent Museum building, collection persisted separately from run resources, no loss of ordinary wood; provisional odds. Tests source-only, device quality QA pending.
- [ ] Later brainstorm: firewood-based Ash earning/balance and long-term Museum duplicate uses. Do not change formulas without agreement.

- [x] Patch #21: bright visible aurora at 20% chance per ordinary night, meteor parade for repeated night-long shooting stars and carved wooden Wood Axe sprite; source-tested, phone QA still pending.
- [x] Patch #22: real two-tier upgrades for fireplace, workbench, log storage; requires all three level one before final cabin. Kindling and lantern recipes unlocked at workshop levels. Source tests plus save compatibility; on-device balance and visuals still require QA.
- [ ] Playtest newly extended cabin progression: check time-to-finish, wood gathering burden, feeling of station upgrade rewards, old saved runs, and pacing of tier-two optional goals.

- [x] Redesign main title: four-season subtitle, tighten dynamic menu, SHOP label, preserve main actions and social links.
- [x] Functional Shop with existing permanent Ash upgrades and a neutral inactive Coming Soon tab; no premium/payment hint.
- [x] Replace text-only How to Play with seven illustrated real-sprite steps and touchscreen/keyboard paging (device QA still pending).
- [x] Four-season calendar: **seven completed in-game days per season**, autumn/winter/spring/summer, with season-specific palettes and tree details. **Weather/difficulty seasonal rebalance is not yet implemented**.
- [x] Seven-day season-specific wildlife spawns and original pixel sprites (12 distinct wildlife species); ambience-only, no gameplay balance impact.
- [x] Movement pressed-edge feedback: 15% spatial gradient and short ease-in/fade-out; phone QA pending.
- [x] Patch #19: daytime **pressed** chevrons change from yellow to charcoal; idle hints and lighter nighttime arrows remain unchanged.
- [x] Patch #20: corrected the remaining yellow **pressed-side gradient** to a soft charcoal wash, and replaced its active arrow's warm outline with cool grey. Both sides retain 15% width and fade timing; mobile visual QA pending.
- [x] Waterline waves advance/recede 1–2 logical pixels, with sparse translucent foam and no full-width white line; phone QA pending.
- [x] **End screen navigation**: win, death and retirement offer Main Menu with no second ash banking, plus keyboard shortcut M. Needs mobile tap verification.
- [x] **Adaptive fullscreen source implementation**: measured 16:9 canvas, safe-area insets and immersive browser fallback. **Real Android/iOS viewport testing still required** before declaring device-perfect.
- [x] **Player camera-facing idle in source**: character faces camera when not moving/chopping, with breathing/blinking/scarf animation; still requires phone visual QA.
- [x] **Left-facing eye in source**: mirrored facial details and hair; needs native-resolution screenshot QA.
- [x] **Character Art Polish #16 source**: right/left-facing shoes, toes and soles now mirror, legs alternate by direction, crafted boots use visible toe and cuff, body and walking arms follow gait. Added unit tests for both facings, 0/5/13/21 logs, idle and chopping. Native 320x180 screenshot approval remains outstanding.
- [x] **Tool appearance/progression**: starter branch -> renamed Wood Axe (`maul` original save ID and 5-wood cost/chop-speed bonus) -> Grandpa's Axe (`axe` upgrade); overhead swing added. Needs real-device quality check.
- [x] **Wood Ring source update**: stage name, timber windbreak art and description now agree; original 8-wood cost and wind-reduction mechanic preserved. Needs phone screenshot QA.
- [x] **Detailed procedural trees in source**: separate anchored renderer with three evergreen silhouettes, bark, branches, shading and winter-only snow; tests for geometry/season. **Final premium art quality still requires visual approval on real devices**.

## Priority 1 — visual/audio polish requests
- [x] Patch #18 workbench crafting requires second tap / second keyboard activation before wood is spent; changes of item or menu cancel confirmation (source-tested).
- [x] Patch #18 day/night chevrons use pale fill with dark pixel outline for visibility across skies/forests (source-tested; needs phone QA).
- [x] Patch #18 season-coloured shoreline and broken reflection glints, with bounded fade and unchanged water world geometry (source-tested; needs phone QA).

- [x] **Wilderness art polish #17 (source)**: mixed pine/fir/broadleaf forest silhouettes, mountain peaks, season-aware distant foliage, sparse ground cover, horizon haze and smoother firelight. Tests verify geometry; phone visual approval remains outstanding.
- [ ] Review actual 320×180 captured frames for all seasons at dawn/day/night across meadow, forest and mountain regions; tune tree density and haze based on screenshots.

- [ ] Season-specific weather odds and distinct survival difficulty (optional future design decision; do not change without explicit approval).

- [x] Include visible near-shore wildlife in the water reflection and add faint near-treeline reflection without strongly mirroring mountains or sky. Verify on phone.
- [x] Compact main menu; move How to Play to its right-side plaque and add separate bottom-left Discord/YouTube buttons with exact project links. Verify touch layout on phone.
- [ ] Validate on real devices: revised tree pixel art, Wood Ring, backpack logs at 5/13/21 and player sprite alignment. Iterate toward premium art quality after screenshot review.
- [ ] Fix/polish mobile fullscreen HUD layout, menu placement, font hierarchy, user touch hitboxes and water buttons.
- [ ] Inspect reflection player alignment, water bottom seam and shoreline in day and night on actual mobile displays.
- [x] Arm and wrist now follow the branch/axe swing in both facings; animation timing has regression coverage. Continue visual polish after on-device inspection.
- [ ] Refine action sound quality/volumes. Keep harsh static-like fire loops disabled unless a properly produced fire recording has been evaluated.
- [ ] Refine animal/world ambiance and tree movement only after art/source inspection; avoid feature creep.

## Priority 1 — engineering and release foundation
- [ ] Continue separating `src/game/game.ts` into world/, scene/ and UI/ modules. Input, save serialization, font, seasons, render helpers, sprites and audio are now extracted.
- [ ] Expand integration coverage for wood drops, crafting/upgrades and permanent ash settlement. Chopping interruption, save corruption, legacy fallback and snapshots now have tests.
- [ ] Add Playwright screenshot/input tests for title, run, night, win, loss, pause, audio/settings and resume; confirm pixel art and HUD positions.
- [ ] Add real Android browser performance, audio/gesture and viewport test matrix; then decide when to create Capacitor native projects.
- [ ] Complete release/asset licensing, acknowledgements, privacy/data safety and store publishing checklists before submission.

## Already implemented in previous patches (still needs device QA)
- [x] Movement cancels unfinished chopping, maintains completed tree hits, blocks ACT until release.
- [x] Base 5 logs; two separate +8 backpack upgrades; three bag sizes and per-log marks.
- [x] Press feedback limited to outer 15% of each side without duplicate arrows.
- [x] Remove fake static fire ambience; use light action sound effects with audio controls.
- [x] Saved unfinished runs with Continue and explicit two-step reset; privacy and credits pages.
