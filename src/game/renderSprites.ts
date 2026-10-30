import { W, H, GROUND, CX, SHED_X, BENCH_X, PILE_X, SITE_COST, BUILD_TIME } from "./config";
import { clamp } from "./math";
import { lerpHex, lightenHex, px } from "./renderUtils";
import { visualSeason, visualPalette } from "./palette";
import { drawTree, drawFallingTree } from "./renderTrees";

// ============ sprites ============
function drawFlame(ctx: any, x: number, y: number, t: number, strength: number) {
  const h = Math.max(3, 5 + strength * 11);
  const layer = (hh: number, col: string, wob: number) => {
    for (let i = 0; i < hh; i++) {
      const ph = t * 9 + i * 1.3 + wob;
      const wd = Math.max(1, Math.round(hh - i * 0.9 + Math.sin(ph) * 1.4));
      px(ctx, x - wd / 2, y - i - 2, wd, 1, col);
    }
  };
  layer(Math.round(h), "#ff6a00", 0);
  layer(Math.round(h * 0.72), "#ffb52e", 2);
  layer(Math.round(h * 0.42), "#ffe9a0", 4);
}

// cozy pines in three variants: layered pine, tall spire fir, bushy spruce
function drawBackpack(ctx: any, x: number, y: number, dir: number,
                      amount: number, upgrades: number) {
  // The permanent +8 and crafted +8 backpacks each enlarge the actual bag.
  // Every piece of carried wood remains individually visible, even at 21 logs.
  const tier = clamp(Math.floor(Number.isFinite(upgrades) ? upgrades : 0), 0, 2);
  const count = clamp(Math.floor(Number.isFinite(amount) ? amount : 0), 0, 30);
  const w = [10, 14, 17][tier];
  const h = [12, 17, 21][tier];
  const middleX = Math.round(x - dir * (8 + tier * 2));
  const bx = middleX - Math.floor(w / 2);
  const by = Math.round(y - 8 - h);
  const fabric = ["#685637", "#786443", "#756746"][tier];
  const trim = ["#a38a57", "#b69c65", "#c3a775"][tier];
  px(ctx, bx, by, w, h, "#2c2622");
  px(ctx, bx + 1, by + 1, w - 2, h - 2, fabric);
  px(ctx, bx + 1, by + 1, w - 2, 2, trim);
  px(ctx, bx, by + h - 3, w, 2, "#4d3b2a");
  // Bag size and external pockets make each upgrade visible even when empty.
  if (tier >= 1) {
    px(ctx, bx + 1, by + h - 8, 3, 4, "#4c4835");
    px(ctx, bx + w - 4, by + h - 8, 3, 4, "#4c4835");
    px(ctx, bx + 1, by + h - 8, 3, 1, trim);
  }
  if (tier >= 2) {
    px(ctx, bx + 3, by - 2, w - 6, 2, "#8c7c53");
    px(ctx, bx + Math.floor(w / 2) - 1, by + 1, 2, 3, "#d0b27b");
  }
  // Column width contracts from 4px to 3px, while each 2px log has its own
  // light-colored cut end and dark top edge for visual separation.
  const columns = count <= 5 ? 2 : 3;
  const logWidth = count <= 5 ? 4 : 3;
  const rows = Math.ceil(count / columns);
  const span = columns * logWidth;
  const startX = middleX - Math.floor(span / 2);
  const startY = Math.round(y - 9 - rows * 2);
  for (let i = 0; i < count; i++) {
    const col = i % columns, row = Math.floor(i / columns);
    const pxX = startX + col * logWidth, pxY = startY + row * 2;
    px(ctx, pxX, pxY, logWidth, 2, "#4e301d");
    px(ctx, pxX, pxY, logWidth - 1, 1, "#b77f47");
    px(ctx, pxX, pxY + 1, 1, 1, "#e1b97d");
    px(ctx, pxX + logWidth - 1, pxY + 1, 1, 1, "#c49152");
  }
  // Visible strap BELOW the logs to keep all carried units countable.
  px(ctx, bx, by + h - 2, w, 1, trim);
}

/** Player identity: the resting sprite looks toward the camera, showing
 * both eyes, clear hair, breathing and a subtle scarf motion. Boots and pack
 * remain tied to the player's actual crafted items/upgrades.
 */
