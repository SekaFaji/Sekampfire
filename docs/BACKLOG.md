# Sekampfire — outstanding requests and quality backlog

This is a tracked product backlog; **not completed merely because it is documented**. Keep source-verified implementation and phone-tested behaviour separate. Prioritize these after Clean Foundation is confirmed stable.

## Priority 0 — user-approved unfinished features / fixes
- [x] **End screen navigation**: win, death and retirement offer Main Menu with no second ash banking, plus keyboard shortcut M. Needs mobile tap verification.
- [x] **Adaptive fullscreen source implementation**: measured 16:9 canvas, safe-area insets and immersive browser fallback. **Real Android/iOS viewport testing still required** before declaring device-perfect.
- [x] **Player camera-facing idle in source**: character faces camera when not moving/chopping, with breathing/blinking/scarf animation; still requires phone visual QA.
- [x] **Left-facing eye in source**: mirrored facial details and hair; needs native-resolution screenshot QA.
- [x] **Tool appearance/progression**: starter branch -> renamed Wood Axe (`maul` original save ID and 5-wood cost/chop-speed bonus) -> Grandpa's Axe (`axe` upgrade); overhead swing added. Needs real-device quality check.
- [x] **Wood Ring source update**: stage name, timber windbreak art and description now agree; original 8-wood cost and wind-reduction mechanic preserved. Needs phone screenshot QA.
- [x] **Detailed procedural trees in source**: separate anchored renderer with three evergreen silhouettes, bark, branches, shading and winter-only snow; tests for geometry/season. **Final premium art quality still requires visual approval on real devices**.

## Priority 1 — visual/audio polish requests
- [ ] Validate on real devices: revised tree pixel art, Wood Ring, backpack logs at 5/13/21 and player sprite alignment. Iterate toward premium art quality after screenshot review.
- [ ] Fix/polish mobile fullscreen HUD layout, menu placement, font hierarchy, user touch hitboxes and water buttons.
- [ ] Inspect reflection player alignment, water bottom seam and shoreline in day and night on actual mobile displays.
- [x] Replace hammer-like tool with raised overhand branch/axe swing in both facings; continue visual polish after on-device inspection.
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
