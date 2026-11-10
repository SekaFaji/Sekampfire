# Sekampfire - Ideas and Design Decisions

## Patch #44 implemented (2026-11-10)

**Level 1 completion and genuine Ash rewards:** New campaign runs stop at the end of the third First Settlement milestone and open an unbanked Level 1 completion choice. The pending reward accurately separates real dawn, aurora, station and structure Ash awards. Older unclassified saved earnings appear as Earlier Run Ash. Only an explicit **BANK ASH + FINISH LEVEL** action transfers Run Ash to permanent Banked Ash, closes the run and records Level 2 unlocked. A validated saved run receipt helps prevent duplicate bank deposits after reload. Replays reset the physical camp while purchased Ash upgrades and Museum collections persist.

**Compatibility:** Older checkpoints without the opt-in `campaignLevel` field remain on their existing tutorial/cabin/finite Long Night behavior. The new campaign ending does not silently alter their progression. The result/pending state uses optional v1 checkpoint fields rather than an invalidating migration.

**Next:** Level 2 is permanently unlocked but not yet playable; it is explicitly marked Coming Soon, not a fabricated chapter. Its milestones, Ash farming introduction, in-game Shop access and permanent starting buildings/fence remain proposed, requiring a separate balanced implementation. Phone UX and resume testing are still pending.


## Patch #43 implementation note (2026-11-10)

**Implemented as a campaign foundation, not a complete campaign conversion:** the first three existing Grooty groups now display as the three named milestones of Level 1, The First Settlement. The other two old cabin groups remain Camp Challenges for compatibility until the completion/unlock flow is built. A physical talk-to-Grooty mission and a night-only Pine Grove outing with a return-to-fire and dawn requirement are now live. The new landmark is east of the initial fence; its target uses real player coordinates and Grooty's existing firefly guidance. The trip can be attempted on a later night without losing the camp. Optional flags extend the unchanged v1 checkpoint.

**Not implemented by #43:** Level 1 end-of-run banking/unlock, new Level 2, permanent camp preservation, revised Ash rewards or altered station/equipment economy. The proposed exact mission thresholds in later levels are still open. Android QA is pending.


Last updated: 2026-11-09

> **Planning document, not a feature-completion report.** This file records brainstorms, proposed gameplay and decisions to avoid losing them between patches. The live implementation is documented in the source, README and [BACKLOG.md](BACKLOG.md). Do not treat anything here as already shipped unless explicitly marked **Current**. Confirm remaining rules before implementing them.

## How to use this file

- **Agreed direction**: the desired product direction expressed in discussion, not necessarily a finalized implementation specification.
- **To decide**: mechanics, requirements, balancing, layout or rewards that still need to be brainstormed or tested.
- **Current**: verified in the repository on November 9, 2026.
- For each future patch, update its related section, record the decision and move any completed work to the implementation backlog. Keep unrelated code unchanged.
- Do not silently replace a proposed rule with a different one. Existing saves, permanent purchases and collections must be protected.

## 1. Campaign structure: levels, milestones and missions

**Agreed direction**

- A **level** is one substantial, complete survival run with a definite ending and an Ash reward, not a tiny lesson or a single build task. Early levels need enough activities to feel like meaningful adventures.
- A **milestone** is a larger stage of progress within the same level, and does **not** finish or reset the current camp.
- A **mission** is one clear step within a milestone. Grooty explains the milestone and his fireflies highlight the current actionable mission, including relevant world objects, menus, tabs or buttons.
- Completing the level ends the run, banks earned Ash, and can unlock the next campaign level. The precise end-screen choices, failure/retirement rewards and replay rules still need design.
- A new level begins a new run with an initially reset camp. Future **permanent Ash upgrades** can prebuild/preserve specific parts, allowing later runs to begin further developed.
- Do not repeat long introductory explanations after the player has learned a mechanic. Keep goals understandable when playing the level again.
- **Endless Night** stays a distinct locked **Coming Soon** mode on the main menu. Do not turn the finite campaign Long Night into endless survival by default.

