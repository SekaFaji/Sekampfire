import { CRAFTS } from "./config";
import { stationLevel, stationCraftCost } from "./campProgress";
import { addStatusMessage } from "./statusMessages";

/** Run-scoped workbench recipes. Both the list and its callbacks retain
 * the original confirmation, cost, ownership and tool-equipping rules.
 * No engine imports: keep the game state as the caller-owned source of truth. */
export function benchRows(g: any, meta: any) {
  const recipes = CRAFTS.map((c: any) => {
    const level = stationLevel(g, "bench"), locked = level < (c.benchTier || 0);
    const owned = !!g.crafts[c.id];
    const cost = stationCraftCost(g, c);
    const total = g.player.wood + g.stored;
    const enabled = !locked && !owned && total >= cost;
    const confirm = g.craftConfirm === c.id && enabled;
    return {
      label: c.name.toUpperCase(),
      right: locked ? "BENCH LV" + c.benchTier : owned ? "OWNED" : confirm ? "CONFIRM?" : cost + " WOOD",
      desc: locked ? "UPGRADE WORKBENCH IN BUILD" :
        confirm ? "TAP AGAIN TO CRAFT - " + cost + " WOOD" : c.desc,
      h: 15, enabled,
      onDown: () => {
        g.buildConfirm = null;
        if (locked) { g.craftConfirm = null; addStatusMessage(g, "UPGRADE WORKBENCH IN BUILD FIRST."); return; }
        if (g.crafts[c.id]) { g.craftConfirm = null; addStatusMessage(g, c.name.toUpperCase() + " is already crafted."); return; }
        const realCost = stationCraftCost(g, c);
        if (g.player.wood + g.stored < realCost) { g.craftConfirm = null; addStatusMessage(g, "Not enough wood."); return; }
        if (g.craftConfirm !== c.id) { g.craftConfirm = c.id; return; }
        g.craftConfirm = null;
        const fromCarried = Math.min(g.player.wood, realCost);
        g.player.wood -= fromCarried;
        g.stored -= realCost - fromCarried;
        g.crafts[c.id] = true;
        // Keep an already-equipped permanent Grandpa's Axe: crafting a
        // weaker Wood Axe should never silently downgrade the player.
        if(c.id==="maul" && g.equippedAxe!=="grandpas_axe")
          g.equippedAxe="wood_axe";
        addStatusMessage(g, c.name.toUpperCase() + " crafted.");
      },
    };
  });
  // Station upgrades happen ONLY by selecting UPGRADE on the physical
  // Workbench popup, not inside the crafting recipe list.
  // Tools keep the starting essentials discoverable.
  return g.craftTab === 1 ? recipes.slice(3) : recipes.slice(0,3);
}

