# Sekampfire — outstanding requests and quality backlog

## Patch #63 - higher-contrast Ash Shop and growing 500-fuel campfire
- [x] Make Ash Shop less transparent without darkening the entire gameplay HUD.
- [x] Remove redundant "C: CATEGORY - BANKED ASH ONLY" footer and use space for a third benefit line.
- [x] Clarify Camp Legacy's genuine prebuilt structures versus distinct station Mastery, with accurate next-level descriptions.
- [x] Label "COLD PROT" and explain its role in reducing environmental warmth drain.
- [x] Add 8 permanent +50 fuel-capacity tiers: 100 initial up to 500 maximum, with real prices, saving, icon and shop scrolling.
- [x] Scale actual fire shelter radius, warmer local air, flame size and direct warmth gain with real fuel amount; preserve 100-fuel baseline.
- [x] Keep Pine Log fuel consumption, Old Flint, old run checkpoints, item economy and banking authoritative and compatible.
- [x] Expand tests for fire capacity, full fuel bars, Shop readability and old save migration.
- [ ] On-device review: fire flame proportions at 500 fuel; Shop opacity and longer selected-card benefits.
- [ ] Balance: 500-fuel storage and high-intensity warming against the 5-20 fuel Pine Log roll and overnight survival economy.
- [ ] Next progression focus: playable Level 2 missions.

## Patch #62 - independent permanent camp mastery upgrades
- [x] Hearth Mastery: permanent level 1/2 station tiers on fresh runs, with existing fuel and warmth effects.
- [x] Fence Reinforcement: +8/+16 Cold protection within real established fence boundaries, including expanded land.
- [x] Workshop Mastery: pre-owned station tier 1/2 for the physically built Workbench, no free station.
- [x] Storage Mastery: pre-owned station tier 1/2 for real Log Storage, no free logs or station.
- [x] Reuse existing Save v1 camp tiers, record the run-specific fence tier and avoid retroactive mutation when buying during a run.
- [x] Add four pixel-art Shop cards to the left-sidebar CAMP filter, preserving single BUY, touch scrolling and prices.
- [x] New regression tests for costs, progress, UI overflow, old saves, Cold protection and station-level effects.
- [ ] Landscape Android visual QA, especially third-row Shop scrolling, icon clarity, and full winter shelter balance.
- [ ] Next: playable Level 2 campaign missions and progression, with the newly expanded permanent upgrade economy.

## Patch #61 - permanent backpack tiers and clothing protection
- [x] Change Big Backpack to five permanent Ash levels at +5 kg each; keep crafted Timber Pack's +8 kg independent.
- [x] Keep old owned levels and banked Ash in the same permanent save schema, with five real prices.
- [x] Extend run snapshot hydration and real Pine Log inventory sanitization to 38 kg maximum.
- [x] Implement one Cold protection stat from +12 crafted boots, +15 permanent scarf, and +5 when equipped Bingsu is nearby.
- [x] Remove Everwarm Scarf's old ember-duration effect and update Shop benefits, pet/boots descriptions and Inventory PROT display.
- [x] Update regression expectations and introduce direct new upgrade/cold/save tests.
- [ ] Playtest winter and blizzard balance, after earning the scarf and pet, on landscape Android.
- [ ] Next patch: standalone Hearth/Fence/Workshop/Storage permanent upgrades, subject to design review.

