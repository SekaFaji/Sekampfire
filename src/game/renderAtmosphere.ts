import { clamp } from "./math";
import { lerpHex, px } from "./renderUtils";

/** Small deterministic scene accents. Do not consume Math.random() or alter the
 * simulation's world objects: rendering a second frame must not change a save.
 */
function noise(n: number, salt = 0): number {
  const value = Math.sin(n * 91.731 + salt * 17.23) * 43758.5453;
  return value - Math.floor(value);
}

export function drawWoodlandSilhouettes(
  ctx: any, camX: number, parallax: number, base: number,
  color: string, spacing: number, seed: number, season = "autumn",
): void {
  const scroll = Math.round(camX * parallax);
  const start = Math.floor((scroll - 40) / spacing);
  const end = Math.ceil((scroll + 360) / spacing);
  const shadow = lerpHex(color, "#172b30", 0.27);
  const highlight = lerpHex(color, "#c2c9af", 0.16);

  ctx.save();
  ctx.translate(-scroll, 0);
  for (let i = start; i <= end; i++) {
    const n = noise(i, seed);
    const kind = Math.floor(noise(i + 17, seed + 3) * 3);
    const x = Math.round(i * spacing + (n - 0.5) * 12);
    const height = Math.round(21 + n * 17);
    const spread = Math.round(5 + noise(i, seed + 7) * 4);
    const top = base - height;
    const trunkW = kind === 1 ? 3 : 2;

    // Small branch/trunk contour remains visible between grouped crowns.
    px(ctx, x - 1, top + 7, trunkW, Math.max(1, height - 7), shadow);
    px(ctx, x, top + 9, 1, Math.max(1, height - 10), color);

    if (kind === 0) {
      // Fir: distinct compact boughs, rather than one solid triangle.
      for (let row = 0; row < 5; row++) {
        const y = top + row * 5;
        const width = Math.max(2, Math.round((spread + 1) * (row + 1) / 5));
        px(ctx, x - width + 1, y + 1, width * 2 - 1, 3, shadow);
        px(ctx, x - width + 2, y + 1, Math.max(1, width * 2 - 3), 1, color);
        if (row < 4) px(ctx, x - Math.max(1, width - 2), y, Math.max(2, width), 1, highlight);
        px(ctx, x - width, y + 3, 2, 2, shadow);
        px(ctx, x + width - 1, y + 3, 2, 2, shadow);
      }
      px(ctx, x, top - 2, 1, 4, season === "winter" ? "#abbac6" : color);
      if (season === "winter") px(ctx, x - 3, top + 6, 6, 1, "#abbac6");
    } else if (kind === 1) {
      // Broadleaf: bare forked winter branches, summer fullness, compact
      // spring growth, and broken amber clumps in autumn.
      const crownY = top + 5;
      if (season === "winter") {
        for (const side of [-1, 1]) {
          for (let branch = 0; branch < 4; branch++) {
            const bx = x + side * (branch + 1);
            px(ctx, bx, top + 8 + branch * 2, 2, 2, shadow);
          }
          px(ctx, x + side * 5, crownY + 2, 1, 4, shadow);
          px(ctx, x + side * 3, crownY - 1, 1, 3, color);
        }
        px(ctx, x - 2, crownY - 3, 4, 2, "#aab7c4");
      } else {
        const dense = season === "summer" ? 2 : season === "spring" ? -2 : 0;
        const width = Math.max(4, spread + dense);
        const bright = season === "spring" ? lerpHex(color, "#b4c797", 0.40)
          : season === "autumn" ? lerpHex(color, "#c39155", 0.36) : highlight;
        px(ctx, x - width + 2, crownY, width * 2 - 3, 12, shadow);
        px(ctx, x - width, crownY + 3, width * 2 + 1, 8, color);
        px(ctx, x - width + 2, crownY + 11, width * 2 - 3, 4, shadow);
        px(ctx, x - width + 3, crownY - 2, Math.max(2, width - 1), 5, color);
        px(ctx, x + 1, crownY - 3, Math.max(2, width - 1), 6, color);
        px(ctx, x - width + 2, crownY + 4, Math.max(2, width - 2), 2, bright);
        px(ctx, x + 1, crownY + 2, Math.max(2, width - 3), 2, bright);
        if (season === "autumn") {
          px(ctx, x - width + 1, crownY + 10, 3, 2, shadow);
          px(ctx, x + width - 4, crownY + 7, 2, 2, "#a17750");
        }
      }
    } else {
      // Pine: asymmetric wide steps, separated dark undersides.
      px(ctx, x, top - 1, 1, 4, season === "winter" ? "#abbac6" : color);
      for (let row = 0; row < 4; row++) {
        const y = top + row * 7;
        const left = Math.max(2, Math.round(spread * (row + 2) / 5));
        const right = Math.max(2, left + (row % 2 === 0 ? 1 : -1));
        px(ctx, x - left, y + 2, left + right + 1, 3, shadow);
        px(ctx, x - left + 1, y + 1, left + right - 1, 2, color);
        px(ctx, x - Math.max(1, left - 2), y, Math.max(2, left), 1,
          season === "winter" ? "#a5b5c3" : highlight);
        px(ctx, x - left, y + 5, 2, 2, shadow);
        px(ctx, x + right - 1, y + 5, 2, 2, shadow);
      }
    }
  }
  ctx.restore();
}

