# Sekampfire

A cozy pixel-art winter survival game. Keep the fire burning, chop wood, build up your camp and outlast the Long Night.

**Play:** https://sekafaji.github.io/Sekampfire/

## How it plays

- Hold the left or right side of the screen to walk (or use A / D).
- Press ACT (big button or E) to chop trees, stoke the fire and interact. Hold it to keep chopping.
- Carry 15 logs to each marked build site to raise the workbench and the wood pile. You initially carry 5 logs; each backpack upgrade adds 8 capacity (up to 21 with both).
- Craft gear at the workbench, upgrade the camp through six build stages, and keep your warmth up - the cold bites hardest at the start.
- Survive the nights to earn ash, and spend it on permanent flame-lineage upgrades between runs.
- Press P or ESC (or MENU beneath the minimap) to pause, tweak settings, or end the run and bank your ash.

## Visuals and controls

- A reflective foreground river and parallax pine silhouettes add depth to the winter landscape.
- BUILD, ACT and TORCH float over the water; MENU sits at the top right below the minimap.
- The original left/right movement arrows and hold-a-side movement remain unchanged. Holding a direction now tints only the outer 15% of that screen edge, without extra arrow shapes.
- River controls remain transparent, and the shoreline follows a soft irregular edge rather than a bright straight line.
- The autumn opening gradually gives way to winter, spring and summer palettes; seasons change visuals, not survival balance.
- The left, middle and right regions reveal hills, forest and mountains with smoothly blended backgrounds.
- The camp now shares continuous ground with the world; the workbench no longer emits an artificial light halo.

## Living-world polish

- Tree art is larger than the player, with saplings and mature trees scaled around their root points without changing tree hit points or chopping rules. The carried wood bundle draws one little log per log held, with miniature rows that fit the backpack.

- The river reflects the player's walking and chopping poses, animated trees, camp structures, the fire and the dog. The land/ground overlay is excluded from the reflection to avoid false stripes.
- The waterline now blends into the world, and the game canvas has no black frame beneath the river.
- Snowy footsteps fade behind the player in winter. Existing rabbits, foxes, the fire and weather have more subtle ambient movement.
- Birds, foxes, rabbits and the dog have more independent idle movements and fewer repetitive notifications. Wind, rain, fog and snow effects crossfade smoothly when weather changes.
- Procedural sound effects use filtered noise for footsteps, chopping and construction. The harsh continuous fire/static channel and artificial crackles are disabled until better fire audio is available; wind and action effects remain.
- Wind ambience, footsteps, chopping, ignition and building cues use browser-generated sound (no downloaded audio files). Sound starts after a tap or key press. **Settings → Audio** offers independent master, ambience and effects volume adjustments from 0–100%, plus mute.

## Player, privacy and settings polish

- The player's pixel-art avatar has a stronger outline, shaded coat, scarf, backpack, improved walk/idle motion, axe swing and torch pose; gameplay collision and movement speed are unchanged. The starting hat is removed (there is no craftable hat), starter footwear is plain, and Warm Boots appear only after crafting them.
- **Settings** includes Audio, a HIGH/LOW visual-effects toggle, Privacy Policy, Credits and a red Reset Save flow.
- **Reset Save** requires two explicit confirmations and then deletes only Sekampfire permanent progress, checkpoints and legacy progress keys. Audio preferences remain unchanged; reset cannot be undone.
- The in-game Privacy Policy links to [the full privacy page](privacy.html). The game stores save data locally; its hosting and CDN dependencies are detailed in the policy.
- **Low visual FX** reduces snow particle counts and reflection scanlines on slower devices. High remains the default.

## Tech

- Everything runs in a single React canvas: custom 3x5 pixel font, immediate-mode in-canvas UI, procedurally drawn pixel art - no image or audio assets.
- `index.html` is the whole game: the TSX source is embedded and compiled in the browser (React UMD + Babel standalone), so there is no build step.
- Permanent ash and upgrades save to localStorage as `sekampfire-meta-v1`.
- An unfinished run is checkpointed separately under `sekampfire-run-v1`. **Continue Run** appears on the title screen after reload, with a separate **New Run** option. Refreshing or backgrounding the browser does not grant idle/offline rewards; time is paused while away.
- On death, retirement or victory the checkpoint is cleared before banking ash, so a completed run cannot be resumed for duplicate rewards. Local browser storage may still be cleared by the browser or user.