## Patch #60 - categories on the left + compact 4 x 2 Ash upgrade grid
- [x] Group the existing permanent Ash upgrades using a left sidebar: ALL, SURVIVAL, GEAR and CAMP. Preserve the separate main Upgrades / Pets / Coming Soon tabs.
- [x] Fit two complete rows of four **41x41 pixel squares** inside the existing native-resolution Shop instead of one 59x59 row.
- [x] Each small tile keeps its original icon, an untruncated short name, the owned level/MAX and a clear progress strip. The selected upgrade's full name, benefits, price and only BUY action stay in a fixed compact bottom inspector.
- [x] Keep touch drag/momentum, desktop wheel/trackpad, mouse-safe clipped cards, and keyboard navigation for categories containing more than eight items.
- [x] Category changes reset temporary scroll and selection, but never modify purchased upgrades, saved ownership, Ash balance or active runs.
- [x] The Bingsu pet tab, her approved portrait, the Old Flint upgrade and Camp Legacy are unchanged.
- [x] Add category, geometry, real BUY, keyboard/touch/scroll, safe-hitbox and save-preservation regression coverage.
- [ ] Verify side-category readability, icon clarity and BUY comfort on a real landscape Android phone. Tune the layout only after seeing the deployed result.
- [ ] **Next Patch #61 - new permanent camp benefits:** Hearth Mastery, Fence Reinforcement, Workshop Legacy and Storage Legacy. Avoid duplicate Old Flint/Camp Legacy effects and only apply newly bought foundations to future runs.


## Patch #59 - four-square upgrade cards per scrolling row
- [x] Replace Patch #58's wide rectangular upgrade cards with four equal square tiles per row, 59x59 game pixels each.
- [x] Preserve the existing scrolling, momentum, desktop wheel, keyboard automatic reveal and clipped hit zones.
- [x] Center the existing pixel-art icons above legible upgrade names, level, price/OWNED and slim permanent-level bars.
- [x] Keep BANKED ASH, three tabs, Bingsu's Pets panel, close control and selected-upgrade details/BUY panel fixed.
- [x] Preserve the actual seven permanent Ash upgrades and their saved ownership, prices, effects and banked-Ash safety.
- [x] Add square geometry, 4-across placement, text-fit, scroll-into-second-row and progress tests.
- [ ] Real-device approval for 4 square cards on landscape phone, especially scroll gestures and icon/price legibility.
- [ ] **Patch #61:** Add permanent Hearth Mastery, Fence Reinforcement, Workshop Legacy and Storage Legacy, avoiding duplicate Old Flint/Camp Legacy effects.


## Patch #58 - scrollable, responsive Ash Shop (approved)
- [x] Replace the old Upgrades page-1/page-2 buttons and six-card pagination with one scrollable two-column card collection.
- [x] Improve readability with larger illustrated cards, clear level/price/OWNED state and proportional progress strips.
- [x] Keep the banked-Ash balance, category tabs, bottom selected-upgrade details and sole BUY action fixed and unchanged.
- [x] Add touch drag and restrained momentum with drag cancellation of taps (no Ash purchase on accidental swipes), mouse-wheel/trackpad scroll and automatic keyboard card reveal.
- [x] Clip both visible art and hit zones to the card viewport; keep scroll position bounded and show a subtle gold scrollbar.
- [x] Preserve existing Ash upgrade prices, ownership, abilities, Bingsu pet portrait and permanent v1 saves without adding new upgrades this patch.
- [x] Add automated pointer/wheel/keyboard interaction and purchasing safeguards.
- [ ] Visual and tactile QA on portrait-safe landscape Android plus desktop trackpad, especially small scroll swipes and edge clamping.
- [ ] **Planned Patch #60 - New permanent Ash upgrades:** brainstorm/verify costs and implement Hearth Mastery (initial level-1/2 fireplace), Fence Reinforcement (better cold protection inside built fences), Workshop Legacy and Storage Legacy. Do not duplicate Old Flint's pre-lit fire or Camp Legacy's built posts; bought effects must apply to new runs only.


## Patch #57 - properly contain Bingsu's approved portrait in her Pet Shop card
- [x] Fix screenshot-confirmed problem where the approved portrait paints over the top/bottom border of its 100x68 container.
- [x] Preserve the exact approved 94x68 image data and center a proportionate 86x62 nearest-neighbor rendering, with 7px side and 3px vertical padding.
- [x] Give the portrait a uniform slate matte and show the selected gold frame all the way around.
- [x] Keep the three tabs, text column, detail panel, real BUY/OWNED button, and touch target positions unchanged.
- [x] Update profile framing and add tests for fit dimensions, pixel coverage and nonoverlapping hitboxes.
- [x] Leave Bingsu's pet price, permanent ownership, game-world sprite and fetching mechanics untouched.
- [ ] Verify the actual deployed 320x180 composition on landscape Android and tweak padding only if necessary.