**Current**

- The live game still has **five tutorial objectives groups called levels inside a single run**, followed by the existing finite Long Night and its Bank/Continue choice. This is **not** the proposed multi-level campaign.
- Grooty's current small glowing fireflies already guide a single unfinished objective. They should be adapted to missions rather than removed.

### Proposed Level 1: The First Settlement

The previously proposed first three smaller levels are **one full Level 1**, containing these three milestones:

| Milestone | Purpose | Mission ideas (sequence and exact thresholds not final) |
| --- | --- | --- |
| **1. Establish and Explore** | Learn the world while building a safe base | Talk to Grooty; chop a pine tree; collect pine logs; place one log at each boundary post; light and maintain the campfire; **survive the first night while exploring** rather than remaining at the fire |
| **2. Log Storage** | Learn carrying, construction and resource handling | Find the storage site; bring required pine logs; build Log Storage; deposit logs; learn how storage helps future camp work |
| **3. The Workbench** | Learn crafting and equipment preparation | Find the workbench site; deliver materials and build it; open its crafting menu; select and confirm a useful first equipment recipe such as the Timber Pack |

**Important Milestone 1 rule:** "Survive your first night" alone is **not** sufficient. The player should have an exploration goal or a reason to venture away from the camp. Grooty's fireflies must not point permanently to the campfire throughout that mission.

**Ideas for a meaningful exploration mission** (not approved exact rules): visit a nearby landmark, walk beyond the first fence, locate a particular pine grove or discover a point of interest, then make it back to safety while still surviving the night. Make the objective measurable without demanding risky nighttime exploration that would unfairly kill a new player. The fireflies should guide the route or next relevant location, not always the fire.

**To decide for Level 1**

- The exact numbered mission sequence for all three milestones.
- Which exploration landmark/action counts and whether it occurs during the night or during preparation for the first night.
- How to ensure Level 1 lasts long enough without artificial waiting, repetitive chopping or tutorial fatigue.
- Whether camp expansion belongs late in Level 1, in Level 2, or remains optional. Earlier designs put it in the storage tutorial; revisit its pacing.
- The final Level 1 completion condition, including whether it requires another night after the workbench and whether milestones can complete out of order.
- How to handle tasks already satisfied by Ash-preserved structures on repeat runs.
- The precise Ash base reward, bonus breakdown and defeat/retirement outcomes.

### Level 1 mission design - working draft, awaiting player approval

This is a **candidate sequence for discussion**, not an approved spec or an implemented feature. The user wants Level 1 to contain three substantial milestones (not three short levels), including first-night exploration rather than standing at the fire.

**Milestone 1 - Establish and Explore**
1. Talk to Grooty and chop a Pine Tree; collect enough Pine Logs for two boundary posts plus firewood.
2. Place one log at each of the two original physical camp posts. The palisade connects.
3. Light the campfire and add a log so players learn warmth, fuel and the need to return to safety.
4. **At night**, follow guiding fireflies to a short-range, identifiable nearby landmark or pine grove **outside the fence**. The exact site and distance are not final; it must be safely reachable on the first night. The marker must point away from the campfire while scouting is active.
5. Return safely and reach dawn alive. If the player misses the excursion, allow a later night's attempt without resetting this run or forcing an unwinnable level.

**Milestone 2 - Log Storage**
1. Locate the storage construction site.
2. Deliver the required Pine Logs in backpack-sized trips (currently the site costs 15 wood; name/stack conversion not yet implemented).
3. Complete construction and see a distinct milestone animation.
4. Put a meaningful amount of Pine Logs into finished storage to learn its use (5 vs 10 is still to be balanced).