function drawFrontIdle(ctx: any, g: any, x: number, y: number) {
  const p = g.player;
  const breath = Math.sin(g.animT * 2) * 0.35;
  const by = Math.round(y + breath);
  const blink = Math.sin(g.animT * 1.23) > 0.994;
  const boots = !!g.crafts?.boots;
  const shoe = boots ? "#624b35" : "#545056";
  ctx.fillStyle = "rgba(20,20,40,0.28)";
  ctx.fillRect(x - 6, y - 1, 12, 2);
  // Two clearly separated feet rather than a merged block.
  for (const dx of [-4, 2]) {
    px(ctx, x + dx, y - 7, 3, 5, "#414350");
    px(ctx, x + dx - 1, y - (boots ? 5 : 3), 4, boots ? 5 : 3, shoe);
    if (boots) px(ctx, x + dx - 1, y - 5, 4, 1, "#c39c58");
    px(ctx, x + dx - 1, y - 1, 4, 1, "#302b2c");
  }
  // Gear is behind the body, peeking out at the right shoulder.
  drawBackpack(ctx, x, by, -1, p.wood, g.packTier);
  px(ctx, x - 6, by - 16, 12, 10, "#2b2430");
  px(ctx, x - 5, by - 15, 10, 8, "#885334");
  px(ctx, x - 4, by - 13, 3, 4, "#b27649");
  px(ctx, x + 3, by - 13, 2, 5, "#5a3829");
  px(ctx, x - 3, by - 8, 6, 2, "#5a3829");
  px(ctx, x - 2, by - 7, 4, 1, "#c29b65");
  // Loose sleeves, relaxed but visually separate from the torso.
  px(ctx, x - 7, by - 14, 2, 7, "#5a3829");
  px(ctx, x - 7, by - 8, 2, 2, "#dfac84");
  px(ctx, x + 5, by - 14, 2, 7, "#b27649");
  px(ctx, x + 5, by - 8, 2, 2, "#dfac84");
  // Bare head (no craftable hat), bilateral eyes and little mouth.
  px(ctx, x - 5, by - 23, 10, 8, "#2b2430");
  px(ctx, x - 4, by - 22, 8, 7, "#dfac84");
  px(ctx, x - 4, by - 24, 8, 4, "#302722");
  px(ctx, x - 3, by - 25, 6, 2, "#47352a");
  px(ctx, x - 4, by - 21, 1, 3, "#302722");
  px(ctx, x + 3, by - 21, 1, 3, "#302722");
  px(ctx, x - 2, by - 19, 1, 1, blink ? "#ac7d63" : "#241d23");
  px(ctx, x + 2, by - 19, 1, 1, blink ? "#ac7d63" : "#241d23");
  px(ctx, x - 1, by - 16, 2, 1, "#ba8063");
  px(ctx, x - 5, by - 16, 10, 2, "#bc3d30");
  px(ctx, x - 4, by - 15, 8, 1, "#f1784d");
  px(ctx, x + 5, by - 15 + Math.round(Math.sin(g.animT * 3)), 4, 2, "#bc3d30");
  if (p.torchT > 0) {
    px(ctx, x + 8, by - 21, 2, 10, "#6b4a32");
    drawFlame(ctx, x + 8, by - 21, g.animT, 0.25);
  }
  if (visualSeason(g) === "winter" || g.weather === "coldsnap") {
    const t = (g.animT * 1.5) % 1;
    ctx.fillStyle = "rgba(226,239,243," + (0.28 * (1 - t)).toFixed(3) + ")";
    ctx.fillRect(x + t * 5, by - 19 - t * 5, 2, 1);
  }
}

/** One readable overhead swing across both facings. A starter branch has no
 * metal head; the existing maul craft visually becomes a Wood Axe, while the
 * permanent Grandpa's Axe shows a darker reinforced blade.
 */
function drawSwingTool(ctx: any, x: number, y: number, dir: number, progress: number, tier: number) {
  const p = clamp(progress, 0, 1);
  const angle = p < 0.34
    ? -0.3 - (p / 0.34) * 0.65
    : p < 0.77
      ? -0.95 + ((p - 0.34) / 0.43) * 2.35
      : 1.4 - ((p - 0.77) / 0.23) * 0.45;
  ctx.save();
  ctx.translate(x + dir * 6, y - 16);
  ctx.scale(dir, 1);
  ctx.rotate(angle);
  // Grip by the player's raised hand, shaft rises above the head.
  px(ctx, -1, -13, 2, 16, tier ? "#6e4328" : "#735034");
  px(ctx, 0, -12, 1, 10, "#b38a55");
  if (!tier) {
    px(ctx, 1, -11, 2, 2, "#937348");  // visible twig branch
    px(ctx, -2, -6, 2, 2, "#8c6540");
  } else {
    px(ctx, -2, -14, 6, 3, tier === 2 ? "#788b9b" : "#91aab4");
    px(ctx, 2, -16, 4, 5, tier === 2 ? "#c1d5e2" : "#d2e0e5");
    px(ctx, 5, -15, 2, 3, "#f2f6f4"); // tapered cutting edge, not hammer head
    px(ctx, -2, -14, 1, 2, "#4b555b");
    if (tier === 2) px(ctx, 0, -12, 2, 1, "#ddb76b");
  }
  ctx.restore();
}

