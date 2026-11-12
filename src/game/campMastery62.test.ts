import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { createEngine, shopRows, titleActions } from "./game";
import { UPGRADES, CRAFTS, CX } from "./config";
import { loadMeta, captureRunSnapshot } from "./save";
import {
  applyCampMastery62, campMasteryLevel62, campMasteryNextBenefit62,
  fenceProtection62, type CampMasteryId62
} from "./campMastery62";
import { stationLevel, stationFuelFactor, stationCraftCost, stationCost, purchaseStation } from "./campProgress";
import { campEstablished, campClaimBounds, EAST_POST_X } from "./campBoundary";
import { pileCap } from "./rules";
import { coldTarget, coldProtection, advanceCold } from "./cold";
import { SHOP_CARD_LABEL51, drawShopCardIcon51 } from "./shopCards51";
import { SHOP_TILE_NAME60, chooseShopCategory60 } from "./shopCategories60";
import { SHOP_VIEW58, shopMaxScroll58 } from "./shopScroll58";
import { SHOP_BUY51, drawShopTabs } from "./menuScreens";
import { textW } from "./font";

let storage: Map<string,string>;
beforeEach(()=>{
  storage=new Map();
  vi.stubGlobal("localStorage",{
    getItem:(k:string)=>storage.get(k)??null,
    setItem:(k:string,v:string)=>storage.set(k,String(v)),
    removeItem:(k:string)=>storage.delete(k)
  });
});
afterEach(()=>vi.unstubAllGlobals());

function meta(up:Record<string,number>={}) {
  return {ash:2000,totalAsh:2000,runs:0,best:0,up:{...up},
    petEquipped:null,museumBuilt:false,guideFx:true};
}
function run(m:any=meta()){
  const g=createEngine();
  titleActions(g,m)[0].act();
  return g;
}
const ids:CampMasteryId62[]=["hearth","fence","workshop","storage"];
const prices:Record<CampMasteryId62,number[]>={
  hearth:[38,78],fence:[28,62],workshop:[42,86],storage:[32,72]
};

