# Four-season world model

This is a **cosmetic/ecological** foundation only: fire depletion, warmth, crafting costs, tree health, progress, Ash settlement, and save formats remain unchanged. Future season-dependent difficulty requires separate design approval and tests.

## Calendar
One in-game season lasts **seven completed day/night cycles**. A new season starts at dawn after night 7, 14, 21, 28, etc. Never change seasons halfway through a night.

| Completed nights | Calendar | Wildlife |
|---|---|---|
| 0–6 | Autumn, days 1–7 | Fox, crow, squirrel |
| 7–13 | Winter, days 1–7 | Deer, owl, snow hare |
| 14–20 | Spring, days 1–7 | Frog, robin, rabbit |
| 21–27 | Summer, days 1–7 | Duck, dragonfly, butterfly |
| 28–34 | Autumn again | Repeats |

Season selection derives from existing `night` and `isNight` state; no new persistent keys are needed. `visualPalette` blends only at dawn when a season changes. Long Night remains a special weather event; snow particles can appear regardless of the underlying calendar season.

## Visual environment
- Autumn: amber foliage and falling-leaf details.
- Winter: snowy branch ledges and pale terrain.
- Spring: light green growth and new buds.
- Summer: dense bright foliage and fuller crowns.
- Existing colors also affect sky, shoreline, river and backdrops.

## Ambient creatures
Only cosmetic wildlife species change. Existing low-cost `type` behavior and the reflection pipeline remain shared; `species` specifies the seasonal look. This does not add hunting, inventory drops, collision or rewards.

## Water and controls
`src/game/water.ts` calculates bounded shoreline wash, without moving collision or terrain. Sparse and low-opacity glints replace continuous white foam strips.

Movement press feedback occupies the original 15% edge width, now with directional spatial gradients and frame-rate-independent easing on press/release. Original movement chevrons and touch hit zones are unchanged.

## QA remaining
All season boundaries and wildlife sprite variants are unit-tested. Inspect the actual 320×180 game at sunrise, winter nights, fast movement, the shoreline and full-screen phones. Device QA and visual approval remain outstanding.
