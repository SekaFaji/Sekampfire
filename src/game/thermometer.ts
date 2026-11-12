import { DAY_LEN, CX, WEATHER_TEXT } from "./config";
import { clamp } from "./math";
import { visualSeason } from "./palette";
import { weatherIntensity } from "./weather";
import { drawText, textW } from "./font";
import { lerpHex } from "./renderUtils";
import { fireHeatRadius63, fireHeatStrength63 } from "./fireCapacity63";

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

/** Player-local air, measured by one thermometer. Outside climate stays
 * independent of the player and their equipment. Close to a lit fire, nearby
 * air warms gradually with distance and fuel; the instrument itself eases
 * between these temperatures through settleThermometer(). */
export function localTemperature(g: any): number {
  const outdoor = ambientTemperature(g);
  const strength = fireHeatStrength63(g);
  if (strength <= 0 || !Number.isFinite(g.player?.x)) return outdoor;
  const radius = fireHeatRadius63(g); // same real heat radius as Cold and Warmth
  const proximity = clamp(1 - Math.abs(g.player.x - CX) / radius, 0, 1);
  const heat = proximity * (4 + strength * 8);
  return clamp(outdoor + heat, AIR_TEMP_MIN, AIR_TEMP_MAX);
}

/** Four separate HUD frames, all in the existing y=17..39 band:
 * WARMTH/FUEL | LOCAL TEMPERATURE AND WEATHER | CARRIED/ASH | DAY/MENU.
 * Temp has its own lovely full-width glass rail despite the smaller panel. */
export const THERMOMETER_RECT = { x: 108, y: 17, w: 85, h: 23 } as const;

export function formatTemperature(value: number): string {
  const n = Math.round(clamp(Number.isFinite(value) ? value : 0, AIR_TEMP_MIN, AIR_TEMP_MAX));
  return (n > 0 ? "+" : "") + n;
}

/** Original engraved brass/glass art at 320x180 native pixel resolution.
 * Temperature + current weather occupy ONE line, with the second line
 * entirely dedicated to the breathing glass thermometer. All pixels fit
 * the smaller panel, and no UI click zones are created. */
