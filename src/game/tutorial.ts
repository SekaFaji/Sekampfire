import { CX, BENCH_X, PILE_X } from "./config";
import { drawPlayer, drawFire, drawBench, drawPile, drawSite, drawLog } from "./renderSprites";
import { drawTree } from "./renderTrees";
import { visualPalette } from "./palette";
import { drawTextC } from "./font";

/** Brief first-run walkthrough, grounded in the actual in-game equipment,
 * object sprites and interaction rules. Page changes never modify the run.
 */
export const TUTORIAL_PAGES = [
  { title: "YOUR FIRST STEPS", lines: [
    "HOLD A SCREEN SIDE TO WALK.",
    "HOLD ACT NEAR A TREE TO CHOP.",
    "MOVING CANCELS A CHOP."
  ], art: "walk" },
  { title: "LIGHT THE CAMPFIRE", lines: [
    "USE ACT AT THE FIRE PIT.",
    "YOUR STARTING FLINT LIGHTS IT.",
    "ADD WOOD BEFORE FUEL RUNS OUT."
  ], art: "fire" },
  { title: "CHOP AND COLLECT WOOD", lines: [
    "FELL TREES AND PICK UP LOGS.",
    "YOUR STARTING PACK HOLDS FIVE.",
    "BRING WOOD BACK TO CAMP."
  ], art: "chop" },
  { title: "BUILD THE WORKBENCH", lines: [
    "BRING 15 LOGS TO THE SITE.",
    "ACT STACKS YOUR CARRIED WOOD.",
    "ACT AGAIN TO START BUILDING."
  ], art: "bench" },
  { title: "CRAFT BETTER GEAR", lines: [
    "USE ACT AT YOUR WORKBENCH.",
    "MAKE AN AXE, BOOTS OR PACK.",
    "UPGRADE BENCH FOR MORE RECIPES."
  ], art: "craft" },
  { title: "GROW YOUR CAMP", lines: [
    "OPEN BUILD TO UPGRADE STATIONS.",
    "HEARTH, WORKBENCH AND LOG PILE.",
    "ALL NEED LV1 FOR FINAL CABIN."
  ], art: "camp" },
  { title: "SURVIVE AND IMPROVE", lines: [
    "KEEP WARM THROUGH EVERY NIGHT.",
    "EARN ASH FOR SURVIVING.",
    "BUY PERMANENT GEAR IN SHOP."
  ], art: "survive" },
] as const;

/** Reuse real Sekampfire world sprites, not unrelated emoji/stock imagery. */
export function drawTutorialArt(ctx: any, g: any, page: number): void {
  const step = TUTORIAL_PAGES[Math.max(0, Math.min(page, TUTORIAL_PAGES.length - 1))];
  const x = 24, y = 34, w = 272, h = 70;
  ctx.fillStyle = "#263f52";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#56766b";
  ctx.fillRect(x, y + 36, w, 15);
  ctx.fillStyle = "#6b765f";
  ctx.fillRect(x, y + 50, w, h - 50);
  // Sparse distant trunks and drifting sparks make the illustration feel alive.
  for (let i = 0; i < 17; i++) {
    const hx = x + (i * 31 + 7) % w;
    ctx.fillStyle = "#365d59";
    ctx.fillRect(hx, y + 30 + i % 6, 2, 22 - i % 6);
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 2, y + 2, w - 4, h - 4);
  ctx.clip();
  const scale = 0.92;
  ctx.translate(160 - CX * scale, 99 - 152 * scale);
  ctx.scale(scale, scale);
  const art = step.art;
  const scene: any = {
    ...g, stage: art === "camp" || art === "survive" ? 1 : 0,
    animT: g.animT || 0, fireLit: art === "fire" || art === "camp" || art === "survive",
    everLit: true, fuel: 70, sparks: [],
    stored: art === "camp" ? 8 : 0, builtPile: art === "camp",
    packTier: art === "craft" ? 1 : 0,
    toolTier: art === "craft" ? 1 : 0,
    crafts: art === "craft" ? { boots: true, pack: true, maul: true } : {},
    player: { ...g.player, x: CX - 36, y: 152, wood: art === "chop" ? 5 : 0,
      dir: 1, moving: art === "walk", chopTime: 1,
      chopT: art === "chop" || art === "craft" ? 0.5 : 0,
      chopTree: art === "chop" || art === "craft" ? { id: 1 } : null,
      torchT: 0 },
  };
  if (art === "walk" || art === "chop") {
    drawTree(ctx, { x: CX + 30, y: 152, tier: 1, variant: 0, id: 8, hitT: 0 },
      scene.animT, 0.25, visualPalette(scene));
    if (art === "chop") drawLog(ctx, CX + 7, 149, 9);
  }
  if (art === "fire" || art === "camp" || art === "survive") drawFire(ctx, scene);
  if (art === "bench") drawSite(ctx, scene, BENCH_X, 12);
  if (art === "bench" || art === "craft") drawBench(ctx, scene);
  if (art === "camp") drawPile(ctx, scene);
  if (art === "craft") drawTree(ctx, { x: CX + 46, y: 152,
    tier: 0, variant: 1, id: 19, hitT: 0 }, scene.animT, 0, visualPalette(scene));
  drawPlayer(ctx, scene);
  ctx.restore();
  if (art === "chop") drawTextC(ctx, "PACK 5/5", 265, 93, "#ffe8b5");
  if (art === "bench") drawTextC(ctx, "12 / 15 LOGS", 254, 93, "#ffe8b5");
  if (art === "craft") drawTextC(ctx, "WORKBENCH", 250, 93, "#ffe8b5");
  if (art === "survive") drawTextC(ctx, "ASH +3", 255, 93, "#ffe8b5");
  ctx.fillStyle = "#987c57";
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
}
