import { CX } from "./config";
import { clamp } from "./math";
import { visualSeason } from "./palette";
import { weatherIntensity } from "./weather";
import { localTemperature } from "./thermometer";
import { protectedByFenceTorches } from "./fenceTorches47";
import { activePet } from "./companion";
import { fenceProtection62 } from "./campMastery62";

/** Cold represents environmental exposure (0-100), NOT a second life bar.
 * It replaces the weather-specific warmth drain additions in game.ts. */
export const COLD_RESPONSE_SECONDS = 5;
export const RAIN_WET_RATE = 5;
export const FIRE_DRY_RATE = 8;
export const AMBIENT_DRY_RATE = 1.8;

export function shelteredFromRain(g: any): boolean {
  // A built Lean-to keeps the player dry only near the actual campsite.
  return g.stage >= 3 && Math.abs(g.player.x - CX) < 52;
}

export function fireSheltered(g: any): boolean {
  // Same fire-radius rule used by warmth recovery, not an invented larger area.
  const wr = 20 + (g.fireLit ? g.fuel / 100 : 0) * 34;
  return g.fireLit && Math.abs(g.player.x - CX) < wr;
}

/** Equipment and nearby companions reduce Cold exposure; they do not
 * replenish Warmth or alter the outside air thermometer. This is the single
 * stat future wearable clothing can extend without a second Cold bar.
 * The scarf is a permanent passive upgrade; boots are run-only crafted gear.
 * Bingsu must actually be equipped, visible and close to share her warmth. */
export const COLD_PROTECTION = { boots: 12, scarf: 15, bingsu: 5 } as const;
export function coldProtection(g: any, meta?: any): number {
  let protection = g?.crafts?.boots ? COLD_PROTECTION.boots : 0;
  if ((Number(meta?.up?.scarf) || 0) > 0) protection += COLD_PROTECTION.scarf;
  const nearby = Number.isFinite(g?.player?.x) && Number.isFinite(g?.dog?.x)
    && Math.abs(g.player.x - g.dog.x) <= 25 && !g.dog.hidden;
  if (nearby && activePet(meta) === "dog") protection += COLD_PROTECTION.bingsu;
  protection += fenceProtection62(g);
  return protection;
}

/** Target exposure, sampled from actual run weather, season, equipment and
 * dampness. Weather blends once, and the meter itself eases into the target. */
export function coldTarget(g: any, meta?: any): number {
  const p = g.player || { x: CX };
  const wet = clamp(Number(g.dampness) || 0, 0, 100);
  let target = g.isNight ? 38 : 14;
  if (visualSeason(g) === "winter") target += 10;
  target += weatherIntensity(g, "wind") * 9;
  target += weatherIntensity(g, "fog") * 4;
  target += weatherIntensity(g, "rain") * 16;
  target += weatherIntensity(g, "coldsnap") * 22;
  target += weatherIntensity(g, "blizzard") * 43;
  target += wet * 0.14;
  target -= coldProtection(g, meta);
  if (fireSheltered(g)) target -= 12;
  if (g.stage >= 5 && Math.abs(p.x - CX) < 50) target -= 6;
  return clamp(target, 0, 100);
}

/** Advances the optional run-local climate fields, with no randomness or
 * dt-specific jumps. Rain gradually wets unprotected campers; a fire or
 * shelter dries them. Missing fields are safe for pre-v36 checkpoints. */
export function advanceCold(g: any, dt: number, meta?: any): void {
  const elapsed = Math.max(0, Number.isFinite(dt) ? dt : 0);
  const dampness = clamp(Number(g.dampness) || 0, 0, 100);
  const safe = shelteredFromRain(g);
  const fire = fireSheltered(g);
  const rain = weatherIntensity(g, "rain");
  const delta = fire ? -FIRE_DRY_RATE
    : safe ? -AMBIENT_DRY_RATE * 2
    : rain > 0.01 ? RAIN_WET_RATE * rain
    : -AMBIENT_DRY_RATE;
  g.dampness = clamp(dampness + delta * elapsed, 0, 100);

  const target = coldTarget(g, meta);
  const current = clamp(Number.isFinite(g.cold) ? g.cold : target, 0, 100);
  g.cold = clamp(current + (target - current) * (1 - Math.exp(-elapsed / COLD_RESPONSE_SECONDS)), 0, 100);
}

/** Colder REAL local air directly raises warmth loss on top of the existing
 * Cold exposure meter. The bounded factor makes freezing nights threatening
 * without doubling the historical weather damage indiscriminately.
 * Fence torches block drain only in their lit, claimed safe area; they never
 * create the fire's replenishing heat-soak effect. */
export function airTemperatureDrainFactor(g:any):number {
  const degrees=localTemperature(g); // genuine local Celsius, not damped HUD text
  return 1 + clamp((8-degrees)*0.022,0,0.72);
}
export function coldWarmthDrain(g: any, meta: any): number {
  if(protectedByFenceTorches(g))return 0;
  const cold = clamp(Number.isFinite(g.cold) ? g.cold : coldTarget(g), 0, 100);
  let drain = 0.35 + cold * 0.045 + (Number(g.depth) || 0) * 0.15;
  drain *= airTemperatureDrainFactor(g);
  drain *= 1 - 0.15 * clamp(Number(meta?.up?.blood) || 0, 0, 3);
  if (g.player.torchT > 0) drain *= 0.5;
  if (g.stage >= 6 && Math.abs(g.player.x - CX) < 44) drain *= 0.35;
  else if (g.stage >= 5 && Math.abs(g.player.x - CX) < 50) drain *= 0.6;
  return Math.max(0, drain);
}
