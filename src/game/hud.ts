import { W, WORLD_W, CX, BENCH_X, PILE_X, WEATHER_TEXT } from "./config";
import { drawText, textW } from "./font";
import { clamp } from "./math";
import { drawLivingThermometer, THERMOMETER_RECT } from "./thermometer";
import { visualSeason, seasonDay } from "./palette";

// Translucent slate retains contrast while letting the real game sky,
// weather and forest stay visible behind the resource panels.
const WOOD_LIGHT = "rgba(206,174,119,0.82)";
const WOOD_MID = "rgba(148,106,64,0.80)";
const WOOD_DARK = "rgba(63,46,32,0.68)";
const INK = "rgba(18,30,41,0.64)";

/** One shared, native-resolution pixel frame for the in-game HUD.
 * UI only: doesn't introduce new sprites or replace the world renderer. */
export function drawHudFrame(ctx: any, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = WOOD_DARK;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = WOOD_MID;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillStyle = "#63492f";
  ctx.fillRect(x + 1, y + h - 1, w - 1, 1);
  ctx.fillRect(x + w - 1, y + 1, 1, h - 1);
  ctx.fillStyle = INK;
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = WOOD_LIGHT;
  ctx.fillRect(x + 1, y + 1, 1, 1);
  ctx.fillRect(x + w - 2, y + 1, 1, 1);
}

/** A genuine wide minimap from the existing live world coordinates and tree list,
 * not a new static artwork or a fabricated in-game landscape. */
export function drawCampMinimap(ctx: any, g: any, colors: any) {
  const x = 3, y = 2, w = W - 6, h = 13;
  drawHudFrame(ctx, x, y, w, h);
  const left = x + 3, right = x + w - 4;
  const mm = (worldX: number) => Math.round(left + clamp(worldX, 0, WORLD_W) / WORLD_W * (right - left));
  ctx.fillStyle = "rgba(110,122,121,0.20)";
  ctx.fillRect(x + 3, y + 3, w - 6, 7);
  ctx.fillStyle = colors.ridge;
  ctx.fillRect(left, y + 10, right - left + 1, 1);
  for (const tr of g.trees || []) {
    const tx = mm(tr.x);
    ctx.fillStyle = colors.treeLight;
    ctx.fillRect(tx, y + 4, 2, 5);
    ctx.fillStyle = "#5a4232";
    ctx.fillRect(tx, y + 9, 1, 1);
  }
  if (g.builtBench) {
    ctx.fillStyle = "#a06a3a";
    ctx.fillRect(mm(BENCH_X), y + 8, 2, 2);
  }
  if (g.builtPile) {
    ctx.fillStyle = "#8a5a34";
    ctx.fillRect(mm(PILE_X), y + 8, 2, 2);
  }
  const fx = mm(CX);
  ctx.fillStyle = "#f1a741";
  ctx.fillRect(fx - 1, y + 7, 3, 3);
  ctx.fillStyle = g.fireLit && Math.sin(g.animT * 9) > 0 ? "#ffdf85" : "#bb722e";
  ctx.fillRect(fx, y + 5, 1, 2);
  ctx.fillStyle = "#fff9ea";
  ctx.fillRect(mm(g.player.x), y + 5, 2, 5);
}

function meter(ctx: any, value: number, x: number, y: number, low: string, high: string) {
  const v = clamp(Number.isFinite(value) ? value : 0, 0, 100);
  ctx.fillStyle = "rgba(60,70,80,0.78)";
  ctx.fillRect(x, y, 52, 5);
  ctx.fillStyle = "rgba(19,29,39,0.72)";
  ctx.fillRect(x + 1, y + 1, 50, 3);
  const fill = Math.round(50 * v / 100);
  if (fill > 0) {
    const first = Math.min(fill, 30);
    ctx.fillStyle = low;
    ctx.fillRect(x + 1, y + 1, first, 3);
    if (fill > first) {
      ctx.fillStyle = high;
      ctx.fillRect(x + 1 + first, y + 1, fill - first, 3);
    }
  }
}

/** The new source-based layout uses exactly the same data as the old HUD.
 * The panel geometry leaves y=43 onward for notifications and guide access. */
export function drawCampHUD(ctx: any, g: any, meta: any) {
  drawHudFrame(ctx, 3, 17, 109, 23);
  drawHudFrame(ctx, THERMOMETER_RECT.x, THERMOMETER_RECT.y, THERMOMETER_RECT.w, THERMOMETER_RECT.h);
  drawHudFrame(ctx, 221, 17, 97, 23);

  const warmth = clamp(Number(g.player.warmth) || 0, 0, 100);
  const fuel = g.fireLit ? clamp(Number(g.fuel) || 0, 0, 100) : 0;
  // Return to two spacious, instantly readable survival meters.
  drawText(ctx, "WARMTH", 7, 21, "#eee1c7");
  meter(ctx, warmth, 39, 21, "#bc554a", "#ef8a6b");
  drawText(ctx, String(Math.round(warmth)), 95, 21, warmth < 25 ? "#ffae8d" : "#e8d5ac");
  drawText(ctx, "FUEL", 7, 32, "#eee1c7");
  meter(ctx, fuel, 39, 32, "#c77732", "#ffc267");
  drawText(ctx, String(Math.round(fuel)), 95, 32, fuel < 25 ? "#ffab7e" : "#e8d5ac");

  // A dedicated instrument replaces the old wood/Ash text block. The
  // hidden Cold pressure continues to control survival behind the scenes.
  drawLivingThermometer(ctx, g);

  const day = (g.isNight ? "NIGHT " + g.night : "DAY " + (g.night + 1));
  const weather = WEATHER_TEXT[g.weather] || "";
  drawText(ctx, day, 225, 21, "#f1e2c9");
  // Only render weather alongside day if both fit before the menu button.
  if (textW(day) + textW(weather) + 6 <= 53) {
    drawText(ctx, weather, 225 + textW(day) + 6, 21, "#c4d1d3");
  }
  drawText(ctx, visualSeason(g).toUpperCase() + " " + seasonDay(g) + "/7", 225, 32, "#dfc69d");
  // Special-run labels stay to the right of the 210px maximum status message,
  // never on top of the wooden panel borders or the central notification.
  if (g.endlessMode) {
    drawText(ctx, "E" + Math.floor(g.endlessN || 0), 274, 46, "#b7d4ed");
  } else if (g.longNightActive && Math.sin(g.animT * 6) > 0) {
    drawText(ctx, "LONG NIGHT", 274, 46, "#8fd0ff");
  }
}