**Milestone 3 - The Workbench**
1. Locate the workshop site and deliver its construction resources (currently 15 wood).
2. Finish the Workbench.
3. Open Tools/Crafting and craft the first useful item, likely the existing Timber Pack.
4. Candidate finale: use the improved camp and experience a **second dawn** or a brief final outdoor preparation challenge, then end the full level and explain Ash. Do not make players wait idly once objectives are met; tune the pacing after device playtests.

**Guidance rules**
- Only one **mission** is active at a time within Grooty's current milestone, but already-completed tasks are recognized retroactively where sensible.
- For first-night exploration, point to the actual nearby landmark at night, then point back toward home. Avoid the old 'SURVIVE NIGHT' marker hovering above the fire for the whole night.
- Fireflies use existing world, minimap and menu navigation behaviors; no persistent text-heavy HUD.
- Preserve current game progress while changing internal guide terminology; never silently destroy old checkpoints.

**Pacing to test, not a requirement:** aim for a first full level longer than a few minutes, initially around two meaningful night cycles. Balance the real amount of wood gathering, movement and crafting rather than artificially adding idle waiting.

**Ash completion:** show the actual itemized earning sources, earned vs banked Ash, the purpose of Ash, the reset rule, and a clear route to the Ash Shop. Final formula, baseline reward and completion UX are still to decide.

### Proposed Level 1 completion: explain Ash clearly

**Agreed direction**

A dedicated completion screen must make Ash and permanent progression easy to understand. Explain all of the following in plain, brief language:

1. **You completed Level 1.** The current run ends and the next campaign level becomes available.
2. **You earned Ash.** Show where each part of the reward came from and distinguish **Run Ash** from **Banked Ash**.
3. **What Ash is for:** purchase upgrades that improve future runs, including permanent camp starting improvements.
4. **How to earn Ash:** show only the **actual implemented** earning rules, not hypothetical bonuses. The Ash formula and rewards may be rebalanced later.
5. **Your camp resets for the next run.** Permanent Ash purchases and collections survive that reset.

**To decide:** Reward amounts, whether useful wood burned earns Ash, how night-survival rewards scale, whether a first-clear bonus exists, the exact wording/buttons, and how to avoid double-banking a completed run.

## 2. Level 2: Discover Ash farming and permanent advantages

**Agreed direction**

- Level 2 should teach the player how to deliberately earn Ash, spend it and understand why permanent upgrades matter.
- A new run begins with the camp reset, except for the permanent Ash upgrades already bought.
- The **Ash Shop must be accessible from the in-game/pause menu**, not just the title screen, without allowing clicks through open menus.
- New Ash Shop improvements should include:
  - **Permanent starting Log Storage**: begin future runs with Log Storage already built and at least the intended Level 1 upgrade.
  - **Permanent starting Workbench**: begin with a built, Level 1 workshop.
  - **Permanent starting fence**: begin with the initial camp boundary established.
  - **Permanent pre-lit campfire**: begin with the fire lit.

**Current:** There is already an **Old Flint** Ash upgrade that starts new runs with the fire lit and starter fuel. Do not add a duplicate upgrade without deciding whether to reuse, rename, extend or replace Old Flint while preserving its purchase key and ownership.

**To decide**

- Level 2's milestones and missions (including an Ash-earning challenge, a Shop introduction and weather preparation).
- Whether purchases become available immediately after Level 1 or during Level 2, and whether shopping is available while a run is paused.
- Exact upgrade names, Ash costs, required prior purchases and balancing.
- Whether building preservation means a fixed purchased starting level or preserving the actual earned building level; earlier direction favored **preserving actual earned levels**, but fixed Level 1 starting upgrades are also proposed here and must be reconciled before coding.
- The fence upgrade's effect on the five-log expansion.
- How missions recognize carried-over buildings, so players do not get stuck being asked to construct an already-built station.
- When Ash is banked and spendable during a run versus after completion, to prevent confusion or exploits.

## 3. Weather, cold and survivability

**Agreed direction**

