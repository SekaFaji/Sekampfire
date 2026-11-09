import { DAY_LEN } from "./config";
import { clamp } from "./math";
import { visualSeason } from "./palette";
import { weatherIntensity } from "./weather";
import { drawText, textW } from "./font";
import { lerpHex } from "./renderUtils";

/** Fictional camp-world ambient air temperature in degrees Celsius.
 * Not the personal Cold exposure value or character Warmth reserve.
 * Gear, campfire and Ash upgrades deliberately do not change this reading. */
export const AIR_TEMP_MIN = -30;
export const AIR_TEMP_MAX = 35;
export const THERMOMETER_SETTLE_SECONDS = 3.5;
const SEASON_DAY_C: Record<string, number> = {
  autumn: 11, winter: -5, spring: 14, summer: 25,
};

export function ambientTemperature(g: any): number {
  const season = visualSeason(g);
  // Keep the temperature in sync with the actual season calendar, including
  // the existing seven-day winter/spring rotation.
  let degrees = SEASON_DAY_C[season] ?? 11;
  const time = Number.isFinite(g.time) ? g.time : 10;
  const night = g.isNight === true || time >= DAY_LEN;
  if (night) degrees -= 7;

  // The same blended weather intensities used by the real world renderer.
  degrees -= weatherIntensity(g, "wind") * 2;
  degrees -= weatherIntensity(g, "fog") * 1;
  degrees -= weatherIntensity(g, "rain") * 4;
  degrees -= weatherIntensity(g, "coldsnap") * 10;
  degrees -= weatherIntensity(g, "blizzard") * 14;
  return clamp(degrees, AIR_TEMP_MIN, AIR_TEMP_MAX);
}

/** A damped, frame-rate-independent liquid movement. No random fluctuations
 * or constant false readings: the instrument comes to rest at its target. */
export function settleThermometer(current: number, target: number, dt: number): number {
  const destination = clamp(Number.isFinite(target) ? target : 11, AIR_TEMP_MIN, AIR_TEMP_MAX);
  if (!Number.isFinite(current)) return destination;
  const elapsed = Math.max(0, Number.isFinite(dt) ? dt : 0);
  const fraction = 1 - Math.exp(-elapsed / THERMOMETER_SETTLE_SECONDS);
  return clamp(current + (destination - current) * fraction, AIR_TEMP_MIN, AIR_TEMP_MAX);
}

export function thermometerLiquidColor(temperature: number): string {
  const c = clamp(Number.isFinite(temperature) ? temperature : 0, AIR_TEMP_MIN, AIR_TEMP_MAX);
  if (c <= 7) return lerpHex("#67b9e5", "#9bd7c9", (c - AIR_TEMP_MIN) / 37);
  return lerpHex("#9bd7c9", "#eb9f5d", (c - 7) / 28);
}

export const THERMOMETER_RECT = { x: 114, y: 17, w: 105, h: 23 } as const;

/** All hand-drawn at the game's native 320x180 resolution with strict pixel
 * rectangles. Caller draws the existing wooden HUD frame first.
 *
 * Scale is intentionally small: a carved nameplate, brass brackets and tick
 * marks, inset glass, reservoir bulb, colored liquid, crystal glint, and
 * chilly/warm finishing pixels. Every pixel stays inside the centre plaque.
 */