function drawPlayer(ctx: any, g: any) {
  // Compact but recognisable silhouette: hooded coat, face, scarf, pack,
  // individually animated legs and arms, deliberate axe arc and idle blink.
  // All animation is decorative; world coordinates/hitboxes stay unchanged.
  const p = g.player;
  const x = Math.round(p.x), y = Math.round(p.y);
  const dir = p.dir === -1 ? -1 : 1;
  const walking = !!p.moving && p.chopT <= 0;
  const phase = g.animT * 9.5;
  const stride = walking ? Math.sin(phase) : 0;
  const otherStride = walking ? Math.sin(phase + Math.PI) : 0;
  const bob = walking ? -Math.max(0, Math.sin(phase * 2)) * 1.1 :
    Math.sin(g.animT * 1.7) * 0.35;
  const chopping = p.chopT > 0 && !!p.chopTree;
  if (!walking && !chopping) { drawFrontIdle(ctx, g, x, y); return; }
  const chopProgress = chopping ? clamp(1 - p.chopT / Math.max(p.chopTime, 0.001), 0, 1) : 0;
  const lean = chopping ? (chopProgress > 0.58 && chopProgress < 0.83 ? dir : -dir * 0.4) : 0;
  const bx = Math.round(x + lean), by = Math.round(y + bob);
  const dark = "#241d23", outline = "#2b2430";
  const coat = "#885334", coatShade = "#5a3829", coatLight = "#b27649";
  const hasCraftedBoots = !!(g.crafts && g.crafts.boots);
  const trouser = "#414350";
  const footwear = hasCraftedBoots ? "#624b35" : "#545056";
  const footwearSole = hasCraftedBoots ? "#251f1d" : "#403c40";
  const skin = "#dfac84";
  // feet and grounded shadow (same foot position as the original character)
  ctx.fillStyle = "rgba(20,20,40,0.28)";
  ctx.fillRect(x - 6, y - 1, 12, 2);
  for (const [dx, movement] of [[-3, stride], [2, otherStride]]) {
    const legLift = walking ? Math.max(0, movement) * 1.6 : 0;
    const legShift = walking ? Math.round(movement * 2.2) : 0;
    px(ctx, x + dx + legShift, y - 7 - legLift, 3, 5, trouser);
    px(ctx, x + dx + legShift - 1, y - (hasCraftedBoots ? 5 : 3) - legLift,
      4, hasCraftedBoots ? 5 : 3, footwear);
    if (hasCraftedBoots) px(ctx, x + dx + legShift - 1, y - 5 - legLift, 4, 1, "#c39c58");
    px(ctx, x + dx + legShift - 1, y - 1 - legLift, 4, 1, footwearSole);
  }
  // Backpack and its real cargo are drawn behind the shoulders.
  drawBackpack(ctx, bx, by, dir, p.wood, g.packTier);
  px(ctx, bx - 5, by - 16, 10, 10, outline);
  px(ctx, bx - 4, by - 15, 8, 9, coat);
  px(ctx, bx - 4, by - 8, 8, 2, coatShade);
  px(ctx, bx + (dir > 0 ? -3 : 2), by - 14, 2, 6, coatLight);
  px(ctx, bx - 2, by - 7, 4, 1, "#c29b65");
  // arms with opposing stride; lead arm grips the axe on chop
  const armSwing = walking ? Math.round(stride * 2) : 0;
  px(ctx, bx - 6, by - 14 + armSwing, 2, 7, outline);
  px(ctx, bx - 5, by - 13 + armSwing, 2, 5, coatLight);
  px(ctx, bx + 4, by - 14 - armSwing, 2, 7, outline);
  px(ctx, bx + 4, by - 13 - armSwing, 1, 5, coatShade);
  px(ctx, bx + dir * 5 - 1, by - 8 - armSwing, 2, 2, skin);
  // No hat equipment currently exists; leave the starting head uncovered.
  // A short, shaded hairstyle keeps the face readable in 320x180 pixel art.
  px(ctx, bx - 4, by - 23, 8, 8, outline);
  px(ctx, bx - 3, by - 22, 6, 7, skin);
  px(ctx, bx - 3, by - 22, 2, 5, "#bb7b60");
  px(ctx, bx - 4, by - 24, 8, 4, "#302722");
  px(ctx, bx - 3, by - 25, 5, 2, "#47352a");
  px(ctx, bx + (dir > 0 ? -4 : 2), by - 21, 2, 3, "#302722");
  px(ctx, bx + (dir > 0 ? 1 : -3), by - 22, 2, 1, "#514037");
  const blink = Math.sin(g.animT * 1.23) > 0.994;
  px(ctx, bx + (dir > 0 ? 2 : -2), by - 19, 1, 1, blink ? "#aa7c64" : dark);
  px(ctx, bx + (dir > 0 ? 3 : -4), by - 17, 2, 1, "#ba8063");
  px(ctx, bx - 4, by - 16, 8, 2, "#bc3d30");
  px(ctx, bx - 3, by - 15, 6, 1, "#f1784d");
  const scarfFlutter = Math.sin(g.animT * (walking ? 9 : 3)) * (walking ? 2 : 1);
  px(ctx, bx - dir * (6 + Math.round(scarfFlutter)), by - 15, 4, 2, "#bc3d30");
  if (chopping) {
    // Raised hand follows the tool pivot and the upper body leans into hit.
    px(ctx, bx + dir * 4 - 1, by - 16, 3, 5, "#b27649");
    px(ctx, bx + dir * 6 - 1, by - 17, 2, 2, skin);
    drawSwingTool(ctx, bx, by, dir, chopProgress, g.toolTier || 0);
  }
  if (p.torchT > 0) {
    px(ctx, bx + dir * 7, by - 21, 2, 9, "#6b4a32");
    drawFlame(ctx, bx + dir * 7, by - 21, g.animT, 0.25);
  }
  if (visualSeason(g) === "winter" || g.weather === "coldsnap") {
    const breath = (g.animT * 1.5) % 1;
    ctx.fillStyle = "rgba(226,239,243," + (0.28 * (1 - breath)).toFixed(3) + ")";
    ctx.fillRect(bx + dir * (5 + breath * 6), by - 18 - breath * 5, 2, 1);
  }
}