- Introduce a clear **Cold meter** distinct from the player's **Warmth meter**. The colder the environmental conditions, the faster warmth drains.
- Rain and snow should become meaningful gameplay events, not merely visual effects.
- Higher cold pressure should give players a practical reason to craft clothing and spend more time planning outdoor trips.
- Workbench-crafted equipment should help retain heat, protect against weather and enable longer exploration away from the campfire.
- Keep the progressive fire-warming mechanic: heat absorption ramps up while near a lit fire, instead of giving instant full recovery.

**Current:** Rain, winter snow, wind, cold snaps and blizzards already exist visually/in the weather system, and several weather types affect warmth loss and fire consumption. The game already has one Warmth meter, Warm Boots, Warm Blood, Everwarm Scarf and gradual fire warming. **A separate Cold meter and fuller equipment-vs-weather system are not implemented.**

**To decide**

- Definition of Cold meter: outside temperature, exposure severity or an accumulating personal cold state. It must not simply duplicate Warmth numerically.
- Clear relationship between weather, seasons, distance from fire, shelter, clothing, cold pressure and warmth loss.
- How rain/wetness affects cold, fuel, clothing and shelter, without overwhelming beginners.
- Whether snow is introduced as an early later-level challenge, and exact difficulty pacing.
- Equipment slots, crafting recipes, protective stats, repair/durability (if any) and upgrade progression.
- UI fit for warmth, fuel, cold, wood/inventory and weather at the native 320 x 180 pixel resolution.

### Cold and weather model - working draft, awaiting player approval

**Goal:** make environmental **Cold** a legible threat while preserving the existing **Warmth** health/recovery meter. A high Cold level means warmth drains faster; enough crafted protection lets the player spend longer in the wild. Do not implement an unrelated second health bar.

**Suggested Cold meter semantics**
- Cold (0-100) is the player's **current exposure pressure**, not another reserve that permanently drains to zero. It follows the environment over a few seconds.
- Inputs: time of day, level-specific weather, seasonal climate, rain-related dampness, nearby fire/shelter, and protective equipment.
- Warmth (0-100) remains the player's actual survival reserve; its drain depends on Cold. An 8-second heat-soak ramp when near a lit fire stays in place.
- Avoid double-counting weather: replace or refactor the existing `game.ts` direct weather drain bonuses rather than adding the new Cold multiplier on top of them.
- Sample reading only: mild daylight = low Cold, clear night = medium, heavy rain/snow = high, blizzard = severe. Exact thresholds and numerical multiplier must be tested.

**Weather proposal**
- **Clear / Wind:** early-level learning, with coldest conditions at night.
- **Rain:** gradually raises Cold via dampness. A campfire or cover can reduce/slow the effect; the existing Lean-to should protect against rain, retaining its role in fire management.
- **Snow:** a genuine intermediate event distinct from the currently implemented visual winter particles and from blizzard. It makes outdoor trips colder; winter/snowy-level selection needs a rule compatible with the current seven-days-per-season visuals.
- **Blizzard:** severe late-game event, not a random unavoidable first-night death. Shorter visibility and high Cold, but avoid punitive stacking with old cold drain.
- Explicitly stage the first rain lesson in Level 2 or later (or choose gentle rain late in Level 1 only if playtesting supports it). Reserve true snow and blizzards for later levels.

**Equipment proposal**
- Existing **Warm Boots** gain a small protective Cold/insulation effect in addition to their existing movement bonus. Keep the existing craft ownership/save key.
- Add later clothing options as the inventory/resource system expands: more effective insulation, weather resistance and/or improved time outdoors. Don't make every tool, backpack or weapon mechanically identical to clothing; those items may serve travel and gathering instead.
- The future Ash Shop and the existing Warm Blood upgrade can reduce cold damage, but permanent boosts must not trivialize the opening levels.
- Consider a lightweight persistent rain dampness effect within Cold rather than adding a third meter for Wetness.
- Rain protection, heat retention and insulating warmth should be separate readable attributes where they improve player choices.