## Patch #56 - wider crop of the approved Bingsu unlock portrait
- [x] Reuse the user's approved head-and-chest Dogo portrait artwork; do NOT design another dog.
- [x] Move the crop outward to display more of her natural folded ears, neck, white chest and shoulders without changing her face or expression.
- [x] Keep the same 100x68 Pet Shop card, text layout, 40-Ash purchase target, tab and close hit zones.
- [x] Encode the wider 94x68 crop as verified, offline-only native-pixel Canvas data; do not introduce remote image loading or a new framework.
- [x] Keep the already-approved in-world Bingsu sprite, two-log fetching, equipment, save data and pet lore unchanged.
- [x] Update pixel, layout and purchase regression tests; preserve source integrity.
- [ ] Confirm the wider portrait is displayed as intended on the actual deployed Android landscape Shop. Additional creative changes only if requested.
- [ ] Continue playable Level 2 missions once the pet portrait is accepted.


## Patch #55 - replace rejected Bingsu full-body unlock portrait
- [x] Respect the approved art direction: a calm, affectionate, recognizable Dogo Argentino **head and chest** in three-quarter view, with the muzzle facing slightly left.
- [x] Replace the rejected artificial full-body polygons with a reviewed and pixelized real illustration, with nuanced white coat shading, natural folded ears, strong muzzle and gentle expression.
- [x] Fit the new actual 90x68 image in a modest 100x68 card, restoring more horizontal room for Bingsu's description, without touching the persistent Shop BUY/action areas.
- [x] Leave the already-approved in-world dog sprite and fetch/follow behavior entirely unchanged.
- [x] Remove the obsolete full-body portrait renderer, add exact raster-integrity and real UI touch/price regressions, and update old visual test expectations.
- [ ] Review the *actual deployed* portrait on a landscape phone alongside the supplied dog photograph; adjust only once the user supplies visual feedback.
- [ ] Continue playable Level 2 once pet unlock art is approved. No unrelated code changes in this art-only patch.


## Patch #54 - Bingsu Pets Shop likeness against user-supplied photo
- [x] Replace the small frontal portrait with a larger original 124x65 pixel-art whole-body three-quarter-side study of a female Dogo Argentino.
- [x] Correct the adult proportions: broad head, natural hanging ears, deep chest, longer lean back, distinct waist tuck, tall legs, natural tail and wide black nose with calm expression.
- [x] Separate the 128x66 pet picture frame from the pet description without overlapping the Shop close, tabs, details or actual BUY button.
- [x] Preserve Bingsu's established personality and genuine two-log fetch skill, and **do not touch** her in-world animated sprite.
- [x] Preserve exact 40-Ash ownership purchase, permanent equip controls, all inventory and existing v1 saves.
- [x] Add source-grounded pixel geometry, silhouette, body/feet, touch/price and color regressions.
- [ ] Compare the updated unlock image directly with the user-supplied Bingsu reference on the actual Android landscape device; adjust the likeness and colors from that review.
- [ ] After photo likeness is accepted, continue planned playable Level 2 missions without touching Bingsu's agreed in-world sprite.


