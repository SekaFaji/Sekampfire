import { clamp } from "./math";
import { stationLevel } from "./campProgress";
import { fireHeatStrength63 } from "./fireCapacity63";

/** Heat absorbed by lingering near a lit fire, in game-time seconds.
 * Starts gently and rises smoothly; time outside its radius cools the
 * *soak bonus* over four seconds without adding extra warmth damage. */
export const HEAT_SOAK_SECONDS = 8;
export const HEAT_FADE_SECONDS = 4;
export function advanceHeatSoak(seconds: number, dt: number, byFire: boolean): number {
  const t = Number.isFinite(seconds) ? seconds : 0;
  const change = Math.max(0, Number.isFinite(dt) ? dt : 0);
  return clamp(t + (byFire ? change : -(HEAT_SOAK_SECONDS / HEAT_FADE_SECONDS) * change), 0, HEAT_SOAK_SECONDS);
}

/** Warming contribution per second (before environmental cold is subtracted).
 * At 100 fuel: the original +2 to +8.5 soak curve is preserved.
 * Less fuel gives less heat, while amounts above 100 make an even larger
 * fireplace increasingly effective without infinite regeneration.
 * The Log Bench and hearth upgrades retain their warming advantages. */
export function fireWarmthRate(g: any): number {
  const t = clamp((Number(g.heatSoak) || 0) / HEAT_SOAK_SECONDS, 0, 1);
  const smooth = t * t * (3 - 2 * t);
  const base = 2 + 6.5 * smooth;
  const heat = fireHeatStrength63(g);
  const multiplier = 0.55 + 0.45 * heat; // 100 fuel = original rate; 500 fuel = 1.3375x
  return (base * (g.stage >= 2 ? 1.25 : 1) + stationLevel(g, "hearth") * 0.7) * multiplier;
}
