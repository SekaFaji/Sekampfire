# Sekampfire

A cozy pixel-art winter survival game. Keep the fire burning, chop wood, build up your camp and outlast the Long Night.

**Play:** https://sekafaji.github.io/Sekampfire/

## How it plays

- Hold the left or right side of the screen to walk (or use A / D).
- Press ACT (big button or E) to chop trees, stoke the fire and interact. Hold it to keep chopping.
- Carry 15 logs to each marked build site to raise the workbench and the wood pile.
- Craft gear at the workbench, upgrade the camp through six build stages, and keep your warmth up - the cold bites hardest at the start.
- Survive the nights to earn ash, and spend it on permanent flame-lineage upgrades between runs.
- Press P or ESC (or MENU beneath the minimap) to pause, tweak settings, or end the run and bank your ash.

## Visuals and controls

- A reflective foreground river and parallax pine silhouettes add depth to the winter landscape.
- BUILD, ACT and TORCH float over the water; MENU sits at the top right below the minimap.
- The original left/right movement arrows and hold-a-side movement remain unchanged.

## Tech

- Everything runs in a single React canvas: custom 3x5 pixel font, immediate-mode in-canvas UI, procedurally drawn pixel art - no image or audio assets.
- `index.html` is the whole game: the TSX source is embedded and compiled in the browser (React UMD + Babel standalone), so there is no build step.
- Progress saves to localStorage as `sekampfire-meta-v1`.
