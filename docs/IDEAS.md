# Gameplay and design notes

This page collects the present direction for Sekampfire. Historical brainstorming, including superseded UI layouts and proposed balance values, is preserved in the [design archive](DESIGN_ARCHIVE.md).

## Core game loop

1. Explore the forest and collect Pine Logs.
2. Return to camp, feed the fire and protect the player's Warmth.
3. Build useful stations, equipment and shelter from real collected resources.
4. Survive nights and complete Grooty's objectives.
5. Bank earned Ash and improve future runs.

The game should stay **short-run and replayable**, with meaningful long-term upgrades rather than unnecessary menu complexity.

## Design principles

- **Readable pixel art:** Keep a consistent 320 x 180 world and native-pixel UI. Use the real in-game sprites and avoid temporary emoji art.
- **The fire is the heart of the game:** More actual fuel should mean stronger, broader heat. Fire Capacity is storage, never free fuel.
- **One survival system:** Warmth is the player's survival resource. Cold exposure represents environmental pressure; Cold protection slows Warmth loss, without inventing unrelated life bars.
- **Physical interactions:** A structure must actually be built before it can be used. Permanent Camp Legacy can prebuild specific structures on new runs, while Mastery upgrades improve their existing station levels.
- **Earned progression:** Wood, Ash, pet cargo and equipment must be accounted for. Completing a mission should not duplicate resources.
- **Persistent but predictable:** Permanent purchases affect newly created runs; continuing an old saved run should not silently inherit new buildings or bonuses.
- **Calm but alive:** Weather, seasonal wildlife, water and atmospheric events should make the forest feel inhabited without distracting from survival.

## Decisions still open

- Final Level 2 mission sequence, rewards and pacing.
- Real-device visual polish for the Shop and fire at 500 fuel.
- Long-run economy and winter balance, especially with stacked Cold protection.
- Future clothing/equipment slots, additional collectible logs, and expanded companion variety.
- Android packaging, signing and device-specific save strategy.

Ideas here are not implementation claims. Build and verify them individually, then record the finished behavior in the [active backlog](BACKLOG.md) and [PR history](https://github.com/SekaFaji/Sekampfire/pulls).