function drawDog(ctx: any, g: any) {
  const d = g.dog;
  if (!d) return;
  const x = Math.round(d.x), y = Math.round(d.y);
  const dir = d.dir || 1;
  const bob = d.phase !== "idle" ? Math.floor(g.animT * 8) % 2 : 0;
  const idleBreath = d.phase === "idle" && Math.sin(g.animT * 2.2) > 0.6 ? -1 : 0;
  ctx.fillStyle = "rgba(20,20,40,0.3)";
  ctx.fillRect(x - 4, y - 1, 8, 1);
  px(ctx, x - 4, y - 4 + idleBreath, 8, 3, "#d8dee4");
  px(ctx, x - 4, y - 1 - bob, 1, 2, "#b8bec6");
  px(ctx, x + 3, y - 2 + bob, 1, 2, "#b8bec6");
  px(ctx, dir > 0 ? x + 3 : x - 6, y - 6, 3, 3, "#d8dee4");
  px(ctx, dir > 0 ? x + 5 : x - 6, y - 7, 1, 2, "#c2c8ce");
  px(ctx, dir > 0 ? x + 6 : x - 6, y - 5, 1, 1, "#2a2a2e");
  const wag = Math.sin(g.animT * (d.phase === "idle" ? 5 : 12)) > 0 ? -1 : 0;
  px(ctx, dir > 0 ? x - 5 : x + 4, y - 5 + wag, 1, 2, "#c2c8ce");
}

function drawFire(ctx: any, g: any) {
  if (g.stage >= 1) {
    // A low wooden windbreak sits outside the fire's ember bed.
    // Alternating rough-cut logs and pegs distinguish it from a stone ring.
    const sideWood = "#6b4529", cutEnd = "#d6a46d", bark = "#49321f";
    for (const side of [-1, 1]) {
      const outer = CX + side * 13;
      px(ctx, outer - 2, 146, 4, 2, bark);
      px(ctx, outer - 2, 147, 4, 2, sideWood);
      px(ctx, outer - 2, 147, 1, 2, cutEnd);
      px(ctx, outer + 1, 147, 1, 2, "#8a5e37");
      px(ctx, outer - 2, 150, 4, 2, bark);
      px(ctx, outer - 1, 150, 3, 2, sideWood);
      px(ctx, outer - 1, 150, 1, 2, cutEnd);
      px(ctx, outer, 144, 1, 7, "#6c482c"); // windbreak stake
      px(ctx, outer, 144, 1, 1, "#c39a66");
    }
    // Rear logs behind the flame, still visually separate from its fuel.
    px(ctx, CX - 10, 143, 7, 2, bark);
    px(ctx, CX - 9, 143, 6, 1, sideWood);
    px(ctx, CX + 3, 143, 7, 2, bark);
    px(ctx, CX + 3, 143, 6, 1, sideWood);
    px(ctx, CX - 10, 144, 1, 1, cutEnd);
    px(ctx, CX + 9, 144, 1, 1, cutEnd);
  }
  if (g.stage >= 6) {
    px(ctx, CX - 12, 144, 24, 2, "#7a828c");
    px(ctx, CX - 12, 144, 2, 8, "#7a828c");
    px(ctx, CX + 10, 144, 2, 8, "#7a828c");
  }
  px(ctx, CX - 6, 147, 7, 2, "#5a3a22");
  px(ctx, CX - 1, 148, 7, 2, "#4a2f1a");
  if (g.fireLit) {
    drawFlame(ctx, CX, 148, g.animT, g.fuel / 100);
    // Tiny ambient embers without artificial spotlights.
    const flicker = Math.sin(g.animT * 7.1) * 1.5;
    px(ctx, CX - 4, 140 + flicker, 1, 1, "#ffb452");
    px(ctx, CX + 3, 137 - flicker, 1, 1, "#e9983b");
  } else if (g.everLit) {
    px(ctx, CX - 3, 148, 5, 1, "#8a2a1a");
    px(ctx, CX - 2, 147, 2, 1, "#c24a1e");
  }
  for (const s of g.sparks) {
    ctx.fillStyle = `rgba(255,210,120,${clamp(s.life, 0, 1)})`;
    ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
  }
}

