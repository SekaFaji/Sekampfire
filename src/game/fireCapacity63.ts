/** Patch #63 - permanent fire fuel-capacity progression and physically
 * stronger fire heat. One permanent level is worth +50 fuel up to 500.
 * The purchased tier is snapshotted at the start of a NEW run and persisted
 * in its old-version checkpoint, so purchases never retrofit ongoing runs.
 * Fuel itself is never granted by this upgrade. */
export const FIRE_BASE_CAPACITY63 = 100;
export const FIRE_STEP_CAPACITY63 = 50;
export const FIRE_MAX_LEVEL63 = 8;
export const FIRE_CAPACITY_COSTS63 = [18,28,40,54,70,88,108,130] as const;
export const FIRE_MAX_CAPACITY63 = FIRE_BASE_CAPACITY63 + FIRE_STEP_CAPACITY63 * FIRE_MAX_LEVEL63;

function level63(raw: unknown): number {
  return typeof raw === "number" && Number.isFinite(raw)
    ? Math.max(0, Math.min(FIRE_MAX_LEVEL63, Math.floor(raw))) : 0;
}
export function fireCapacityLevel63(meta: any): number {
  return level63(meta?.up?.firecap);
}
export function seedFireCapacity63(g: any, meta: any): void {
  g.fireCapacityTier63 = fireCapacityLevel63(meta);
}
export function fireFuelCapacity63(g: any): number {
  return FIRE_BASE_CAPACITY63 + FIRE_STEP_CAPACITY63 * level63(g?.fireCapacityTier63);
}
/** Uses real fuel AMOUNT, not the percentage of a larger vessel:
 * a 100-fuel flame feels the same whether the fire can hold 100 or 500.
 * Above 100, heat rises progressively but never exceeds a 75% bonus.
 * Empty / extinguished fires emit no heat. */
export function fireHeatStrength63(g: any): number {
  if (!g?.fireLit) return 0;
  const raw = Number(g.fuel);
  const fuel = Number.isFinite(raw) ? Math.max(0, Math.min(fireFuelCapacity63(g), raw)) : 0;
  return fuel <= 100 ? fuel / 100 : 1 + 0.75 * ((fuel - 100) / 400);
}
export function fireHeatRadius63(g: any): number {
  return 20 + 34 * fireHeatStrength63(g);
}
export function fireCapacityNextBenefit63(level: number): string {
  const next = Math.min(FIRE_MAX_LEVEL63, level63(level) + 1);
  return next > level63(level)
    ? "NEW RUNS: MAX FUEL " + (FIRE_BASE_CAPACITY63 + next * FIRE_STEP_CAPACITY63) + ". MORE FUEL MEANS MORE HEAT."
    : "MAX FIRE FUEL 500. THE FULLER THE FIRE, THE WARMER IT GETS.";
}