**HUD proposal**
- Warmth stays prominent. Add a small Cold meter with intuitive colors and a short tooltip/guide explanation ('HIGH COLD = WARMTH DROPS FASTER').
- Keep the already-compact 320 x 180 HUD, translucent enough to see scenery. Avoid extra large overlay panels and test day/night pixel contrast.
- Include a brief first-cold cue from Grooty, then let the visual indicators and equipment benefits teach the mechanic.

**Validation and rollout proposal**
1. Prototype a pure, frame-rate-independent `Cold` exposure calculation, exposed as a read-only bar first.
2. Integrate it into warmth loss exactly once while preserving saved runs and existing fire recovery, with rain/coldsnap tests.
3. Add rain dampness and snow weather with environmental visuals and clear, fair level-specific timing.
4. Add wearable insulation/recipe stats with migration tests, only when actual resources and inventory support them.
5. Playtest Level 1 night scouting with no coat, Level 2 rain with Warm Boots, and late blizzard with higher-grade equipment.

**Still open:** whether Cold represents instantaneous weather severity or slower personal exposure, whether first rain occurs in Level 1 or Level 2, exact drain/insulation curves, extra resources required for clothing, and how each campaign level chooses season and weather.

### Patch #36 implementation note (2026-11-09)

**Implemented in source for review:** the original HUD panel now contains a small Cold bar alongside Warmth and Fuel; Cold tracks real environment exposure. Weather and winter exposure replace the previous direct cold-snap/blizzard warmth penalties to avoid duplicate damage. Rain adds hidden dampness that increases Cold until the player dries near the fire or under an existing Lean-to. Existing Warm Boots reduce Cold (without changing their ownership key), and Old Flint / Warm Blood / torch / fireplace progression remains intact. New Cold and dampness are optional backwards-compatible v1 run-save fields.

**Still to design and implement:** standalone snow weather and its visual/audio presentation beyond winter particle snowfall; level-based rain/snow progression after the campaign restructure; more crafted clothing/insulation items; future inventory and Pine Logs conversion. Actual Cold values and first-night pacing need real-device testing.

### Patch #37 implemented (2026-11-09)

The central HUD panel is now a dedicated **living landscape thermometer** with handcrafted glass, wood, brass, tick marks, an animated liquid reservoir and a numeric outside-temperature °C reading. **No Ash, Wood or personal Cold bar** appears in this middle panel. The left panel is back to Warmth and Fuel; the right continues Day/Weather/Season/Menu. Current Run Ash is already in Pause and end-of-run UI, and inventory resources remain accessible through Build/Craft until the future item system is complete.

Ambient Celsius responds to actual seasons, time of day and weather transitions. It is **not** the personal Cold exposure value, and changing clothing or standing by a campfire does not alter it. Current hidden Cold/wetness physics from #36 remain unchanged. Animated liquid settles smoothly; no save-format changes.

**Future:** replace Build/Torch water buttons with two assignable quick slots, and move Build into menus/contextual ACT when the real Pine Logs/multi-resource inventory design is ready. Press-and-hold equipment picking, empty slot visuals, persistence and Torch item semantics are still to finalize.

### Patch #38 groundwork (2026-11-09)

- **Thermometer:** broadened brass tube and live liquid to occupy the center plaque with more engraved ticks, without changing its ambient Celsius formula.
- **Minimap:** map the real world including independently built fence posts, claimed palisade and eastern expansion, active/future building sites, finished workshop and storage, structures, Grooty, Museum and viewport footprint. Keep the tiny strip and landscape visible.
- **Toolbar:** replace permanent BUILD and TORCH with two empty native-pixel sockets. Hold for half a second to pick a supported active item; short tap uses it. A Menu > Toolbar alternative supports devices with difficult long presses. Build moves to Menu > Build, with Grooty's fireflies updated.
- **Now supported:** the legacy **Fire Ember** action, unlocked through lighting the campfire. It still draws real fire fuel and creates a timed ember light. This is an interim gameplay action, **not** a new inventory item or a promise that other tools already exist. Slot assignment persists only within the active run; no permanent inventory item ownership is invented.
- **Next design:** introduce explicit Pine Logs stacks and tree types, crafted active tools (including an actual Torch item), durable inventory/equipment categories, more toolbar candidates, equipped gear slots and save migration. Review intended slot persistence across runs after the item ownership model is established.

