# Sekampfire — outstanding requests and quality backlog

This is a tracked product backlog; **not completed merely because it is documented**. Keep source-verified implementation and phone-tested behaviour separate. Prioritize these after Clean Foundation is confirmed stable.

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