export function drawLivingThermometer(ctx: any, g: any): void {
  const temperature = clamp(
    Number.isFinite(g.thermometerTemp) ? g.thermometerTemp : ambientTemperature(g),
    AIR_TEMP_MIN, AIR_TEMP_MAX
  );
  const t = Number.isFinite(g.animT) ? g.animT : 0;
  const liquid = thermometerLiquidColor(temperature);
  const liquidHighlight = lerpHex(liquid, "#fff0d2", 0.47);
  const cold = temperature <= 0;
  const warm = temperature >= 20;

  // Engraved face label; every display element sits within the existing
  // translucent oak frame at x=114..218 / y=17..39.
  drawText(ctx, "AIR TEMP", 119, 20, "#d6bc91");
  const rounded = Math.round(temperature);
  const reading = (rounded > 0 ? "+" : "") + rounded;
  const digitsX = 204 - textW(reading);
  drawText(ctx, reading, digitsX, 20, cold ? "#bde6f0" : warm ? "#f1c18b" : "#eee0c5");

  // Custom two-pixel degree ring (the 3x5 game font has no degree glyph).
  ctx.fillStyle = "#b9a88c";
  ctx.fillRect(207, 20, 2, 1);
  ctx.fillRect(207, 22, 2, 1);
  ctx.fillRect(206, 21, 1, 1);
  ctx.fillRect(209, 21, 1, 1);
  drawText(ctx, "C", 211, 20, "#d8c8ae");

  // Delicate metallic mounting bolts and a raised nameplate groove.
  ctx.fillStyle = "#7f674c";
  ctx.fillRect(118, 27, 1, 2);
  ctx.fillRect(213, 27, 2, 1);
  ctx.fillStyle = "#d1ad71";
  ctx.fillRect(118, 27, 1, 1);
  ctx.fillRect(214, 27, 1, 1);

  // Graded tick marks above the tube - every fourth is slightly longer.
  for (let i = 0; i <= 12; i++) {
    const x = 129 + i * 4;
    const major = i % 3 === 0;
    ctx.fillStyle = major ? "#aa916d" : "#796c5d";
    ctx.fillRect(x, major ? 26 : 27, 1, major ? 2 : 1);
  }
  // Zero-degree reference mark, useful for recognizing freezing air.
  ctx.fillStyle = "#d6dbcf";
  ctx.fillRect(155, 26, 1, 2);

  // Instrument drop shadow and brass tube casing.
  ctx.fillStyle = "rgba(4,10,18,0.45)";
  ctx.fillRect(123, 37, 64, 1);
  ctx.fillStyle = "#41362d";
  ctx.fillRect(126, 28, 62, 9);
  ctx.fillStyle = "#b68d54";
  ctx.fillRect(127, 28, 60, 1);
  ctx.fillStyle = "#73583c";
  ctx.fillRect(127, 36, 60, 1);
  ctx.fillStyle = "#d4ad70";
  ctx.fillRect(128, 29, 58, 1);
  ctx.fillStyle = "#253e4a";
  ctx.fillRect(128, 30, 57, 5);
  ctx.fillStyle = "rgba(113,169,181,0.20)";
  ctx.fillRect(129, 30, 55, 1);
  ctx.fillStyle = "#192a36";
  ctx.fillRect(128, 34, 56, 1);

  // Animated liquid extends from a real bulb at the start of the glass.
  const ratio = (temperature - AIR_TEMP_MIN) / (AIR_TEMP_MAX - AIR_TEMP_MIN);
  const length = Math.max(1, Math.min(56, Math.round(56 * ratio)));
  ctx.fillStyle = liquid;
  ctx.fillRect(128, 32, length, 2);
  ctx.fillStyle = liquidHighlight;
  ctx.fillRect(128, 32, length, 1);
  const tipX = 128 + length - 1;
  ctx.fillStyle = lerpHex(liquid, "#fff7dd", 0.65);
  ctx.fillRect(tipX, 31, 1, 2);
  if (length < 56) {
    ctx.fillStyle = "#263744";
    ctx.fillRect(128 + length, 32, 56 - length, 1);
  }

  // Bulb / rounded glass reservoir, foregrounded over tube's left end.
  ctx.fillStyle = "#382d29";
  ctx.fillRect(120, 28, 10, 9);
  ctx.fillRect(122, 27, 6, 11);
  ctx.fillStyle = "#ae8855";
  ctx.fillRect(121, 29, 8, 7);
  ctx.fillRect(123, 28, 4, 9);
  ctx.fillStyle = "#264351";
  ctx.fillRect(122, 30, 6, 6);
  ctx.fillRect(123, 29, 4, 7);
  ctx.fillStyle = liquid;
  ctx.fillRect(122, 32, 6, 3);
  ctx.fillRect(123, 30, 4, 4);
  ctx.fillStyle = liquidHighlight;
  ctx.fillRect(124, 30, 2, 3);
  ctx.fillStyle = "rgba(245,250,248,0.66)";
  ctx.fillRect(122, 29, 1, 2);
  ctx.fillStyle = "#f1cd8b";
  ctx.fillRect(123, 27, 4, 1);

  // Glass sheen travels gently, only across empty/safe glass coordinates.
  const glint = 135 + Math.round(((Math.sin(t * 0.9) + 1) / 2) * 40);
  ctx.fillStyle = "rgba(229,248,250,0.46)";
  ctx.fillRect(glint, 30, 2, 1);
  ctx.fillStyle = "rgba(248,245,222,0.18)";
  ctx.fillRect(glint + 1, 31, 1, 2);

  if (cold) {
    // Just three crystalline ice flecks, not an opaque snow overlay.
    ctx.fillStyle = "#a7d6e2";
    ctx.fillRect(191, 32, 2, 1);
    ctx.fillRect(190, 34, 1, 1);
    ctx.fillRect(193, 30, 1, 2);
  } else if (warm) {
    // A restrained honey-coloured lamp gleam inside the brass fixture.
    const alpha = 0.23 + (Math.sin(t * 1.5) + 1) * 0.08;
    ctx.fillStyle = `rgba(248,186,96,${alpha.toFixed(3)})`;
    ctx.fillRect(189, 32, 3, 3);
    ctx.fillStyle = "#c38d54";
    ctx.fillRect(191, 30, 1, 1);
  }
}
