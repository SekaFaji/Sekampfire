import { campEstablished, campClaimBounds } from "./campBoundary";

/** Patch #62: these Ash purchases seed the NEXT run's station tiers.
 * This deliberately does not build stations, light fires or hand out logs.
 * Station levels remain in g.campUpgrades (the existing v1 run checkpoint),
 * so buying another permanent tier cannot modify a run in progress. */
export type CampMasteryId62 = "hearth" | "fence" | "workshop" | "storage";

const NEXT_BENEFITS62: Record<CampMasteryId62, readonly [string, string]> = {
  hearth: ["NEW RUNS: FIREPLACE UPGRADE LV1, SLOWER FUEL BURN.", "NEW RUNS: FIREPLACE UPGRADE LV2, MORE HEAT."],
  fence: ["NEW RUNS: +8 COLD PROTECTION INSIDE BUILT FENCES. SLOWER WARMTH LOSS.", "NEW RUNS: +16 COLD PROTECTION INSIDE BUILT FENCES. SLOWER WARMTH LOSS."],
  workshop: ["NEW RUNS: BUILT WORKBENCH HAS LV1 RECIPES.", "NEW RUNS: BUILT WORKBENCH HAS LV2 + DISCOUNT."],
  storage: ["NEW RUNS: BUILT LOG PILE GETS +20 CAPACITY.", "NEW RUNS: BUILT LOG PILE GETS +40 CAPACITY."]
};

function tier(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(2, Math.floor(value))) : 0;
}
export function campMasteryLevel62(meta: any, id: CampMasteryId62): number {
  return tier(meta?.up?.[id]);
}
export function campMasteryNextBenefit62(id: string, level: number): string {
  if (!(id in NEXT_BENEFITS62)) return "UNKNOWN CAMP UPGRADE.";
  const n = tier(level);
  return NEXT_BENEFITS62[id as CampMasteryId62][n] || "ALL LEVELS RESTORED ON NEW RUNS.";
}

/** Takes a permanent snapshot at the start of each fresh run.
 * An unbuilt bench or storage site keeps its latent station tier, but
 * crafting, storage and upgrades are still gated by actual construction. */
export function applyCampMastery62(g: any, meta: any): void {
  g.campUpgrades ??= { hearth: 0, bench: 0, pile: 0 };
  g.campUpgrades.hearth = campMasteryLevel62(meta, "hearth");
  g.campUpgrades.bench = campMasteryLevel62(meta, "workshop");
  g.campUpgrades.pile = campMasteryLevel62(meta, "storage");
  g.fenceMastery62 = campMasteryLevel62(meta, "fence");
}

/** Actual shelter bonus requires TWO physical fence posts and the player
 * standing within the claimed camp. Lit torches remain their own separate
 * drain-blocking mechanic, never granted or extended by this perk. */
export function fenceProtection62(g: any): number {
  const level = tier(g?.fenceMastery62);
  if (!level || !campEstablished(g) || !Number.isFinite(g?.player?.x)) return 0;
  const { west, east } = campClaimBounds(g);
  return g.player.x >= west && g.player.x <= east ? 8 * level : 0;
}