// the crafting bench, left of the fire
function drawBench(ctx: any, g: any) {
  const bx = BENCH_X, y = 152;
  ctx.fillStyle = "rgba(20,20,40,0.3)";
  ctx.fillRect(bx - 11, y - 1, 23, 2);
  px(ctx, bx - 8, y - 7, 2, 7, "#54371f");
  px(ctx, bx + 6, y - 7, 2, 7, "#54371f");
  px(ctx, bx - 11, y - 10, 22, 3, "#7a4c2a");
  px(ctx, bx - 11, y - 10, 22, 1, "#95603a");
  // hammer
  px(ctx, bx - 6, y - 13, 4, 2, "#8a92a0");
  px(ctx, bx - 5, y - 11, 1, 1, "#54371f");
  // plank with nails
  px(ctx, bx + 1, y - 12, 7, 2, "#a06a3a");
  px(ctx, bx + 2, y - 11, 1, 1, "#54371f");
  px(ctx, bx + 6, y - 11, 1, 1, "#54371f");
  // hanging lantern
  px(ctx, bx + 11, y - 16, 1, 6, "#54371f");
  if (g.isNight) {
    px(ctx, bx + 10, y - 13, 3, 3, "#ffd98a");
    px(ctx, bx + 11, y - 12, 1, 1, "#fff6d8");
  } else {
    px(ctx, bx + 10, y - 13, 3, 3, "#8a92a0");
  }
}

// the wood pile, right of the fire - grows with stored wood
function drawPile(ctx: any, g: any) {
  const bx = PILE_X, y = 152;
  const per = g.stage >= 4 ? 7 : 3;
  const rows = clamp(Math.ceil(g.stored / per), 0, 6);
  if (rows === 0) {
    px(ctx, bx - 8, y - 1, 16, 1, "#b8c2d0");
    px(ctx, bx - 5, y - 2, 3, 1, "#c8d2e0");
    return;
  }
  for (let i = 0; i < rows; i++) {
    const wdt = 16 - (i % 2);
    const yy = y - 2 - i * 2;
    const off = i % 2;
    px(ctx, bx - wdt / 2 + off, yy, wdt, 2, i % 2 ? "#7a4c2a" : "#8a5a34");
    px(ctx, bx - wdt / 2 + off, yy, 1, 2, "#c9a86a");
    px(ctx, bx + wdt / 2 - 1 + off, yy, 1, 2, "#c9a86a");
  }
  px(ctx, bx - 6, y - 2 - rows * 2, 5, 1, "#eef4fa");
}

// unbuilt plot marker: two stakes and a string
// unbuilt build site: survey stakes mark the spot, and the logs you
// carry here stack up visually until the site has all SITE_COST of them
function drawSite(ctx: any, g: any, bx: number, logs: number) {
  const y = 152;
  px(ctx, bx - 10, y - 4, 2, 4, "#7a5a34");
  px(ctx, bx - 10, y - 4, 2, 1, "#9a7a4a");
  px(ctx, bx + 9, y - 4, 2, 4, "#7a5a34");
  px(ctx, bx + 9, y - 4, 2, 1, "#9a7a4a");
  ctx.fillStyle = "rgba(190,200,216,0.45)";
  ctx.fillRect(bx - 8, y - 1, 16, 2);
  const n = Math.min(3, Math.ceil(logs / (SITE_COST / 3)));
  if (n >= 1) drawLog(ctx, bx - 7, y - 3, 7);
  if (n >= 2) drawLog(ctx, bx + 1, y - 3, 6);
  if (n >= 3) drawLog(ctx, bx - 3, y - 6, 7);
}

