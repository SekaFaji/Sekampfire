import { clamp } from "./math";
import { stationLevel } from "./campProgress";

/** Heat absorbed by lingering near a lit fire, in game-time seconds.
 * Starts gently and rises smoothly; time outside its radius cools the
 * *soak bonus* over four seconds without adding extra warmth damage. */
export const HEAT_SOAK_SECONDS = 8;
export const HEAT_FADE_SECONDS = 4;
export function advanceHeatSoak(seconds: number, dt: number, byFire: boolean): number {
  const t = Number.isFinite(seconds) ? seconds : 0;
  const change = Math.max(0, Number.isFinite(dt) ? dt : 0);
  return clamp(t + (byFire ? change : -2 * change), 0, HEAT_SOAK_SECONDS);
}

/** Warming contribution per second (before environmental cold is subtracted).
 * At 0s: +2; at 4s: +5.25; at 8s: +8.5.
 * The Log Bench and hearth upgrades retain their own warming advantages. */
export function fireWarmthRate(g: any): number {
  const t = clamp((Number(g.heatSoak) || 0) / HEAT_SOAK_SECONDS, 0, 1);
  const smooth = t * t * (3 - 2 * t);
  const base = 2 + 6.5 * smooth;
  return base * (g.stage >= 2 ? 1.25 : 1) + stationLevel(g, "hearth") * 0.7;
}