## Patch #53 - permanent Camp Legacy and Bingsu adult Dogo profile
- [x] Add four increasingly useful banked-Ash Legacy levels (35, 60, 95, 140 Ash): prebuilt Storage, Workbench, Fence Posts and Eastern Expansion for future runs.
- [x] Preserve real resources: no free stored wood, carried wood, lit torches, fuel, run Ash, station upgrade levels, crafts, Museum entries or fake mission completion.
- [x] Apply Legacy only to genuinely NEW runs; old v1 checkpoints restore their saved structures, even if the player purchases Legacy later.
- [x] Keep Ash Shop cards readable by paginating six real cards and displaying one distinct Legacy card on page two with visible Prev/Next and exact level-specific next benefit.
- [x] Rewrite Bingsu's profile as affectionate, calm, quiet, a little stubborn and fearlessly protective, without referencing her real-life inspiration or promising unimplemented combat.
- [x] Repaint Bingsu's collar-free native-pixel portrait and strengthen the compact in-world side sprite with Dogo Argentino anatomy: muscular white head/chest, black nose, natural ears and gentle eyes.
- [x] Add regression tests for all tiers, existing save migration, purchase price and max cap, safe Shop hit zones and female Dogo lore/art.
- [ ] Real Android landscape QA for Shop's page arrows and Bingsu's subtle new details.
- [ ] Test the perceived time-to-afford Camp Legacy costs in the first few Level 1 runs, and whether prebuilt early buildings make tutorial goals too fast.
- [ ] Continue with playable **Level 2** and new missions. Level 2 remains unlocked but Coming Soon.


## Patch #52 - One-log ignition and species-aware Pine fuel
- [x] Make the first manual fire and every subsequent relight consume exactly 1 real Pine Log from backpack or Log Storage. No more free first lighting or 3-log relight.
- [x] Preserve first-run starter tinder as a one-time +20 fuel bonus (first fire 25-40 including actual Pine roll); preserve purchased Old Flint's 40-fuel pre-lit start.
- [x] Introduce `WOOD_SPECIES52` registry for real Pine item/tree/weight and inclusive uniform 5-20 fuel rolled only at the moment of consumption.
- [x] Replace fixed 16/21 feed amounts with per-log roll plus optional crafted Kindling Bundle +5 bonus.
- [x] Keep the same 100 fuel cap, real inventory and stored-wood accounting, Warmth and existing weather/Reflector/Hearth consumption rate.
- [x] Update actual one-log lighting messages, beginner tutorial, Grooty guide and Pine inventory benefit text.
- [x] Add deterministic edge-value, kindling, resource conservation, no-free-light, storage fallback, fuel-cap, old save and Old Flint regression tests.
- [ ] Playtest the first dawn and first cold night when a Pine Log rolls 5, including blizzard/rain, and refine fuel pacing only with evidence.
- [ ] Check the 5-20 fuel readout and short fire messages on an actual Android landscape device.


## Patch #51 - illustrated Ash cards and Bingsu female Dogo portrait
- [x] Replace plain Shop rows with a native 3-by-2 illustrated six-card Upgrades grid. Original pixel icons for all six current permanent upgrades.
- [x] Give Bingsu a separate personal Pets card with her real portrait and accurate 40-Ash ownership.
- [x] Keep three Shop tabs (Upgrades, Pets, Coming Soon) and close button without overlap.
- [x] Selecting an upgrade never spends Ash. Show a separate bottom details panel, current level, next level, actual benefits and visible BUY action.
- [x] Spend only banked Ash, with live-price/ownership/cost revalidation. Keep original upgrade costs, persistent purchase keys and progression benefits. Unaffordable/maxed cards can still be viewed, not purchased.
- [x] Update text to use she/her for Bingsu; remove her red collar from both the in-world sprite and Shop portrait. Better Dogo Argentino broad white head, heavy chest and short folded ears, without enlarging her world scale.
- [x] Retain Bingsu equipment controls solely in Inventory and keep two-log cargo/motion behavior unchanged.
- [x] Add native touch/keyboard/card visual/buy/cost and female pet art regression tests.
- [ ] Review precise pixel scale, icon clarity, portrait likeness, transparency, and BUY tap comfort on Android landscape.
- [ ] Review all six cards at low Ash balances and multi-level Warm Blood upgrades on a real phone.