### Patch #39 implementation and next agreed UX direction (2026-11-10)

- **Four HUD plaques within the original top-row footprint:** Warmth/Fuel, smaller handcrafted local-air thermometer, Inventory/Ash, and Day/Season/Menu.
- **Temperature and weather share ONE line** (example `+8°C | WINDY`), not two stacked labels. Remove WINDY/RAIN from the Day panel entirely.
- One thermometer is enough: its value is the **air around the player**. Ambient outside temperature is still computed from weather, time and season; being near a lit fire increases local air warmth based on proximity/fuel, smoothly easing back outside. Clothing reduces personal Cold exposure but does not heat air. Retain existing Warmth and Fuel bars.
- **Temporary readout:** until the true bag exists, `INV 0/5` reflects existing real carried wood count and capacity, explicitly not fabricated inventory slots. The approved eventual meaning is **occupied inventory slots / available inventory slots**, with carrying weight shown separately inside Inventory. Run Ash is visible as `ASH X` beside this compact counter.
- **Next patches accepted:** MMO-style slot-and-stack inventory (Pine Logs and Pine Trees first), selectable item detail, eventual real material/crafting/equipment definitions, short tap to use and long press to assign a small square quick slot, and physical construction. The in-game pause menu must NOT act as a remote Build screen; instead first Workbench/Storage construction happens at physical work sites, craft plans through built Workbench, and built structures expose small local ACCESS and UPGRADE popup with clear upgrade cost/confirmation.
- Keep each stage separately testable and preserve existing v1 run saves, old permanent items, fire Ember, Grooty fireflies and the Good Dog's wood carrying. Do not present multi-resource inventory or structure popup as already shipped in #39.

### Patch #40: First real inventory (implemented 2026-11-10)

- Run-scoped inventory stores a canonical Pine Logs stack. Existing player.wood access routes directly to the same item stack, preserving wood gathering, Good Dog carrying, camp construction, fire consumption and storage without redundant counters.
- MMO-style Backpack and Equipment tabs in an original pixel-art modal, opened via HUD INV, keyboard I or Pause > Inventory. The bag displays 20 grid cells, 5 unlocked initially, +5 for crafted Timber Pack and +5 for permanent Big Backpack. Item selection shows quantity, category, description, and weight.
- One stack of Pine Logs occupies one slot; weight still uses the original 5/13/21 log capacity. The HUD now shows real occupied/unlocked bag slots rather than log carry units.
- Existing crafted gear appears under Equipment using real ownership data; item interaction is inspection-only for now, not remote item use or duplication.
- Existing version-one saves migrate wood to Pine Logs automatically. The same save format persists validated inventory slots and the old wood compatibility field.
- Still to design/build: additional resources and their world spawns, item dragging/equipping, crafted consumable Torch, small square quick slots, and building site ACCESS/UPGRADE UI (no remote building from pause).

### Patch #41 implemented (2026-11-10)