export function drawLivingThermometer(ctx: any, g: any): void {
  const temperature = clamp(
    Number.isFinite(g.thermometerTemp) ? g.thermometerTemp : localTemperature(g),
    AIR_TEMP_MIN, AIR_TEMP_MAX
  );
  const t = Number.isFinite(g.animT) ? g.animT : 0;
  const liquid = thermometerLiquidColor(temperature);
  const liquidHighlight = lerpHex(liquid, "#fff0d2", 0.47);
  const cold = temperature <= 0;
  const warm = temperature >= 20;
  const weather = WEATHER_TEXT[g.weather] || "CLEAR";

  // +8°C | WINDY - inline on the same row, including a hand-drawn degree
  // ring and hairline divider because these aren't in the small pixel font.
  const value = formatTemperature(temperature);
  const labelX = 112;
  drawText(ctx, value, labelX, 20, cold ? "#bde6f0" : warm ? "#f1c18b" : "#f2e0be");
  const degreeX = labelX + textW(value) + 2;
  ctx.fillStyle = "#d3b997";
  ctx.fillRect(degreeX, 20, 2, 1);
  ctx.fillRect(degreeX, 22, 2, 1);
  ctx.fillRect(degreeX - 1, 21, 1, 1);
  ctx.fillRect(degreeX + 2, 21, 1, 1);
  drawText(ctx, "C", degreeX + 4, 20, "#e1d0b5");
  const dividerX = degreeX + 11;
  ctx.fillStyle = "#b69d78";
  ctx.fillRect(dividerX, 20, 1, 5);
  drawText(ctx, weather, dividerX + 4, 20, "#c6d8d7");

  // Weathered wood nameplate and small rivets - all inside x108..192.
  ctx.fillStyle = "#8b7150";
  ctx.fillRect(111, 27, 1, 1);
  ctx.fillRect(189, 27, 1, 1);
  ctx.fillStyle = "#d2b184";
  ctx.fillRect(111, 26, 1, 1);
  ctx.fillRect(189, 26, 1, 1);

  // Brass scale and tiny, varied-width engraved graduations.
  for (let i = 0; i <= 12; i++) {
    const tickX = 126 + i * 5;
    const major = i % 3 === 0;
    ctx.fillStyle = major ? "#ceb182" : "#8e795d";
    ctx.fillRect(tickX, major ? 25 : 26, 1, major ? 3 : 2);
  }
  const zeroX = 126 + Math.round(60 * (0 - AIR_TEMP_MIN) / (AIR_TEMP_MAX - AIR_TEMP_MIN));
  ctx.fillStyle = "#e6e6d4";
  ctx.fillRect(zeroX, 25, 1, 3);

  // A near-panel-width glass tube, with an inset dark core and two-tone
  // liquid, a 1px brass lip and a shaped metal end cap.
  ctx.fillStyle = "rgba(4,10,18,0.48)";
  ctx.fillRect(116, 37, 73, 1);
  ctx.fillStyle = "#403429";
  ctx.fillRect(124, 28, 65, 9);
  ctx.fillStyle = "#b78b53";
  ctx.fillRect(125, 28, 63, 1);
  ctx.fillStyle = "#77583a";
  ctx.fillRect(125, 36, 63, 1);
  ctx.fillStyle = "#d4ad70";
  ctx.fillRect(126, 29, 61, 1);
  ctx.fillStyle = "#233d49";
  ctx.fillRect(126, 30, 60, 5);
  ctx.fillStyle = "rgba(113,169,181,0.22)";
  ctx.fillRect(127, 30, 58, 1);
  ctx.fillStyle = "#172b36";
  ctx.fillRect(126, 34, 59, 1);

  const ratio = (temperature - AIR_TEMP_MIN) / (AIR_TEMP_MAX - AIR_TEMP_MIN);
  const fill = Math.max(1, Math.min(59, Math.round(59 * ratio)));
  ctx.fillStyle = liquid;
  ctx.fillRect(126, 32, fill, 2);
  ctx.fillStyle = liquidHighlight;
  ctx.fillRect(126, 32, fill, 1);
  const tipX = 126 + fill - 1;
  ctx.fillStyle = lerpHex(liquid, "#fff7dd", 0.65);
  ctx.fillRect(tipX, 31, 1, 2);
  if (fill < 59) {
    ctx.fillStyle = "#243744";
    ctx.fillRect(126 + fill, 32, 59 - fill, 1);
  }
  ctx.fillStyle = "rgba(243,226,187,0.16)";
  ctx.fillRect(133, 35, 48, 1);
  ctx.fillStyle = "#997449";
  ctx.fillRect(186, 29, 2, 7);
  ctx.fillStyle = "#ddbc83";
  ctx.fillRect(187, 30, 1, 3);

  // Hand-shaped bulb with a reflective glass inset. The tube genuinely
  // meets the bulb rather than visually starting in the middle of the bar.
  ctx.fillStyle = "#382d29";
  ctx.fillRect(115, 28, 11, 9);
  ctx.fillRect(117, 27, 7, 11);
  ctx.fillStyle = "#b08a5a";
  ctx.fillRect(116, 29, 9, 7);
  ctx.fillRect(118, 28, 5, 9);
  ctx.fillStyle = "#263f4a";
  ctx.fillRect(117, 30, 7, 6);
  ctx.fillRect(118, 29, 5, 7);
  ctx.fillStyle = liquid;
  ctx.fillRect(117, 32, 7, 3);
  ctx.fillRect(118, 30, 5, 4);
  ctx.fillStyle = liquidHighlight;
  ctx.fillRect(119, 30, 2, 3);
  ctx.fillStyle = "rgba(246,251,248,0.64)";
  ctx.fillRect(117, 29, 1, 2);
  ctx.fillStyle = "#f1cd8b";
  ctx.fillRect(118, 27, 5, 1);

  const glint = 132 + Math.round(((Math.sin(t * 0.9) + 1) / 2) * 46);
  ctx.fillStyle = "rgba(229,248,250,0.46)";
  ctx.fillRect(glint, 30, 2, 1);
  ctx.fillStyle = "rgba(248,245,222,0.18)";
  ctx.fillRect(glint + 1, 31, 1, 2);

  if (cold) {
    ctx.fillStyle = "#a7d6e2";
    ctx.fillRect(181, 32, 2, 1);
    ctx.fillRect(180, 34, 1, 1);
    ctx.fillRect(183, 30, 1, 2);
  } else if (warm) {
    const alpha = 0.23 + (Math.sin(t * 1.5) + 1) * 0.08;
    ctx.fillStyle = `rgba(248,186,96,${alpha.toFixed(3)})`;
    ctx.fillRect(179, 32, 3, 3);
    ctx.fillStyle = "#c38d54";
    ctx.fillRect(182, 30, 1, 1);
  }
}