// a structure under construction: stacked logs, a hammer, and fog that clears as it rises
function drawConstruction(ctx: any, g: any, bx: number, isBench: boolean) {
  const y = 152;
  const prog = clamp((isBench ? g.benchBuildT : g.pileBuildT) / BUILD_TIME, 0, 1);
  drawSite(ctx, g, bx, SITE_COST);
  ctx.globalAlpha = 0.2 + prog * 0.8;
  if (isBench) drawBench(ctx, g); else drawPile(ctx, g);
  ctx.globalAlpha = 1;
  const swing = Math.sin(g.animT * 13) > 0 ? 0 : 1;
  px(ctx, bx + 2, y - 17 + swing, 2, 5, "#8a6a3a");
  px(ctx, bx + 1, y - 18 + swing, 4, 2, "#8a92a0");
  px(ctx, bx + 1, y - 18 + swing, 4, 1, "#b8c2d0");
  const fog = (1 - prog) * 0.55;
  for (let i = 0; i < 6; i++) {
    const fx = bx - 12 + i * 4.4 + Math.sin(g.animT * 1.2 + i * 2.3) * 2.5;
    const fy = y - 4 - ((i * 31 + Math.floor(g.animT * 8)) % 13);
    ctx.fillStyle = "rgba(222,230,240," + fog + ")";
    ctx.fillRect(Math.round(fx), Math.round(fy), 7, 3);
  }
  const pw = 18, bxp = Math.round(bx - pw / 2);
  ctx.fillStyle = "rgba(8,12,28,0.8)";
  ctx.fillRect(bxp - 1, 131, pw + 2, 5);
  ctx.fillStyle = "rgba(60,70,100,0.8)";
  ctx.fillRect(bxp, 132, pw, 3);
  ctx.fillStyle = "#ffd98a";
  ctx.fillRect(bxp, 132, Math.round(prog * pw), 3);
}

function drawStructures(ctx: any, g: any) {
  const st = g.stage;
  const colors = visualPalette(g);
  const roofTrim = colors.name === "winter" ? "#eef4fa" : colors.ridge;
  const x0 = CX - 42;
  if (g.builtBench) drawBench(ctx, g);
  else if (g.benchBuildT >= 0) drawConstruction(ctx, g, BENCH_X, true);
  else drawSite(ctx, g, BENCH_X, g.benchLogs);
  if (g.builtPile) drawPile(ctx, g);
  else if (g.pileBuildT >= 0) drawConstruction(ctx, g, PILE_X, false);
  else drawSite(ctx, g, PILE_X, g.pileLogs);
  if (st >= 2 && st < 6) {
    px(ctx, CX + 16, 142, 18, 3, "#8a5a34");
    px(ctx, CX + 17, 145, 2, 5, "#6b4a32");
    px(ctx, CX + 30, 145, 2, 5, "#6b4a32");
    px(ctx, CX + 16, 141, 18, 1, roofTrim);
  }
  if (st >= 3 && st < 6) {
    px(ctx, CX - 32, 150, 2, 18, "#6b4a32");
    px(ctx, CX - 8, 150, 2, 16, "#6b4a32");
    for (let i = 0; i < 8; i++) {
      px(ctx, CX - 38 + i * 4, 132 - i, 5, 2, "#8a5a34");
      px(ctx, CX - 38 + i * 4, 131 - i, 5, 1, roofTrim);
    }
  }
  if (st >= 4) {
    const sx = SHED_X;
    px(ctx, sx, 136, 26, 14, "#6b4a32");
    px(ctx, sx, 136, 26, 1, "#7a5636");
    px(ctx, sx + 8, 140, 10, 10, "#3a2a1e");
    px(ctx, sx + 10, 148, 6, 2, "#8a5a34");
    px(ctx, sx + 10, 146, 6, 2, "#7a4c2a");
    for (let i = 0; i < 8; i++) px(ctx, sx - 2 + i * 4, 133, 4, 2, "#5a3a22");
    px(ctx, sx - 2, 132, 30, 1, roofTrim);
  }
  if (st === 5) {
    px(ctx, CX - 36, 112, 4, 38, "#6a482c");
    px(ctx, CX + 32, 112, 4, 38, "#6a482c");
    px(ctx, CX - 36, 110, 72, 3, "#6a482c");
    px(ctx, CX - 36, 109, 72, 1, roofTrim);
    for (let i = 0; i < 9; i++) px(ctx, CX - 28 + i * 6, 118, 4, 32, "#7a5636");
  }
  if (st >= 6) {
    px(ctx, x0, 122, 84, 28, "#7a5636");
    for (let i = 0; i < 20; i++) px(ctx, x0 + 2 + i * 4, 124, 1, 24, "#6a482c");
    px(ctx, x0, 122, 84, 2, "#8a5a34");
    px(ctx, x0 + 6, 128, 11, 22, "#4a3428");
    px(ctx, x0 + 14, 138, 1, 1, "#ffd98a");
    px(ctx, x0 + 22, 126, 12, 10, "#ffd98a");
    px(ctx, x0 + 22, 126, 12, 1, "#4a3428");
    px(ctx, x0 + 22, 135, 12, 1, "#4a3428");
    px(ctx, x0 + 22, 126, 1, 10, "#4a3428");
    px(ctx, x0 + 33, 126, 1, 10, "#4a3428");
    px(ctx, x0 + 60, 126, 12, 10, "#ffd98a");
    px(ctx, x0 + 60, 126, 12, 1, "#4a3428");
    px(ctx, x0 + 60, 135, 12, 1, "#4a3428");
    px(ctx, x0 + 60, 126, 1, 10, "#4a3428");
    px(ctx, x0 + 71, 126, 1, 10, "#4a3428");
    px(ctx, x0 + 68, 86, 8, 12, "#8a8a92");
    px(ctx, x0 + 67, 85, 10, 2, "#9aa2ac");
    for (let i = 0; i < 16; i++) {
      const w = 84 - i * 5;
      if (w <= 0) break;
      px(ctx, CX - w / 2, 120 - i * 2, w, 2, i % 2 ? "#8a4a3a" : "#94523e");
    }
    for (let i = 0; i < 6; i++) {
      const w = 84 - i * 5;
      px(ctx, CX - w / 2, 119 - i * 2, w, 1, roofTrim);
    }
  }
  for (const s of g.smoke) {
    ctx.fillStyle = `rgba(207,214,221,${clamp(s.life, 0, 1) * 0.5})`;
    ctx.fillRect(Math.round(s.x), Math.round(s.y), 2, 2);
  }
}

