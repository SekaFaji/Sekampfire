import { CX, W, H, GROUND, WORLD_W } from "./config";
import { mulberry32 } from "./renderUtils";
import { isCampTreeExcluded } from "./campBoundary";
import { MUSEUM_X } from "./museum";

/** Purely world-scoped generation rules, separate from the main game loop.
 * Seeded scenery is recreated from the saved scenerySeed on resume. Tree
 * placement deliberately retains the existing world bounds and 60 attempts.
 * Only the random source is injectable for deterministic unit tests. */
export interface GeneratedTree {
  id: number;
  x: number;
  y: number;
  tier: number;
  variant: number;
  hp: number;
  hitT: number;
}
export interface WorldGenerationState {
  scenerySeed: number;
  mts: Array<{ x:number; w:number; h:number }>;
  mts2: Array<{ x:number; w:number; h:number }>;
  stars: Array<{ x:number; y:number; tw:number }>;
  sparkles: Array<{ x:number; y:number; c:string }>;
  snow: unknown[];
  trees: GeneratedTree[];
  treeId: number;
  museumBuilt: boolean;
  fenceLeft?: boolean;
  fenceRight?: boolean;
  campExpansion?: number;
}

export function genScenery(g: WorldGenerationState, seed: number): void {
  g.scenerySeed = seed;
  const rnd = mulberry32(seed);
  g.mts = []; g.mts2 = []; g.stars = []; g.sparkles = [];
  let x = -100;
  while (x < WORLD_W * 0.5 + W + 100) { g.mts.push({ x, w: 50 + rnd() * 90, h: 26 + rnd() * 44 }); x += 34 + rnd() * 70; }
  x = -100;
  while (x < WORLD_W * 0.75 + W + 100) { g.mts2.push({ x, w: 40 + rnd() * 70, h: 16 + rnd() * 30 }); x += 28 + rnd() * 58; }
  for (let i = 0; i < 45; i++) g.stars.push({ x: rnd() * W, y: rnd() * 90, tw: rnd() * 6 });
  for (let i = 0; i < 320; i++) g.sparkles.push({ x: rnd() * WORLD_W, y: GROUND + 4 + rnd() * (H - GROUND - 8), c: rnd() > 0.5 ? "#eef6fc" : "#c4d2e2" });
  g.snow = []; // Start in snow-free autumn; winter fills snowfall particles naturally.
}

export function treeTierFor(x: number): number {
  const d = Math.abs(x - CX);
  return d < 90 ? 0 : d < 220 ? 1 : 2;
}

export function spawnTrees(g: WorldGenerationState, count: number, random: () => number = Math.random): void {
  for (let n = 0; n < count; n++) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const x = 16 + random() * (WORLD_W - 32);
      if (isCampTreeExcluded(g, x)) continue;
      if (g.museumBuilt && Math.abs(x - MUSEUM_X) < 25) continue;
      if (g.trees.some(t => Math.abs(t.x - x) < 16)) continue;
      const y = 136 + random() * 18; // Keep pickups clear of foreground water.
      const tier = treeTierFor(x);
      const variant = Math.floor(random() * 3);
      g.trees.push({ id: g.treeId++, x, y, tier, variant, hp: [1, 2, 3][tier], hitT: 0 });
      break;
    }
  }
}

