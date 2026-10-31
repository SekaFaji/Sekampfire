/** Run-scoped camp station progression. Existing six building stages
 * remain intact; these small upgrades give players concrete mid-run goals.
 * Never serialize transient confirmation state.
 */
export const CAMP_STATIONS = {
  hearth: {
    label: "FIREPLACE",
    prices: [10, 18],
    benefits: ["SLOWER FIRE BURN", "WARMER CAMP, EVEN SLOWER BURN"],
  },
  bench: {
    label: "WORKBENCH",
    prices: [10, 16],
    benefits: ["NEW KINDLING RECIPE", "NEW LANTERN + CRAFT DISCOUNT"],
  },
  pile: {
    label: "LOG STORAGE",
    prices: [12, 20],
    benefits: ["+12 STORED WOOD", "+20 MORE STORED WOOD"],
  },
} as const;
export type StationId = keyof typeof CAMP_STATIONS;
export const stationIds = ["hearth", "bench", "pile"] as const;
export function stationLevel(g: any, id: StationId): number {
  const value = g.campUpgrades?.[id];
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(2, Math.floor(value))) : 0;
}
export function stationCost(g: any, id: StationId): number {
  const level = stationLevel(g, id);
  return level >= 2 ? 0 : CAMP_STATIONS[id].prices[level];
}
export function stationAvailable(g: any, id: StationId): boolean {
  return id === "hearth" || (id === "bench" ? !!g.builtBench : !!g.builtPile);
}
export function canCompleteCabin(g: any): boolean {
  return stationIds.every(id => stationLevel(g, id) >= 1);
}
export function stationFuelFactor(g: any): number {
  return [1, 0.88, 0.74][stationLevel(g, "hearth")];
}
export function stationStokeGain(g: any): number {
  return g.crafts?.kindling ? 21 : 16;
}
export function stationTorchBonus(g: any): number {
  return g.crafts?.lantern ? 20 : 0;
}
export function stationCraftCost(g: any, recipe: any): number {
  return Math.max(1, recipe.cost - (stationLevel(g, "bench") >= 2 ? 2 : 0));
}
export function stationPileBonus(g: any): number {
  return [0, 12, 32][stationLevel(g, "pile")];
}
/** Spend only from actual carried and stored wood after reconfirmation. */
export function purchaseStation(g: any, id: StationId): boolean {
  if (!stationAvailable(g, id) || stationLevel(g, id) >= 2) return false;
  const cost = stationCost(g, id);
  if (g.player.wood + g.stored < cost) return false;
  const carried = Math.min(g.player.wood, cost);
  g.player.wood -= carried;
  g.stored -= cost - carried;
  g.campUpgrades ??= { hearth: 0, bench: 0, pile: 0 };
  g.campUpgrades[id] = stationLevel(g, id) + 1;
  return true;
}