// one side-view log with bark shading and pale cut end caps
function drawLog(ctx: any, x: number, y: number, w: number) {
  px(ctx, x, y, w, 3, "#6b4426");
  px(ctx, x, y, w, 1, "#8a5a34");
  px(ctx, x, y + 2, w, 1, "#4a2e18");
  px(ctx, x, y, 1, 3, "#c9975f");
  px(ctx, x + w - 1, y, 1, 3, "#c9975f");
  px(ctx, x, y + 1, 1, 1, "#8a5a34");
  px(ctx, x + w - 1, y + 1, 1, 1, "#8a5a34");
}

function drawPickups(ctx: any, g: any) {
  for (const pk of g.pickups) {
    const x = Math.round(pk.x), y = Math.round(pk.y);
    ctx.fillStyle = "rgba(20,20,40,0.25)";
    ctx.fillRect(x - 7, y, 14, 1);
    if (pk.w >= 4) {
      // small log pile: two below, one on top
      drawLog(ctx, x - 7, y - 3, 7);
      drawLog(ctx, x + 1, y - 3, 6);
      drawLog(ctx, x - 3, y - 6, 7);
    } else if (pk.w >= 2) {
      drawLog(ctx, x - 5, y - 3, 8);
      drawLog(ctx, x - 2, y - 6, 6);
    } else {
      drawLog(ctx, x - 4, y - 3, 8);
    }
  }
}

function drawMountainRange(ctx: any, arr: any[], color: string, snow: string) {
  for (const m of arr) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(m.x, GROUND + 2);
    ctx.lineTo(m.x + m.w / 2, GROUND + 2 - m.h);
    ctx.lineTo(m.x + m.w, GROUND + 2);
    ctx.closePath();
    ctx.fill();
    const capH = Math.min(9, m.h * 0.35);
    const capW = m.w * (capH / m.h);
    ctx.fillStyle = snow;
    ctx.beginPath();
    ctx.moveTo(m.x + m.w / 2 - capW / 2, GROUND + 2 - m.h + capH);
    ctx.lineTo(m.x + m.w / 2, GROUND + 2 - m.h);
    ctx.lineTo(m.x + m.w / 2 + capW / 2, GROUND + 2 - m.h + capH);
    ctx.closePath();
    ctx.fill();
  }
}

// Rolling hills fill the horizon in the meadow / forest regions.
// Moving right gradually reveals the mountain panorama instead.
function drawHillRange(ctx: any, camX: number, shift: number,
                       fill: string, depth: number, spread: number) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(0, GROUND + 12);
  for (let x = 0; x <= W + 8; x += 8) {
    const wx = x + camX * shift;
    const y = GROUND - depth
      - Math.sin(wx / spread) * 10
      - Math.sin(wx / (spread * 0.48) + 0.9) * 4;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W + 8, GROUND + 12);
  ctx.closePath();
  ctx.fill();
}