## Patch #50 - Inventory and Equipment
- [x] Keep the native 20-slot backpack on the left with no changes to carried logs or weight capacity.
- [x] Always display real AXE and PET equipment sockets on the right, with icons, equipped status, owned choices and a dedicated EQUIP/UNEQUIP action.
- [x] Give every player a permanent Wood Stick fallback even when stronger axes are owned; support switching between Stick, crafted Wood Axe and permanent Grandpa's Axe.
- [x] Drive both chopping animation tier and real chop duration from the actual selected axe instead of multiplying ownership bonuses.
- [x] Bingsu is purchased in the Pets Shop but equipped/unequipped from Inventory, preserving existing owned state and two-log retrieval.
- [x] Keep existing crafted Torch Quick Slot 1/2 assignments accessible from the Inventory's OTHER GEAR mode and the two in-run quick-slot controls.
- [x] Safely migrate older v1 run checkpoints and permanent Ash data, including explicit unequips and crafted gear expiry between runs.
- [x] Add unit tests for equipment ownership, UI touch/keyboard, saves, pet cargo conservation and chopping.
- [ ] Validate small-screen 320x180 detail legibility and gear touch targets on Android landscape in light/night/weather conditions.
- [ ] Review whether future boots/backpack equipment slots should become optional equips, rather than automatic crafted benefits.

## Remaining approved milestones
- [x] **Patch #51 - Ash Shop overhaul:** original illustrated upgrade cards with separate selection, details at bottom and one BUY button. Pets become unlock-only, equips stay in Inventory.
- [x] **Patch #52 - Variable log fuel:** wood species definitions and random Pine Log burn values 5-20 rolled when used, preserving stacks and balancing first-night difficulty.


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
- [x] **Patch #50 - Inventory & equipment:** a side-by-side backpack with dedicated AXE and PET equipment slots. Permanent starter Stick as fallback; equip/unequip an owned axe or Bingsu from Inventory, while keeping the existing quick slots. Persistent pet state and equipment migrations.
- [x] **Patch #51 - Ash Shop:** replace the plain list with original pixel-art upgrade boxes, one selectable card, detailed effects at the bottom and a distinct BUY confirmation button. Pets become unlock-only in Shop, while equipping occurs in Inventory.
- [x] **Patch #52 - Wood & fuel:** data-driven species definitions, random Pine Log fuel value 5-20 at the moment of burning, keep wood stacks as materials. Verify early-run balance and ensure rare Museum collectibles remain separate.


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
- [x] Patch #53 Camp Legacy restores the two fence posts and Eastern Expansion at paid levels 3-4, without inherited torches or resource counters.

- [x] Patch #30 source: fix overlapping lock and double-drawn ENDLESS NIGHT title label by drawing the button exactly once with separated icon/text spacing. Preserve the Coming Soon popup and original touch zone; pixel-geometry regression test added. Phone visual QA pending.

- [x] Patch #29: source-based HUD refresh at 320x180. Live full-width framed minimap, three compact resource panels, wooden in-water buttons, warmer Grooty shortcut and queued notification strip. Touch hitboxes and gameplay preserved; added render geometry tests. Phone screenshot QA remains pending.

- [x] Patch #28: locked ENDLESS NIGHT preview added directly above How to Play in the title-screen right-side controls. Click opens Coming Soon explanation with keyboard/touch close; no new gameplay mode, save keys or Ash costs. Source tests added; phone layout QA still required.

- [x] Patch #27: rename Grooty across visible dialogue, world labels and tutorials; replace persistent objective panel with a tiny ? shortcut and use one queued top-center fading message strip for temporary events. Source tests added; real Android visual QA pending.

- [x] Patch #26 source: five real run-scoped tutorial levels with optional guide HUD access, fixed talking-tree guide Grooty with ACT dialogue and dynamic hints, Museum removed from title actions but retained as camp building. Version-one run checkpoints store objective counters; new runs reset to Level 1. Automated tests added; Android browser playtesting still pending.
- [ ] Future optional separate **Endless Night** game mode: concept not finalized. Keep the current finite campaign Long Night and its Bank/Continue choices as-is. The menu preview is intentionally locked until a later design decision.
- [x] Patch #53 Camp Legacy prebuilds camp foundations at future run start, but does not preserve actual station upgrade levels or completed missions.

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
