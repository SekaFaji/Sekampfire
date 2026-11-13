import { describe, expect, it, vi } from "vitest";
import { CX, GROUND, H, W, WORLD_W } from "./config";
import { isCampTreeExcluded } from "./campBoundary";
import { MUSEUM_X } from "./museum";
import { mulberry32 } from "./renderUtils";
import { createEngine, titleActions } from "./game";
import { captureRunSnapshot } from "./save";
import { genScenery, spawnTrees, treeTierFor } from "./worldGeneration";
import { hydrateSavedRun } from "./runHydration";

const meta = (up: Record<string, number> = {}) => ({
  ash: 0, totalAsh: 0, best: 0, runs: 0, wonEver: false,
  up, collection: {}, museumBuilt: false, guideFx: true
});

describe("World generation extraction: original terrain and tree behavior", () => {
  it("recreates the exact same scenery from the stored seed", () => {
    const one = createEngine(), two = createEngine();
    genScenery(one, 817231);
    genScenery(two, 817231);
    expect(one.scenerySeed).toBe(817231);
    expect(two.scenerySeed).toBe(817231);
    for (const key of ["mts", "mts2", "stars", "sparkles", "snow"]) {
      expect(two[key]).toEqual(one[key]);
    }
    expect(one.stars).toHaveLength(45);
    expect(one.sparkles).toHaveLength(320);
    expect(one.snow).toEqual([]);
    expect(one.stars.every((star: any) => star.x >= 0 && star.x <= W
      && star.y >= 0 && star.y <= 90)).toBe(true);
    expect(one.sparkles.every((p: any) => p.x >= 0 && p.x <= WORLD_W
      && p.y >= GROUND + 4 && p.y < H - 4)).toBe(true);
    genScenery(two, 817232);
    expect(two.stars).not.toEqual(one.stars);
  });
  it("keeps original near, medium and distant tree tier thresholds", () => {
    expect(treeTierFor(CX)).toBe(0);
    expect(treeTierFor(CX + 89.999)).toBe(0);
    expect(treeTierFor(CX - 90)).toBe(1);
    expect(treeTierFor(CX + 219.999)).toBe(1);
    expect(treeTierFor(CX + 220)).toBe(2);
    expect(treeTierFor(16)).toBe(2);
  });
  it("produces identical forests with a controlled random sequence", () => {
    const one = createEngine(), two = createEngine();
    spawnTrees(one, 26, mulberry32(632));
    spawnTrees(two, 26, mulberry32(632));
    expect(one.trees).toHaveLength(26);
    expect(two.trees).toEqual(one.trees);
    expect(one.treeId).toBe(27);
    expect(one.trees.every((t: any) =>
      t.x >= 16 && t.x <= WORLD_W - 16 &&
      t.y >= 136 && t.y < 154 &&
      t.tier === treeTierFor(t.x) &&
      t.hp === [1, 2, 3][t.tier] &&
      t.hitT === 0 &&
      !isCampTreeExcluded(one, t.x))).toBe(true);
    expect(one.trees.every((t: any, i: number) =>
      one.trees.every((other: any, j: number) =>
        i === j || Math.abs(t.x - other.x) >= 16))).toBe(true);
  });
  it("honors the 60-attempt ceiling without adding phantom trees or IDs", () => {
    const g = createEngine();
    spawnTrees(g, 3, () => 0);
    expect(g.trees).toHaveLength(1);
    expect(g.trees[0]).toMatchObject({
      id: 1, x: 16, y: 136, tier: 2, variant: 0, hp: 3, hitT: 0
    });
    expect(g.treeId).toBe(2);
    expect(() => spawnTrees(g, 0, () => { throw new Error("RNG used"); })).not.toThrow();
  });
  it("keeps fenced and expanded camp and built museum clear of trees", () => {
    const g = createEngine();
    g.fenceLeft = true;
    g.fenceRight = true;
    g.campExpansion = 1;
    g.museumBuilt = true;
    spawnTrees(g, 32, mulberry32(23011));
    expect(g.trees).toHaveLength(32);
    expect(g.trees.every((t: any) =>
      !isCampTreeExcluded(g, t.x) && Math.abs(t.x - MUSEUM_X) >= 25)).toBe(true);
  });
});

describe("Run hydration extraction: preserve old progress and callbacks", () => {
  it("restores the same v1 snapshot and regenerates its original scenery", () => {
    const original = createEngine();
    genScenery(original, 786123);
    spawnTrees(original, 12, mulberry32(66));
    original.ui = "run";
    original.fuel = 47;
    original.fireLit = true;
    original.player.x = CX + 6;
    original.player.warmth = 64;
    original.player.wood = 3;
    const snapshot = captureRunSnapshot(original);
    expect(snapshot?.version).toBe(1);
    const restored = createEngine();
    const callback = vi.fn();
    const fsToggle = vi.fn();
    restored.cb = { end: callback };
    restored.fsToggle = fsToggle;
    hydrateSavedRun(restored, snapshot.state, meta(), createEngine);
    expect(restored.cb.end).toBe(callback);
    expect(restored.fsToggle).toBe(fsToggle);
    expect(restored.ui).toBe("run");
    expect(restored.player.x).toBe(CX + 6);
    expect(restored.player.warmth).toBe(64);
    expect(restored.player.wood).toBe(3);
    expect(restored.fuel).toBe(47);
    expect(restored.fireLit).toBe(true);
    expect(restored.scenerySeed).toBe(786123);
    for (const key of ["mts", "mts2", "stars", "sparkles"]) {
      expect(restored[key]).toEqual(original[key]);
    }
    expect(restored.trees.map((t: any) => t.id)).toEqual(original.trees.map((t: any) => t.id));
    expect(restored.toasts.some((item: any) => item.text === "Run restored. The fire is waiting.")).toBe(true);
  });
  it("does not retrofit new Ash purchases into a resumed run", () => {
    const oldRun = createEngine();
    oldRun.ui = "run";
    oldRun.player.x = CX;
    oldRun.fuel = 99;
    oldRun.fireLit = true;
    const snapshot = captureRunSnapshot(oldRun);
    const upgraded = meta({ firecap: 8, legacy: 4, hearth: 2, fence: 2 });
    const restored = createEngine();
    hydrateSavedRun(restored, snapshot.state, upgraded, createEngine);
    expect(restored.fireCapacityTier63).toBe(0);
    expect(restored.campUpgrades.hearth).toBe(0);
    expect(restored.fenceMastery62).toBe(0);
    expect(restored.fuel).toBe(99);
    expect(restored.builtPile).toBe(false);
    const newRun = createEngine();
    titleActions(newRun, upgraded)[0].act();
    expect(newRun.fireCapacityTier63).toBe(8);
    expect(newRun.campUpgrades.hearth).toBe(2);
    expect(newRun.builtPile).toBe(true);
  });
  it("preserves pending completed run screens without banking Ash", () => {
    const original = createEngine();
    original.ui = "levelComplete";
    original.campaignLevel = 1;
    original.guideLevel = 4;
    original.levelCompletePending = true;
    original.ashEarned = 23;
    const snapshot = captureRunSnapshot(original);
    const restored = createEngine();
    hydrateSavedRun(restored, snapshot.state, meta(), createEngine);
    expect(restored.ui).toBe("levelComplete");
    expect(restored.ashEarned).toBe(23);
    expect(restored.levelCompletePending).toBe(true);
  });
});
