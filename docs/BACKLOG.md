# Sekampfire — outstanding requests and quality backlog

This is a tracked product backlog; **not completed merely because it is documented**. Keep source-verified implementation and phone-tested behaviour separate. Prioritize these after Clean Foundation is confirmed stable.

## Priority 0 — user-approved unfinished features / fixes
- [ ] **End screen navigation**: both loss and win offer Main Menu, alongside Try Again/Upgrades or Endless Winter as relevant. Preserve correct ash banking; test navigation and results.
- [ ] **Truly adaptive fullscreen**: fill the safe usable viewport across mobile screens/orientations while retaining 320×180 logical game pixels; account for letterboxing, edge-to-edge, browser UI changes and notches; don't distort aspect ratio or touch targets.
- [ ] **Player camera-facing idle**: character faces the camera when not walking, with subtle breathing/blinking/scarf animation, returns to side profile for walking and swing. Verify all directions at native resolution.
- [ ] **Left-facing eye/face**: ensure the character's eye and readable face appear facing left as well as right, even with backpacks/axes.
- [ ] **Tool and axe progression**: starter stick/branch tool (readable high swing) and craftable wood axe at the workbench, tied to real gameplay. Audit existing Log Splitter craft and Grandpa's Axe permanent upgrade first; preserve/save-migrate existing progression rather than introducing contradictory equipment or arbitrary balance.
- [ ] **Wood Ring name**: change Stone Ring to Wood Ring **and make the visuals/material/cost/description coherent**; inspect how stage-0 stone art and stage costs work before renaming.
- [ ] **Professional tree sprites**: layered silhouettes, readable trunks and branches, quality seasonal shading, snow caps, tier variants, and testing at actual 320×180 resolution; no more arbitrary scaling as a substitute for quality art.

## Priority 1 — visual/audio polish requests
- [ ] Verify backpack log readability at 5, 13 and 21 on-device and adjust mini log size/shading if necessary.
- [ ] Fix/polish mobile fullscreen HUD layout, menu placement, font hierarchy, user touch hitboxes and water buttons.
- [ ] Inspect reflection player alignment, water bottom seam and shoreline in day and night on actual mobile displays.
- [ ] Improve player axe/stick stroke: upper-body rotation and real swing/readability rather than hammer-like shape; check both facings.
- [ ] Refine action sound quality/volumes. Keep harsh static-like fire loops disabled unless a properly produced fire recording has been evaluated.
- [ ] Refine animal/world ambiance and tree movement only after art/source inspection; avoid feature creep.

## Priority 1 — engineering and release foundation
- [ ] Split `src/game/game.ts` into save/, input/, world/, render/, UI/, audio/ modules with one behaviour-verified PR per extraction.
- [ ] Add unit/integration coverage for interrupted chopping, wood drops, all crafting/upgrades, permanent ash settlements and corrupted checkpoints.
- [ ] Add Playwright screenshot/input tests for title, run, night, win, loss, pause, audio/settings and resume; confirm pixel art and HUD positions.
- [ ] Add real Android browser performance, audio/gesture and viewport test matrix; then decide when to create Capacitor native projects.
- [ ] Complete release/asset licensing, acknowledgements, privacy/data safety and store publishing checklists before submission.

## Already implemented in previous patches (still needs device QA)
- [x] Movement cancels unfinished chopping, maintains completed tree hits, blocks ACT until release.
- [x] Base 5 logs; two separate +8 backpack upgrades; three bag sizes and per-log marks.
- [x] Press feedback limited to outer 15% of each side without duplicate arrows.
- [x] Remove fake static fire ambience; use light action sound effects with audio controls.
- [x] Saved unfinished runs with Continue and explicit two-step reset; privacy and credits pages.
