import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { benchRows as engineBenchRows, buildRows as engineBuildRows, createEngine, stationRows } from "./game";
import { benchRows } from "./craftingMenu";
import { buildRows, doBuildAction, stationUpgradeRow } from "./buildingMenu";
import { CRAFTS } from "./config";
import { stationCraftCost, stationLevel } from "./campProgress";
import { captureRunSnapshot } from "./save";

let saved: Map<string, string>;
beforeEach(() => {
  saved = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => saved.set(key, String(value)),
    removeItem: (key: string) => saved.delete(key),
  });
});
afterEach(() => vi.unstubAllGlobals());

function camp() {
  const g = createEngine();
  g.ui = "run";
  g.menu = "build";
  g.fenceLeft = true;
  g.fenceRight = true;
  g.builtBench = true;
  g.builtPile = true;
  return g;
}
function meta() {
  return {
    ash: 0, totalAsh: 0, up: {}, museumBuilt: false,
    collection: { ordinary: true, twisted: false, hand: false, eight: false }
  };
}

describe("extracted workbench and building menus", () => {
  it("retains existing game exports and real station menu callbacks", () => {
    expect(engineBenchRows).toBe(benchRows);
    expect(engineBuildRows).toBe(buildRows);
    const g=camp(),m=meta();
    g.stationId="bench";
    expect(stationRows(g,m)[1].right).toContain("10 WOOD");
    expect(stationUpgradeRow(g,"bench").label).toContain("WORKBENCH");
  });

  it("requires two taps and spends actual wood for a recipe exactly once", () => {
    const g=camp(),m=meta();
    g.menu="bench";g.craftTab=0;g.player.wood=4;g.stored=4;
    const recipe=benchRows(g,m)[0];
    expect(recipe.label).toBe("TIMBER PACK");
    expect(recipe.right).toBe("6 WOOD");
    recipe.onDown();
    expect(g.craftConfirm).toBe("pack");
    expect(g.player.wood+g.stored).toBe(8);
    benchRows(g,m)[0].onDown();
    expect(g.craftConfirm).toBeNull();
    expect(g.crafts.pack).toBe(true);
    expect(g.player.wood).toBe(0);
    expect(g.stored).toBe(2);
    expect(benchRows(g,m)[0].right).toBe("OWNED");
    benchRows(g,m)[0].onDown();
    expect(g.player.wood+g.stored).toBe(2);
    expect(g.crafts.pack).toBe(true);
  });

  it("preserves crafting tiers, actual discounts and a superior equipped axe", () => {
    const g=camp(),m=meta();
    g.craftTab=1;g.player.wood=30;g.stored=20;
    expect(benchRows(g,m)[1].right).toBe("BENCH LV1");
    const old=g.player.wood+g.stored;
    benchRows(g,m)[1].onDown();
    expect(g.craftConfirm).toBeNull();
    expect(g.player.wood+g.stored).toBe(old);
    g.campUpgrades.bench=2;
    expect(stationCraftCost(g,CRAFTS[4])).toBe(7);
    benchRows(g,m)[1].onDown();
    benchRows(g,m)[1].onDown();
    expect(g.crafts.kindling).toBe(true);
    expect(g.player.wood+g.stored).toBe(old-7);
    g.craftTab=0;g.equippedAxe="grandpas_axe";
    benchRows(g,m)[2].onDown();
    benchRows(g,m)[2].onDown();
    expect(g.crafts.maul).toBe(true);
    expect(g.equippedAxe).toBe("grandpas_axe");
  });

  it("keeps physical station upgrades gated and banks only run-scoped Ash", () => {
    const g=camp();
    g.player.wood=10;g.stored=0;g.menu="station";
    g.fenceLeft=false;
    expect(stationUpgradeRow(g,"hearth").enabled).toBe(false);
    stationUpgradeRow(g,"hearth").onDown();
    expect(g.buildConfirm).toBeNull();
    expect(g.player.wood).toBe(10);
    g.fenceLeft=true;
    stationUpgradeRow(g,"hearth").onDown();
    expect(g.buildConfirm).toBe("hearth");
    expect(g.player.wood).toBe(10);
    stationUpgradeRow(g,"hearth").onDown();
    expect(stationLevel(g,"hearth")).toBe(1);
    expect(g.player.wood).toBe(0);
    expect(g.ashEarned).toBe(2);
    expect(g.ashLedger.stations).toBe(2);
    expect(g.buildConfirm).toBeNull();
    expect(captureRunSnapshot(g).state.campUpgrades.hearth).toBe(1);
  });

  it("preserves blueprint discounts, two-tap construction and stage Ash", () => {
    const g=camp(),m=meta();
    m.up={blue:1} as typeof m.up;
    g.stage=0;g.player.wood=6;g.stored=0;
    expect(buildRows(g,m)[0].right).toBe("6 WOOD");
    buildRows(g,m)[0].onDown();
    expect(g.buildConfirm).toBe("stage");
    expect(g.stage).toBe(0);
    buildRows(g,m)[0].onDown();
    expect(g.stage).toBe(1);
    expect(g.player.wood).toBe(0);
    expect(g.ashEarned).toBe(4);
    expect(g.ashLedger.structures).toBe(4);
    expect(g.menu).toBeNull();
    expect(g.buildConfirm).toBeNull();
  });

  it("prevents bypassing the guide and station gates for the final cabin", () => {
    const g=camp(),m=meta();
    g.stage=5;g.player.wood=100;g.stored=100;g.guideLevel=3;
    expect(buildRows(g,m)[0].right).toBe("FINISH M1-4");
    doBuildAction(g,m);
    expect(g.stage).toBe(5);
    g.guideLevel=4;
    expect(buildRows(g,m)[0].right).toBe("3 STATIONS LV1");
    doBuildAction(g,m);
    expect(g.stage).toBe(5);
    g.campUpgrades={hearth:1,bench:1,pile:1};
    buildRows(g,m)[0].onDown();
    buildRows(g,m)[0].onDown();
    expect(g.stage).toBe(6);
    expect(g.longNightPending).toBe(true);
    expect(g.ashEarned).toBe(4);
  });

  it("keeps museum construction permanent without losing the collection", () => {
    const g=camp(),m=meta();
    g.campExpansion=1;g.player.wood=12;g.stored=8;
    let museum=buildRows(g,m).at(-1)!;
    expect(museum.label).toBe("BUILD LOG MUSEUM");
    expect(museum.right).toBe("20 WOOD");
    museum.onDown();
    expect(g.buildConfirm).toBe("museum");
    expect(g.player.wood+g.stored).toBe(20);
    museum=buildRows(g,m).at(-1)!;
    museum.onDown();
    expect(m.museumBuilt).toBe(true);
    expect(g.museumBuilt).toBe(true);
    expect(g.player.wood+g.stored).toBe(0);
    expect(JSON.parse(saved.get("sekampfire-meta-v1")!).museumBuilt).toBe(true);
    expect(JSON.parse(saved.get("sekampfire-meta-v1")!).collection.ordinary).toBe(true);
    expect(buildRows(g,m).at(-1)!.label).toBe("VISIT LOG MUSEUM");
    expect(buildRows(g,m).at(-1)!.right).toBe("1/4 FOUND");
  });
});