/** Ground vegetation stays attached to world coordinates. Draw behind the
 * player/trees, leaving the camp corridor free for UI and interactables.
 */
export function drawGroundAccents(ctx: any, camX: number, time: number, colors: any): void {
  const stride = 17;
  const start = Math.floor(camX / stride) - 2;
  const end = Math.ceil((camX + 320) / stride) + 2;
  const winter = colors.name === "winter";
  const stalk = winter
    ? lerpHex(colors.speckle, "#556d78", 0.37)
    : lerpHex(colors.ridge, colors.treeDark, 0.40);
  const light = winter
    ? colors.snow
    : lerpHex(colors.treeLight, colors.ridge, 0.38);

  for (let i = start; i <= end; i++) {
    const worldX = Math.round(i * stride + (noise(i, 11) - 0.5) * 10);
    if (worldX > 716 && worldX < 876) continue;
    const x = Math.round(worldX - camX);
    const y = 140 + Math.round(noise(i, 12) * 10);
    const tuft = Math.floor(noise(i, 14) * 4);
    const sway = Math.round(Math.sin(time * 1.1 + i * 2.7) * 0.7);
    if (winter) {
      // Broken dry stems and snow; avoid bright artificial snow lines.
      px(ctx, x, y - 2, 1, 3, stalk);
      px(ctx, x - 2, y, 5, 1, colors.speckle);
      if (tuft === 0) px(ctx, x + 2, y - 2, 1, 2, light);
    } else if (tuft === 0) {
      // Occasional little reed grouping.
      px(ctx, x, y - 5, 1, 5, stalk);
      px(ctx, x - 2 + sway, y - 3, 1, 3, stalk);
      px(ctx, x + 2 + sway, y - 4, 1, 4, light);
      px(ctx, x - 1, y - 1, 3, 1, colors.treeDark);
    } else if (tuft === 1) {
      // Low grass tuft with a single highlighted tip.
      px(ctx, x - 2, y - 2, 1, 3, stalk);
      px(ctx, x, y - 4, 1, 5, light);
      px(ctx, x + 2, y - 2, 1, 3, stalk);
      px(ctx, x - 2, y, 5, 1, colors.ridge);
    } else if (tuft === 2) {
      // Natural scattered leaf/blossom, changing with the calendar.
      const petal = colors.name === "spring" ? "#d7b8bc"
        : colors.name === "autumn" ? "#c68d4e" : "#92a964";
      px(ctx, x - 1, y, 3, 1, petal);
      px(ctx, x, y - 1, 1, 2, stalk);
    } else {
      // Muted stone/earth fleck: detail without a row of distracting plants.
      px(ctx, x - 2, y, 4, 1, colors.speckle);
      px(ctx, x - 1, y - 1, 2, 1, colors.ridge);
    }
  }
}

/** Warm horizon light at sunrise/sunset with restrained atmospheric separation.
 * The existing darkness overlay remains the authority for night lighting.
 */
export function drawSkyHaze(ctx: any, dayProgress: number): void {
  const dawn = clamp(1 - Math.abs(dayProgress - 0.06) / 0.13, 0, 1);
  const dusk = clamp(1 - Math.abs(dayProgress - 0.54) / 0.12, 0, 1);
  const strength = Math.max(dawn, dusk);
  if (strength < 0.02) return;
  const gradient = ctx.createLinearGradient(0, 51, 0, 129);
  gradient.addColorStop(0, "rgba(247,173,110,0)");
  gradient.addColorStop(0.66, `rgba(247,173,110,${(0.07 * strength).toFixed(3)})`);
  gradient.addColorStop(1, `rgba(246,187,122,${(0.16 * strength).toFixed(3)})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 51, 320, 78);
}

/** Low-cost haze band separates the foreground woods from the middle hills,
 * without obscuring player faces or text.
 */
export function drawHorizonHaze(ctx: any, colors: any, fogIntensity: number): void {
  const blend = clamp(fogIntensity, 0, 1);
  const gradient = ctx.createLinearGradient(0, 87, 0, 137);
  const haze = lerpHex(colors.sky, colors.hillFar, 0.37);
  // Canvas opacity remains low; this is not a uniform full-screen filter.
  ctx.save();
  ctx.globalAlpha = 0.17 + blend * 0.10;
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.44, haze);
  gradient.addColorStop(0.8, haze);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 87, 320, 50);
  ctx.restore();
}
