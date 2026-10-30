import { px } from "./renderUtils";

/** Seasonal wildlife is pixel art, rendered with the same primitive language
 * as the existing fox/rabbit/bird. Return false for legacy species.
 */
export function drawSeasonalWildlife(ctx: any, c: any, g: any): boolean {
  const species = c.species;
  if (!species || species === "fox" || species === "hare" || species === "rabbit") return false;
  const x = Math.round(c.x), y = Math.round(c.y);
  const dir = c.dir === -1 ? -1 : 1;
  const t = g.animT || 0;
  if (species === "squirrel") {
    const tail = Math.sin(t * 4 + x) > 0 ? -1 : 0;
    px(ctx, x - 3, y - 3, 5, 3, "#9e6842");
    px(ctx, x + dir * 2, y - 5, 3, 3, "#ad7951");
    px(ctx, x + dir * 3, y - 6, 1, 2, "#68452f");
    px(ctx, x - dir * 4, y - 6 + tail, 3, 4, "#8b573a");
    px(ctx, x - dir * 5, y - 7 + tail, 2, 2, "#bb8254");
    px(ctx, x + dir * 4, y - 4, 1, 1, "#211e20");
    return true;
  }
  if (species === "deer") {
    const step = c.state === "trot" ? (Math.floor(t * 8) % 2) : 0;
    px(ctx, x - 5, y - 8 - step, 11, 5, "#987049");
    px(ctx, x - 4, y - 3, 2, 3, "#765033");
    px(ctx, x + 3, y - 3 + step, 2, 3, "#765033");
    px(ctx, x + dir * 5, y - 11 - step, 3, 5, "#a67c52");
    px(ctx, x + dir * 5, y - 14 - step, 1, 4, "#665038");
    px(ctx, x + dir * 8, y - 15 - step, 1, 5, "#665038");
    px(ctx, x + dir * 4, y - 15 - step, 4, 1, "#665038");
    px(ctx, x + dir * 7, y - 10 - step, 1, 1, "#2a2220");
    return true;
  }
  if (species === "frog") {
    const hop = c.state === "hop" ? Math.round(Math.sin(t * 11) * 2) : 0;
    px(ctx, x - 3, y - 3 - hop, 7, 3, "#498557");
    px(ctx, x - 2, y - 5 - hop, 2, 2, "#77b66a");
    px(ctx, x + 2, y - 5 - hop, 2, 2, "#77b66a");
    px(ctx, x - 2, y - 4 - hop, 1, 1, "#1b2c26");
    px(ctx, x + 2, y - 4 - hop, 1, 1, "#1b2c26");
    px(ctx, x - 4, y - 1, 3, 1, "#2b6044");
    px(ctx, x + 3, y - 1, 3, 1, "#2b6044");
    return true;
  }
  if (species === "butterfly" || species === "dragonfly") {
    const flutter = Math.sin(t * (species === "butterfly" ? 14 : 20) + (c.ph || 0)) > 0 ? 1 : 0;
    if (species === "butterfly") {
      const col = "#e6a657", shade = "#c87b62";
      px(ctx, x - 3, y - 5 - flutter, 3, 3, col);
      px(ctx, x + 1, y - 5 - flutter, 3, 3, shade);
      px(ctx, x - 2, y - 2 + flutter, 2, 2, shade);
      px(ctx, x + 1, y - 2 + flutter, 2, 2, col);
      px(ctx, x, y - 5, 1, 6, "#2b3535");
    } else {
      px(ctx, x - 1, y - 5, 2, 6, "#5e9d9e");
      px(ctx, x - 5, y - 4 - flutter, 4, 1, "#b0ddcf");
      px(ctx, x + 1, y - 4 - flutter, 4, 1, "#b0ddcf");
      px(ctx, x - 4, y - 2 + flutter, 3, 1, "#6fb2b9");
      px(ctx, x + 1, y - 2 + flutter, 3, 1, "#6fb2b9");
    }
    return true;
  }
  if (["crow", "owl", "robin", "duck"].includes(species)) {
    const inFlight = c.state === "fly";
    const flap = Math.sin(t * 16 + (c.ph || 0)) > 0 ? -1 : 1;
    const body = species === "crow" ? "#303747"
      : species === "owl" ? "#a38563"
      : species === "robin" ? "#806351" : "#6c9078";
    px(ctx, x - 3, y - 3, 6, 3, body);
    px(ctx, x + dir * 2, y - 5, 3, 3, body);
    if (species === "robin") px(ctx, x + dir, y - 3, 2, 2, "#cd6d4d");
    if (species === "duck") {
      px(ctx, x + dir * 4, y - 4, 3, 1, "#d8b05b");
      px(ctx, x - dir * 3, y - 3, 2, 1, "#b5cab6");
    } else px(ctx, x + dir * 4, y - 4, 2, 1, "#d3ac77");
    if (species === "owl") {
      px(ctx, x + dir * 2, y - 6, 1, 2, "#735b42");
      px(ctx, x + dir * 4, y - 6, 1, 2, "#735b42");
      px(ctx, x + dir * 3, y - 4, 1, 1, "#f7d28a");
    } else px(ctx, x + dir * 3, y - 4, 1, 1, "#1d272c");
    if (inFlight) {
      px(ctx, x - 5, y - 2 + flap, 4, 2, body);
      px(ctx, x + 2, y - 2 + flap, 4, 2, body);
    } else {
      px(ctx, x - 1, y, 1, 2, "#6e5941");
      px(ctx, x + 2, y, 1, 2, "#6e5941");
    }
    return true;
  }
  return false;
}