describe("Patch #62 - separate permanent camp masteries",()=>{
  it("offers four real 2-tier purchases in Camp, with exact costs and no free spending",()=>{
    const m=meta(),g=createEngine();
    g.shopTab=0;g.shopCategory60="camp";
    expect(shopRows(g,m).map((r:any)=>r.id)).toEqual(
      ["blue","legacy","hearth","fence","workshop","storage"]);
    const initial=m.ash;
    for(const id of ids){
      const def=UPGRADES.find(u=>u.id===id)!;
      expect(def.max).toBe(2);
      expect(def.costs).toEqual(prices[id]);
      for(let n=0;n<2;n++){
        const row=shopRows(g,m).find((r:any)=>r.id===id)!;
        expect(row.level).toBe(n);
        expect(row.cost).toBe(prices[id][n]);
        expect(row.desc).toBe(campMasteryNextBenefit62(id,n));
        expect(row.buy()).toBe(true);
        expect(m.up[id]).toBe(n+1);
      }
      const final=shopRows(g,m).find((r:any)=>r.id===id)!;
      expect(final.maxed).toBe(true);
      expect(final.buy()).toBe(false);
    }
    expect(m.ash).toBe(initial-438);
    expect(loadMeta().up.hearth).toBe(2);
    expect(loadMeta().up.fence).toBe(2);
  });
  it("does not allow purchasing with unbanked run Ash, insufficient funds or maximum tiers",()=>{
    const g=run(),m=meta();
    m.ash=0;g.ashEarned=9999;g.shopCategory60="camp";
    expect(shopRows(g,m).find((r:any)=>r.id==="hearth")!.buy()).toBe(false);
    expect(m.up.hearth).toBeUndefined();
    m.ash=38;
    expect(shopRows(g,m).find((r:any)=>r.id==="hearth")!.buy()).toBe(true);
    expect(m.ash).toBe(0);
    expect(shopRows(g,m).find((r:any)=>r.id==="hearth")!.buy()).toBe(false);
    expect(g.campUpgrades.hearth).toBe(0); // current run is never retrofitted
  });
  it("normalizes legacy/malformed levels without creating fake built stations",()=>{
    expect(campMasteryLevel62({up:{hearth:99}},"hearth")).toBe(2);
    expect(campMasteryLevel62({up:{hearth:1.9}},"hearth")).toBe(1);
    expect(campMasteryLevel62({up:{hearth:-3}},"hearth")).toBe(0);
    expect(campMasteryLevel62({up:{hearth:"2"}},"hearth")).toBe(0);
    expect(campMasteryLevel62({up:{hearth:Infinity}},"hearth")).toBe(0);
    expect(campMasteryNextBenefit62("not-real",0)).toContain("UNKNOWN");
    const g=createEngine();
    applyCampMastery62(g,meta({hearth:2,workshop:2,storage:2,fence:2}));
    expect(g.builtBench).toBe(false);
    expect(g.builtPile).toBe(false);
    expect(g.fenceLeft).toBe(false);
    expect(g.fenceRight).toBe(false);
    expect(pileCap(g)).toBe(0);
    expect(purchaseStation(g,"bench")).toBe(false);
    expect(g.campUpgrades).toEqual({hearth:2,bench:2,pile:2});
  });
  it("starts real station tiers on fresh runs, without duplicating Camp Legacy or Old Flint",()=>{
    const m=meta({hearth:2,workshop:2,storage:2,fence:2});
    const g=run(m);
    expect(g.campUpgrades).toEqual({hearth:2,bench:2,pile:2});
    expect(g.fenceMastery62).toBe(2);
    expect(g.builtBench).toBe(false);
    expect(g.builtPile).toBe(false);
    expect(g.fenceLeft).toBe(false);
    expect(g.fenceRight).toBe(false);
    expect(g.fireLit).toBe(false);
    expect(g.fuel).toBe(0);
    expect(g.player.wood).toBe(0);
    expect(g.stored).toBe(0);
    expect(g.ashEarned).toBe(0);
    expect(stationLevel(g,"hearth")).toBe(2);
    expect(stationFuelFactor(g)).toBe(0.74);
    expect(stationCost(g,"hearth")).toBe(0);
    expect(stationCraftCost(g,CRAFTS[0])).toBe(4);
    expect(pileCap(g)).toBe(0);
    g.builtBench=true;g.builtPile=true;
    expect(stationCost(g,"bench")).toBe(0);
    expect(pileCap(g)).toBe(52);
    expect(g.stored).toBe(0);
  });
  it("combines real Camp Legacy foundations with purchased station mastery",()=>{
    const m=meta({legacy:3,hearth:1,workshop:1,storage:2,fence:1});
    const g=run(m);
    expect(g.builtBench).toBe(true);
    expect(g.builtPile).toBe(true);
    expect(campEstablished(g)).toBe(true);
    expect(g.campUpgrades).toEqual({hearth:1,bench:1,pile:2});
    expect(pileCap(g)).toBe(52);
    expect(g.stored).toBe(0);
    expect(g.fenceTorches).toEqual({left:0,right:0,outer:0});
    expect(g.fireLit).toBe(false);
    expect(g.fuel).toBe(0);
  });
  it("protects only INSIDE a completed real fence, across expansion, without fake torches",()=>{
    const g=run(meta({fence:2})),m=meta();
    g.isNight=true;g.night=2;g.weather="clear";g.weatherBlend=1;
    g.previousWeather="clear";g.player.x=CX;
    expect(fenceProtection62(g)).toBe(0); // two real posts required
    g.fenceLeft=true;
    expect(fenceProtection62(g)).toBe(0);
    g.fenceRight=true;
    expect(fenceProtection62(g)).toBe(16);
    expect(coldProtection(g,m)).toBe(16);
    const indoor=coldTarget(g,m);
    g.player.x=campClaimBounds(g).west-1;
    expect(fenceProtection62(g)).toBe(0);
    expect(coldTarget(g,m)).toBe(indoor+16);
    g.player.x=EAST_POST_X+10;
    expect(fenceProtection62(g)).toBe(0);
    g.campExpansion=1;
    expect(fenceProtection62(g)).toBe(16);
    advanceCold(g,10,m);
    expect(g.cold).toBeGreaterThanOrEqual(0);
    expect(g.fenceTorches).toEqual({left:0,right:0,outer:0});
    g.fenceMastery62=99;
    expect(fenceProtection62(g)).toBe(16);
  });
  it("does not retrofit resumed checkpoints when a new mastery is bought later",()=>{
    const m=meta(),old=run(m);
    const checkpoint=captureRunSnapshot(old);
    expect(checkpoint.version).toBe(1);
    expect(checkpoint.state.fenceMastery62).toBe(0);
    m.up.hearth=2;m.up.workshop=2;m.up.storage=2;m.up.fence=2;
    const g=createEngine();
    g.resumeData=checkpoint.state;
    titleActions(g,m)[0].act();
    expect(g.campUpgrades).toEqual({hearth:0,bench:0,pile:0});
    expect(g.fenceMastery62).toBe(0);
    expect(run(m).campUpgrades).toEqual({hearth:2,bench:2,pile:2});
    expect(run(m).fenceMastery62).toBe(2);
  });
  it("persists inherited tiers and fence protection in the v1 checkpoint",()=>{
    const m=meta({hearth:2,workshop:1,storage:2,fence:1});
    const g=run(m);
    const snap=captureRunSnapshot(g);
    expect(snap.version).toBe(1);
    expect(snap.state.campUpgrades).toEqual({hearth:2,bench:1,pile:2});
    expect(snap.state.fenceMastery62).toBe(1);
    const restored=createEngine();restored.resumeData=snap.state;
    titleActions(restored,meta())[0].act(); // ownership no longer consulted on resume
    expect(restored.campUpgrades).toEqual({hearth:2,bench:1,pile:2});
    expect(restored.fenceMastery62).toBe(1);
    const old={...snap.state};delete old.fenceMastery62;
    const oldResume=createEngine();oldResume.resumeData=old;
    titleActions(oldResume,m)[0].act();
    expect(oldResume.fenceMastery62).toBe(0);
  });
  it("loads pre-62 permanent saves without resetting existing upgrades or Ash",()=>{
    storage.set("sekampfire-meta-v1",JSON.stringify({
      ash:77,totalAsh:80,up:{pack:3,scarf:1,legacy:2},runs:2
    }));
    const loaded=loadMeta();
    expect(loaded.ash).toBe(77);
    expect(loaded.up.pack).toBe(3);
    expect(loaded.up.scarf).toBe(1);
    expect(loaded.up.legacy).toBe(2);
    for(const id of ids)expect(loaded.up[id]).toBe(0);
  });
  it("shows four distinct pixel-art cards and scrolls the eleven real upgrades",()=>{
    const m=meta(),g=createEngine();
    g.ui="run";g.menu="shop";g.shopTab=0;g.menuSel=0;g.zones=[];
    expect(shopRows(g,m)).toHaveLength(11);
    expect(shopMaxScroll58(11)).toBe(44);
    const rects:any[]=[];
    let ink="";
    const ctx:any={
      set fillStyle(v:string){ink=v;},get fillStyle(){return ink;},
      fillRect(x:number,y:number,w:number,h:number){rects.push({x,y,w,h})},
      save:()=>{},restore:()=>{},beginPath:()=>{},rect:()=>{},clip:()=>{}
    };
    for(const id of ids){
      const prev=rects.length;
      drawShopCardIcon51(ctx,id,0,0);
      expect(rects.length).toBeGreaterThan(prev+3);
      expect(SHOP_CARD_LABEL51[id]).toBeTruthy();
      expect(textW(SHOP_TILE_NAME60[id])).toBeLessThanOrEqual(37);
    }
    drawShopTabs(ctx,g,m,shopRows(g,m),()=>{g.menu=null});
    expect(g.zones.filter((z:any)=>z.shopCardIndex58!==undefined)).toHaveLength(8);
    g.shopScroll=44;g.zones=[];
    drawShopTabs(ctx,g,m,shopRows(g,m),()=>{g.menu=null});
    const rows=g.zones.filter((z:any)=>z.shopCardIndex58!==undefined);
    expect(rows.some((z:any)=>z.shopCardIndex58===10)).toBe(true);
    expect(rows.every((z:any)=>z.y>=SHOP_VIEW58.y && z.y+z.h<=SHOP_VIEW58.y+SHOP_VIEW58.h)).toBe(true);
    expect(g.zones.some((z:any)=>z.x===SHOP_BUY51.x&&z.y===SHOP_BUY51.y)).toBe(true);
    chooseShopCategory60(g,"camp");
    expect(shopRows(g,m).map((r:any)=>r.id)).toEqual(["blue","legacy",...ids]);
  });
});
