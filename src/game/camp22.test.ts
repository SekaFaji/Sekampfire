import { describe, expect, it } from "vitest";
import { createEngine, benchRows, buildRows, titleActions, closeMenu } from "./game";
import { pileCap } from "./rules";
import {
  stationLevel, stationCost, purchaseStation, canCompleteCabin,
  stationFuelFactor, stationCraftCost, stationTorchBonus, stationStokeGain,
} from "./campProgress";
import { CRAFTS } from "./config";
import { captureRunSnapshot } from "./save";
import { drawFire, drawBench, drawPile } from "./renderSprites";

const meta: any = { ash: 0, up: {}, best: 0, totalAsh: 0 };
const camp = () => {
  const g = createEngine();
  g.ui = "run"; g.builtBench = true; g.builtPile = true;
  g.player.wood = 30; g.stored = 64; g.fuel = 80; g.fireLit = true;
  return g;
};
describe("real station upgrade progression", () => {
  it("starts at level zero and requires all three station levels for final cabin", () => {
    const g=camp();g.stage=5;
    expect(canCompleteCabin(g)).toBe(false);
    const blocked=buildRows(g,meta)[0];
    expect(blocked.right).toContain("3 STATIONS LV1");
    const before=g.player.wood+g.stored;
    blocked.onDown();
    expect(g.player.wood+g.stored).toBe(before);
    expect(g.stage).toBe(5);
    for(const [index,id,cost] of [[1,"hearth",10],[2,"bench",10],[3,"pile",12]] as const) {
      let row=buildRows(g,meta)[index];
      expect(row.label).toContain("LV0");
      row.onDown();
      expect(g.buildConfirm).toBe(id);
      expect(g.player.wood+g.stored).toBe(before - ([1,2,3].indexOf(index)===0?0:index===2?10:20));
      row=buildRows(g,meta)[index];
      expect(row.right).toBe("CONFIRM?");
      row.onDown();
      expect(stationLevel(g,id)).toBe(1);
      expect(g.buildConfirm).toBeNull();
    }
    expect(g.player.wood+g.stored).toBe(before-32);
    expect(canCompleteCabin(g)).toBe(true);
    // The player still has to gather the cabin's 65 wood after upgrading.
    expect(buildRows(g,meta)[0].enabled).toBe(false);
    g.player.wood = 21;
    g.stored = 52; // Woodshed 40 + level-one log rack 12.
    expect(buildRows(g,meta)[0].enabled).toBe(true);
    expect(g.ashEarned).toBe(6);
  });
  it("enforces two tiers, costs and no negative wood or repeat purchases", () => {
    const g=camp(); g.player.wood=30;g.stored=70;
    for(const [id,first,second] of [["hearth",10,18],["bench",10,16],["pile",12,20]] as const){
      expect(stationCost(g,id)).toBe(first);
      expect(purchaseStation(g,id)).toBe(true);
      expect(stationCost(g,id)).toBe(second);
      expect(purchaseStation(g,id)).toBe(true);
      expect(stationCost(g,id)).toBe(0);
      expect(purchaseStation(g,id)).toBe(false);
    }
    expect(g.player.wood).toBeGreaterThanOrEqual(0);
    expect(g.stored).toBeGreaterThanOrEqual(0);
  });
  it("new storage tiers raise real capacity while preserving woodshed stage bonus", () => {
    const g=camp(); g.stage=0;
    expect(pileCap(g)).toBe(12);
    g.campUpgrades.pile=1;expect(pileCap(g)).toBe(24);
    g.campUpgrades.pile=2;expect(pileCap(g)).toBe(44);
    g.stage=4;expect(pileCap(g)).toBe(72);
    g.builtPile=false;expect(pileCap(g)).toBe(0);
  });
  it("station perks improve fire retention, wood-stoking and lantern duration", () => {
    const g=camp();
    expect(stationFuelFactor(g)).toBe(1);
    g.campUpgrades.hearth=1;expect(stationFuelFactor(g)).toBe(0.88);
    g.campUpgrades.hearth=2;expect(stationFuelFactor(g)).toBe(0.74);
    expect(stationStokeGain(g)).toBe(16);
    g.crafts.kindling=true;expect(stationStokeGain(g)).toBe(21);
    expect(stationTorchBonus(g)).toBe(0);
    g.crafts.lantern=true;expect(stationTorchBonus(g)).toBe(20);
  });
  it("unlocks workbench recipes by tier, preserves confirmation and discounts on level two", () => {
    const g=camp(); g.menu="bench";
    expect(benchRows(g,meta)).toHaveLength(7);
    expect(benchRows(g,meta)[4].right).toBe("BENCH LV1");
    expect(benchRows(g,meta)[5].right).toBe("BENCH LV2");
    const wood=g.player.wood+g.stored;
    benchRows(g,meta)[4].onDown();
    expect(g.player.wood+g.stored).toBe(wood);
    g.campUpgrades.bench=1;
    expect(benchRows(g,meta)[4].right).toBe("9 WOOD");
    benchRows(g,meta)[4].onDown();
    expect(g.craftConfirm).toBe("kindling");
    expect(g.player.wood+g.stored).toBe(wood);
    benchRows(g,meta)[4].onDown();
    expect(g.crafts.kindling).toBe(true);
    expect(g.player.wood+g.stored).toBe(wood-9);
    g.campUpgrades.bench=2;
    expect(stationCraftCost(g,CRAFTS[0])).toBe(4);
    expect(benchRows(g,meta)[5].right).toBe("13 WOOD");
    benchRows(g,meta)[5].onDown();benchRows(g,meta)[5].onDown();
    expect(g.crafts.lantern).toBe(true);
    closeMenu(g);
    expect(g.craftConfirm).toBeNull();
    expect(g.buildConfirm).toBeNull();
  });
  it("persists station tiers in existing v1 snapshot and old data remains compatible", () => {
    const g=camp();g.campUpgrades={hearth:1,bench:2,pile:2};g.stage=5;
    const snap=captureRunSnapshot(g);
    expect(snap.version).toBe(1);
    expect(snap.state.campUpgrades).toEqual({hearth:1,bench:2,pile:2});
    const legacy={...snap.state};delete legacy.campUpgrades;
    const restored=createEngine();restored.resumeData=legacy;
    titleActions(restored,meta)[0].act();
    expect(restored.campUpgrades).toEqual({hearth:0,bench:0,pile:0});
    const resumed=createEngine();resumed.resumeData=snap.state;
    titleActions(resumed,meta)[0].act();
    expect(resumed.campUpgrades).toEqual({hearth:1,bench:2,pile:2});
  });
  it("draws distinct level-one/two additions on every actual camp station", () => {
    const g=camp();g.stage=3;g.isNight=false;g.sparks=[];
    const render=(draw:(ctx:any,g:any)=>void) => {
      const marks: Array<{x:number,y:number,w:number,h:number,color:string}>=[];
      let color="";
      const ctx:any={set fillStyle(c:string){color=c;},get fillStyle(){return color;},
        fillRect(x:number,y:number,w:number,h:number){
          expect([x,y,w,h].every(Number.isFinite)).toBe(true);marks.push({x,y,w,h,color});
        }};
      draw(ctx,g);return marks;
    };
    for(const [id,draw] of [["hearth",drawFire],["bench",drawBench],["pile",drawPile]] as const){
      g.campUpgrades[id]=0;const zero=render(draw);
      g.campUpgrades[id]=1;const one=render(draw);
      g.campUpgrades[id]=2;const two=render(draw);
      expect(one).not.toEqual(zero);
      expect(two).not.toEqual(one);
    }
  });
});