- **Toolbar:** small 22x22 native square equipment sockets replace the wide text buttons, with Android-size 28x26 touch areas and the same 0.5s hold-to-assign gesture. The main ACT button and movement zones keep their hit areas.
- **Real Torch:** the new reusable Ember Torch craft appears at the Workbench, costs 3 Pine Logs, and is a genuine owned Equipment item. Assign from its item details into either quick slot or use the picker. Igniting still consumes the existing campfire ember/fuel and uses existing torch rules; no free light or fabricated resources. Previously assigned legacy Ember remains usable in v1 saves.
- **Bingsu:** rename the existing permanent 40-Ash Good Dog to **Bingsu** (a white Dogo Argentino), including handcrafted pixel-art portrait, stronger in-world white breed silhouette and loyal/fearless companion lore. Pet still follows his owner and carries at most two genuine dropped Pine Logs using the original `up.dog` key; he does not yet have implemented combat defense.
- **Grooty:** player-visible run tutorial teaching sections are called numbered **MISSIONS** rather than LEVELS or LESSONS, including cabin prerequisite text. This changes presentation only; it does **not** implement the future full campaign Level/Milestone/Mission architecture and does not change any save identifiers or requirements.
- **Still future:** station-local ACCESS/UPGRADE popups, removing remote Build from Pause, broader item tool variety, dog defense gameplay (after balancing), and the substantial campaign Levels / Milestones / Missions restructure.

### Patch #42: physical structures and upgrade popups (implemented 2026-11-10)

- Player-facing **remote BUILD** has been removed from the Pause screen and from the B shortcut. **BUILD PLANS** is only available at a completed Workbench, reached by approaching it and using ACT. Workbench plans contain new structures and the Museum, but no remote station upgrades.
- Both the first Workbench and Log Storage still start as physical empty sites requiring logs and on-site hammering. The campfire and boundary fence remain on the actual map.
- All completed stations show a compact native-pixel context panel with ACCESS and UPGRADE. Workbench adds a separate BUILD PLANS choice. Workbench ACCESS opens Tools/Supplies; Storage ACCESS transfers actual logs; Fireplace ACCESS lights, relights or stokes. The three-log relight cost now correctly aggregates carried and stored Pine Logs.
- Station upgrades require a clear second press and show next level benefits and the original Pine Log cost. Their effects and two-Ash reward still use the real station purchase logic; there is no duplicate upgrade in the crafting list.
- Grooty's single-target fireflies now guide from the relevant world structure into the exact ACCESS, UPGRADE or BUILD PLANS button and then to the correct plan/recipe row. The full future **campaign levels / milestones / missions** conversion remains separate.
- The normal in-game inventory, currency panel, square quick tools and legacy run saves remain unchanged. Future content can add new types of structures or stations through their physical world sites rather than resurrecting remote building.

## 4. Inventory, resources and contextual actions

**Agreed direction**

- Replace the current assumption of one generic wood resource with a **proper inventory system**, designed to support more resources later.
- Start by naming the main starting resource **Pine Logs**, gathered from **Pine Trees**.
- Maintain potential for more tree species and material types. Do not assume all forest trees are pine if later biomes need variety.
- Reconsider the **Torch** and **Build** buttons beside the main **Chop/ACT** control. The player prefers a less cluttered action interface.
- Favor an obvious, contextual primary interaction and intentional menu/inventory access over many permanent buttons.

**Current:** Gameplay currently uses generic wood counts in player/storage, wood drops, and costs. The workbench has Tools/Supplies tabs, and BUILD / ACT / TORCH controls are exposed during runs. Some tree artwork has multiple visual variants, so a data migration and naming audit are required.

**To decide**

- How inventory opens and where it sits on mobile; grid vs slots vs compact horizontal bar.
- Item stack rules, weight/capacity, categories (logs, materials, tools, clothing, collectibles), and storage relationship.
- Whether Pine Logs replace the internal wood ID or only the player-facing label initially. Avoid breaking existing saves, current recipes, the Good Dog log carrying and Museum discoveries.
- Pine-tree identity in visuals, world spawns and possible future species-specific wood drops.
- Primary ACT behavior near trees, fire, Grooty, stations and loot; contextual action labels and optional quick actions.
- Where BUILD and Torch access should move, and whether a backpack/inventory button replaces any existing control.
- How Grooty's fireflies should direct players into inventory and crafting menus without creating another persistent objective banner.