// ============ distant forest layers ============
// Forest silhouettes are decorative parallax, not collectible world trees.
function drawForestLayer(ctx: any, camX: number, parallax: number, base: number,
                         color: string, spacing: number, seed: number) {
  const scroll = camX * parallax;
  const start = Math.floor((scroll - 40) / spacing);
  const end = Math.ceil((scroll + W + 40) / spacing);
  ctx.save();
  ctx.translate(-Math.round(scroll), 0);
  for (let i = start; i <= end; i++) {
    const r = Math.abs(Math.sin(i * 91.731 + seed * 17.23) * 43758.5453) % 1;
    const x = Math.round(i * spacing + (r - 0.5) * 12);
    const h = Math.round(19 + r * 18);
    const half = Math.round(5 + r * 4);
    px(ctx, x - 1, base - h + 5, 2, h - 4, color);
    for (let row = 0; row < h - 5; row += 2) {
      const wid = Math.max(1, Math.round((row / (h - 5)) * half));
      px(ctx, x - wid, base - h + row, wid * 2 + 1, 2, color);
    }
  }
  ctx.restore();
}

// ============ ambient critters ============
function drawCritter(ctx: any, c: any, g: any) {
  const x = Math.round(c.x), y = Math.round(c.y);
  const d = c.dir || 1;
  const rabbitFur = visualSeason(g) === "winter" ? "#e8eef4" : "#bda184";
  if (c.type === "bird") {
    if (c.state === "fly") {
      const flap = Math.sin(g.animT * (17 + (c.ph || 0) % 5) + c.ph) > 0 ? -1 : 1;
      ctx.fillStyle = "#39435a";
      ctx.fillRect(x - 1, y, 3, 1);
      ctx.fillRect(x - 2, y + flap, 2, 1);
      ctx.fillRect(x + 1, y + flap, 2, 1);
    } else {
      const hop = Math.sin(g.animT * 4 + c.ph) > 0.82 ? -1 : 0;
      ctx.fillStyle = "rgba(20,20,40,0.25)";
      ctx.fillRect(x - 2, y - 1, 4, 1);
      px(ctx, x - 2, y - 3 + hop, 4, 2, "#39435a");
      px(ctx, x + d, y - 5 + hop, 3, 3, "#39435a");
      px(ctx, x + d * 2, y - 4 + hop, 1, 1, "#e8a03a");
      px(ctx, x - 1, y - 1 + hop, 1, 1, "#8a94ac");
      px(ctx, x + 1, y - 1 + hop, 1, 1, "#8a94ac");
    }
  } else if (c.type === "bunny") {
    const hop = c.state === "hop" ? -Math.abs(Math.sin(g.animT * 10 + c.ph)) * 3 : (Math.sin(g.animT * 3 + c.ph) > 0.85 ? -1 : 0);
    const ears = Math.sin(g.animT * 4 + c.ph) > 0.4 ? -1 : 0;
    ctx.fillStyle = "rgba(20,20,40,0.25)";
    ctx.fillRect(x - 2, y - 1, 5, 1);
    px(ctx, x - 2, y - 3 + hop, 5, 3, rabbitFur);
    px(ctx, x + d * 2, y - 5 + hop, 2, 2, rabbitFur);
    px(ctx, x + d * 2, y - 7 + hop + ears, 1, 2, rabbitFur);
    px(ctx, x + d * 3, y - 7 + hop - ears, 1, 2, "#d8dfe8");
    px(ctx, x + d * 3, y - 4 + hop, 1, 1, "#d87a8a");
  } else if (c.type === "fox") {
    const bob = c.state === "trot" ? Math.floor(g.animT * 10) % 2 : 0;
    const headTilt = c.state === "watch" && Math.sin(g.animT * 1.8 + c.x) > 0.8 ? -1 : 0;
    ctx.fillStyle = "rgba(20,20,40,0.25)";
    ctx.fillRect(x - 4, y - 1, 8, 1);
    px(ctx, x - 3, y - 3 - bob, 7, 3, "#c9703a");
    px(ctx, x + d * 3, y - 5 - bob + headTilt, 3, 3, "#c9703a");
    px(ctx, x + d * 3, y - 6 - bob, 1, 2, "#8a4a28");
    px(ctx, x + d * 5, y - 4 - bob, 1, 1, "#2a2a2e");
    const wag = Math.sin(g.animT * 4 + c.x * 0.13) > 0.2 ? -1 : 0;
    px(ctx, x - d * 4, y - 4 - (c.state === "trot" ? bob : wag), 3, 2, "#c9703a");
    px(ctx, x - d * 6, y - 3, 2, 1, "#e8eef4");
  }
}

export { drawFlame, drawTree, drawFallingTree, drawBackpack, drawPlayer, drawDog, drawFire, drawBench, drawPile, drawSite, drawConstruction, drawStructures, drawLog, drawPickups, drawMountainRange, drawHillRange, drawForestLayer, drawCritter };
