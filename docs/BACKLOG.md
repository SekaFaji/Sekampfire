# Sekampfire — outstanding requests and quality backlog

This is a tracked product backlog; **not completed merely because it is documented**. Keep source-verified implementation and phone-tested behaviour separate. Prioritize these after Clean Foundation is confirmed stable.

## Priority 0 — user-approved unfinished features / fixes
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