## 5. Camp, collections and longer-term content

**Agreed direction / retained ideas**

- Camp begins as wilderness. Build the two posts to claim the first palisade boundary, clear the ground, and keep large trees away from the claimed area.
- Expand the camp later to make room for more distant structures.
- Place early functional stations close to the main campfire. The permanent Log Museum sits farther into the expanded camp, not on the main menu.
- Museum collection persists across runs and is not ordinary fuel. Pets, including the log-carrying dog, remain separate from inventory.
- Future Ash upgrades could preserve **actual built/upgraded structures** and perhaps fence expansion.
- Grooty remains the friendly stationary tree guide; fireflies should lead players to the next **mission**, including exploration and menu steps.
- Keep compact, translucent gameplay HUD and menus that do not capture input from the screen beneath them.

**To decide:** More land expansions, later resources, additional collection logs, pet upgrades, long-run challenges, later campaign levels and the finite Long Night's placement in a full campaign.

## 6. Next planning/implementation sequence (suggested, not authorized patches)

1. **Mission design pass:** specify the exact missions, target locations, prerequisites, clear completion conditions and pacing of Level 1's three milestones. Ensure the first night includes exploration.
2. **Campaign architecture:** distinguish selected Level, current Milestone and current Mission in run state; define end-of-level banking/unlocks and backwards-compatible saves. Reuse existing Grooty guidance.
3. **Level 1 experience and end screen:** polish progression, reward breakdown and the Ash explainer. Keep levels substantial, not tiny tutorial runs.
4. **Level 2 + permanent Ash Shop:** define Ash farming missions, in-game Shop access and how preserved structures/fence/fire spawn.
5. **Weather and cold system:** add measurable cold/exposure and equipment protection with tests for seasonal difficulty and the warming curve.
6. **Inventory and action UI:** introduce Pine Logs/Pine Trees, extensible item records and a more intentional interaction layout using save-safe migrations.

Do not launch implementation simply because an item is listed in this ideas file. Review the relevant proposed rules with the player first.

## 7. Decision log

| Date | Decision / note | Status |
| --- | --- | --- |
| 2026-11-09 | Distinguish full-run **levels**, within-run **milestones**, and precise **missions**. | Agreed direction; not implemented |
| 2026-11-09 | Make former tutorial groups 1-3 one substantial first level, with **Explore/First Camp**, **Log Storage**, **Workbench** milestones. | Agreed direction; mission details to design |
| 2026-11-09 | First-night milestone must involve exploration, not only idling beside the fire. | Agreed direction; measurable exploration condition undecided |
| 2026-11-09 | On Level 1 completion, end the run and clearly teach earned Ash, earning sources and permanent Shop uses. | Agreed direction; reward formula undecided |
| 2026-11-09 | Level 2 introduces Ash farming and Ash Shop preservation of Level 1 storage/workbench, fence and pre-lit fire. | Proposed upgrade set, exact mechanics/costs undecided |
| 2026-11-09 | Rain and snow should influence a visible Cold meter and crafted equipment protection. | Agreed direction; mechanics undecided |
| 2026-11-09 | Create real inventory, begin naming basic wood Pine Logs and starting trees Pine Trees. | Agreed direction; item/save design undecided |
| 2026-11-09 | Reconsider persistent Torch and Build buttons beside the primary ACT control. | UI direction; new layout undecided |
| 2026-11-09 | Save brainstorming in GitHub instead of losing decisions between chats. | Documented in this file |
| 2026-11-09 | Drafted a candidate mission-by-mission Level 1 with an actual nighttime scouting/return objective and a larger Workbench finale. | New brainstorm; sequence/thresholds not yet approved |
| 2026-11-09 | Drafted a Cold exposure-pressure model that drives warmth drain, with rain dampness, later snow, and workbench-crafted clothing protection. | New brainstorm; numbers/level introduction not yet approved |
