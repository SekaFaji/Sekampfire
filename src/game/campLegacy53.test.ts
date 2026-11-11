import { beforeEach,afterEach,describe,it,expect,vi } from "vitest";
import { createEngine,titleActions,shopRows } from "./game";
import { captureRunSnapshot,saveMeta,loadMeta } from "./save";
import { UPGRADES } from "./config";
import { CAMP_LEGACY_COSTS53,CAMP_LEGACY_MAX53,
  CAMP_LEGACY_BENEFITS53,campLegacyLevel53,
  campLegacyNextBenefit53,applyCampLegacy53 } from "./campLegacy53";
import { campEstablished } from "./campBoundary";
import { GUIDE_LEVELS } from "./guide";
import { SHOP_CARD_LABEL51,SHOP_CARD_BENEFIT51 } from "./shopCards51";
import { drawShopTabs,SHOP_CARD51,SHOP_BUY51 } from "./menuScreens";
import { SHOP_VIEW58,shopMaxScroll58,moveShopScroll58 } from "./shopScroll58";
import { BINGSU,drawBingsuPortrait,drawBingsuShopProfile } from "./bingsu";
import { drawBingsuWorldSprite } from "./bingsuWorld49";

let store:Map<string,string>;
beforeEach(()=>{
  store=new Map();
  vi.stubGlobal("localStorage",{
    getItem:(k:string)=>store.get(k)??null,
    setItem:(k:string,v:string)=>store.set(k,String(v)),
    removeItem:(k:string)=>store.delete(k)
  });
});
afterEach(()=>vi.unstubAllGlobals());

const meta=(level=0)=>({
 ash:1000,totalAsh:1000,best:0,runs:0,wonEver:false,
 up:{legacy:level},petEquipped:null,axeEquipped:"stick",
 museumBuilt:false,collection:{},guideFx:true
});
function newRun(m:any){
  const g=createEngine();
  titleActions(g,m)[0].act();
  return g;
}
function plot(){
  const rectangles:{x:number;y:number;w:number;h:number;color:string}[]=[];
  let color="";
  const ctx:any={
    set fillStyle(v:string){color=v;},
    get fillStyle(){return color;},
    fillRect(x:number,y:number,w:number,h:number){
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
      rectangles.push({x,y,w,h,color});
    }
  };
  return {ctx,rectangles};
}
function drawShop(g:any,m:any){
  const canvas=plot();g.zones=[];
  drawShopTabs(canvas.ctx,g,m,shopRows(g,m),()=>{g.menu=null});
  return canvas.rectangles;
}
function tap(g:any,x:number,y:number):void {
  const zone=[...g.zones].reverse().find((z:any)=>
    x>=z.x&&x<z.x+z.w&&y>=z.y&&y<z.y+z.h);
  expect(zone).toBeDefined();
  zone.onDown();
}

describe("Patch #53: four permanent Camp Legacy levels",()=>{
  it("ships four explicit, affordable-in-order levels without inventing building rewards",()=>{
    const u=UPGRADES.find(x=>x.id==="legacy");
    expect(u).toBeDefined();
    expect(u!.costs).toEqual([35,60,95,140]);
    expect(u!.max).toBe(4);
    expect(CAMP_LEGACY_COSTS53).toEqual(u!.costs);
    expect(CAMP_LEGACY_MAX53).toBe(4);
    expect(CAMP_LEGACY_BENEFITS53).toHaveLength(4);
    expect(campLegacyNextBenefit53(0)).toContain("LOG STORAGE");
    expect(campLegacyNextBenefit53(1)).toContain("WORKBENCH");
    expect(campLegacyNextBenefit53(2)).toContain("FENCE POSTS");
    expect(campLegacyNextBenefit53(3)).toContain("EXPANDED");
    expect(campLegacyNextBenefit53(4)).toContain("ALL CAMP");
  });
  it("normalizes old, corrupted and capped ownership values defensively",()=>{
    expect(campLegacyLevel53({})).toBe(0);
    expect(campLegacyLevel53({up:{}})).toBe(0);
    expect(campLegacyLevel53({up:{legacy:-10}})).toBe(0);
    expect(campLegacyLevel53({up:{legacy:2.8}})).toBe(2);
    expect(campLegacyLevel53({up:{legacy:55}})).toBe(4);
    expect(campLegacyLevel53({up:{legacy:Infinity}})).toBe(0);
    expect(campLegacyLevel53({up:{legacy:"4"}})).toBe(0);
  });
  for(let level=0;level<=4;level++){
    it("new run with Legacy "+level+" restores exactly the owned foundations, not resources",()=>{
      const m=meta(level),g=newRun(m);
      expect(g.ui).toBe("run");
      expect(g.builtPile).toBe(level>=1);
      expect(g.builtBench).toBe(level>=2);
      expect(g.fenceLeft).toBe(level>=3);
      expect(g.fenceRight).toBe(level>=3);
      expect(g.campExpansion).toBe(level>=4?1:0);
      expect(g.benchLogs).toBe(0);expect(g.pileLogs).toBe(0);
      expect(g.benchBuildT).toBe(-1);expect(g.pileBuildT).toBe(-1);
      expect(g.stored).toBe(0);
      expect(g.player.wood).toBe(0);
      expect(g.fuel).toBe(0);expect(g.fireLit).toBe(false);
      expect(g.firestarter).toBe(1);
      expect(g.guideLevel).toBe(0);
      expect(g.guideChops).toBe(0);expect(g.guideStokes).toBe(0);
      expect(g.crafts).toEqual({});
      expect(g.ashEarned).toBe(0);
      expect(g.campUpgrades).toEqual({hearth:0,bench:0,pile:0});
      expect(g.fenceTorches).toEqual({left:0,right:0,outer:0});
      expect(m.ash).toBe(1000);expect(m.up.legacy).toBe(level);
      expect(g.museumBuilt).toBe(false);
      expect(g.campaignLevel).toBe(1);
      expect(g.trees.every((t:any)=>Number.isFinite(t.x))).toBe(true);
    });
  }
  it("prebuilt fence fulfills only the real construction goals, not free scouting or Ash",()=>{
    const g=newRun(meta(3));
    expect(campEstablished(g)).toBe(true);
    const postGoals=GUIDE_LEVELS[0].goals.filter(x=>
      x.id==="left-post"||x.id==="right-post");
    expect(postGoals.map(x=>x.met(g))).toEqual([true,true]);
    expect(GUIDE_LEVELS[0].goals.find(x=>x.id==="chop")!.met(g)).toBe(false);
    expect(GUIDE_LEVELS[0].goals.find(x=>x.id==="scout-grove")!.met(g)).toBe(false);
    expect(g.guideLevel).toBe(0);
    expect(g.ashEarned).toBe(0);
    expect(g.campExpansion).toBe(0);
    expect(g.fenceTorches.right).toBe(0);
  });
  it("the legacy applicator is independent of the active simulation and does not create tools",()=>{
    const g=createEngine();g.player.wood=1;g.stored=3;g.fuel=24;
    g.ashEarned=8;g.crafts={boots:true};
    const inherited=applyCampLegacy53(g,meta(4));
    expect(inherited).toBe(4);
    expect(g.builtBench).toBe(true);
    expect(g.builtPile).toBe(true);
    expect(g.fenceLeft && g.fenceRight && g.campExpansion===1).toBe(true);
    expect(g.player.wood).toBe(1);
    expect(g.stored).toBe(3);
    expect(g.fuel).toBe(24);
    expect(g.ashEarned).toBe(8);
    expect(g.crafts).toEqual({boots:true});
  });
  it("a legacy purchase saves permanent Ash but NEVER builds the running camp",()=>{
    const m=meta();
    const g=newRun(m);
    g.shopTab=0;
    const row=shopRows(g,m).find((x:any)=>x.id==="legacy")!;
    expect(row).toBeDefined();
    const value=m.ash;
    row.buy();
    expect(m.up.legacy).toBe(1);expect(m.ash).toBe(value-35);
    expect(loadMeta().up.legacy).toBe(1);
    expect(g.builtPile).toBe(false);
    expect(g.builtBench).toBe(false);
    expect(g.fenceLeft).toBe(false);
    expect(g.campExpansion).toBe(0);
    const future=newRun(m);
    expect(future.builtPile).toBe(true);
    expect(future.stored).toBe(0);
  });
  it("each genuine BUY uses the next exact cost and cannot exceed level 4",()=>{
    const m=meta();const g=createEngine();g.shopTab=0;g.menu="shop";
    const expenses=[35,60,95,140];
    for(let i=0;i<4;i++){
      const row=shopRows(g,m).find((x:any)=>x.id==="legacy")!;
      expect(row.level).toBe(i);
      expect(row.cost).toBe(expenses[i]);
      expect(row.canBuy).toBe(true);
      expect(row.desc).toBe(CAMP_LEGACY_BENEFITS53[i]);
      row.buy();
      expect(m.up.legacy).toBe(i+1);
      expect(m.ash).toBe(1000-expenses.slice(0,i+1).reduce((a,b)=>a+b,0));
    }
    const max=shopRows(g,m).find((x:any)=>x.id==="legacy")!;
    expect(max.maxed).toBe(true);
    expect(max.canBuy).toBe(false);
    const ash=m.ash;
    max.buy();
    expect(m.ash).toBe(ash);
    expect(m.up.legacy).toBe(4);
    expect(loadMeta().up.legacy).toBe(4);
  });
  it("Ash insufficiency and non-purchased Legacy never grant buildings",()=>{
    const m=meta();m.ash=34;
    const g=createEngine();g.shopTab=0;
    const row=shopRows(g,m).find((x:any)=>x.id==="legacy")!;
    expect(row.canBuy).toBe(false);
    row.buy();
    expect(m.up.legacy).toBe(0);expect(m.ash).toBe(34);
    const run=newRun(m);
    expect(run.builtPile).toBe(false);
  });
  it("old permanent saves migrate without losing older upgrades and Museum collections",()=>{
    store.set("sekampfire-meta-v1",JSON.stringify({
      ash:77,totalAsh:80,runs:2,up:{dog:1,axe:1,pack:1},
      collection:{ordinary:true},museumBuilt:true
    }));
    const loaded=loadMeta();
    expect(loaded.up.legacy).toBe(0);
    expect(loaded.up.dog).toBe(1);
    expect(loaded.up.axe).toBe(1);
    expect(loaded.up.pack).toBe(1);
    expect(loaded.ash).toBe(77);
    expect(loaded.museumBuilt).toBe(true);
    expect(loaded.collection.ordinary).toBe(true);
    saveMeta(loaded);
    const again=loadMeta();
    expect(again.up.legacy).toBe(0);
    expect(again.ash).toBe(77);
  });
  it("resuming an existing v1 checkpoint does not retrofit NEW purchased Legacy buildings",()=>{
    const m=meta(0);
    const original=newRun(m);
    original.player.wood=2;original.stored=4;original.fuel=31;
    const snapshot=captureRunSnapshot(original);
    expect(snapshot.version).toBe(1);
    m.up.legacy=4; // purchased after checkpoint, must apply only next run
    const resumed=createEngine();
    resumed.resumeData=snapshot.state;
    titleActions(resumed,m)[0].act();
    expect(resumed.builtPile).toBe(false);
    expect(resumed.builtBench).toBe(false);
    expect(resumed.fenceLeft).toBe(false);
    expect(resumed.fenceRight).toBe(false);
    expect(resumed.campExpansion).toBe(0);
    expect(resumed.player.wood).toBe(2);
    expect(resumed.stored).toBe(4);
    expect(resumed.fuel).toBe(31);
    expect(captureRunSnapshot(resumed).version).toBe(1);
  });
});

describe("Patch #58: the seven-upgrade Ash Shop scrolls instead of paging",()=>{
  it("scrolls all seven cards while keeping the separate BUY area fixed",()=>{
    const m=meta(),g=createEngine();
    g.ui="run";g.menu="shop";g.shopTab=0;g.menuSel=0;
    expect(shopRows(g,m).length).toBe(7);
    expect(SHOP_CARD51.cols).toBe(4);
    expect(SHOP_CARD51.w).toBe(SHOP_CARD51.h);
    expect(Object.keys(SHOP_CARD_LABEL51)).toHaveLength(8); // including pet
    const pageOne=drawShop(g,m);
    const cards=g.zones.filter((z:any)=>z.w===SHOP_CARD51.w&&z.h===SHOP_CARD51.h);
    expect(cards).toHaveLength(4);
    expect(pageOne.every(p=>p.x>=24&&p.x+p.w<=296&&p.y>=8&&p.y+p.h<=172)).toBe(true);
    expect(SHOP_VIEW58.h).toBe(64);
    expect(shopMaxScroll58(7)).toBeGreaterThan(0);
    moveShopScroll58(g,999,7);
    expect(g.menuSel).toBe(0); // scrolling does NOT change selection
    expect(m.ash).toBe(1000);
    const bottom=drawShop(g,m);
    expect(g.zones.some((z:any)=>z.shopCardIndex58===6)).toBe(true);
    expect(bottom.every(p=>p.x>=24&&p.x+p.w<=296&&p.y>=8&&p.y+p.h<=172)).toBe(true);
    const legacy=g.zones.find((z:any)=>z.shopCardIndex58===6);
    tap(g,legacy.x+5,legacy.y+5);
    expect(g.menuSel).toBe(6);
    expect(m.up.legacy).toBe(0);
    drawShop(g,m);
    tap(g,SHOP_BUY51.x+10,SHOP_BUY51.y+10);
    expect(m.up.legacy).toBe(1);
    expect(m.ash).toBe(965);
    moveShopScroll58(g,-999,7);
    drawShop(g,m);
    expect(g.menuSel).toBe(6); // scroll position is independent of selection
    expect(m.ash).toBe(965);
  });
});

describe("Patch #53: Bingsu's identity and mature Dogo Argentino pixel art",()=>{
  it("shows her sweetness, hugs, rare barking, stubborn side and loyalty",()=>{
    expect(BINGSU.breed).toBe("DOGO ARGENTINO");
    expect(BINGSU.personality).toContain("SWEET");
    expect(BINGSU.personality).toContain("CALM");
    expect(BINGSU.personality).toContain("LOVING");
    expect(BINGSU.affection).toContain("HUG");
    expect(BINGSU.temperament).toContain("RARELY BARKS");
    expect(BINGSU.temperament).toContain("STUBBORN");
    expect(BINGSU.loyalty).toContain("FIGHT TO THE DEATH");
    expect(BINGSU.ability).toContain("2 PINE LOGS");
    const all=JSON.stringify(BINGSU).toLowerCase();
    expect(all).not.toContain("uncle"); // don't mention real-life inspiration
  });
  it("keeps the wider 94x68 head-and-chest portrait bounded with chest shading and no collar",()=>{
    const view=plot();
    drawBingsuPortrait(view.ctx,30,35);
    expect(view.rectangles.length).toBeGreaterThan(60);
    expect(view.rectangles.every(p=>p.x>=30&&p.x+p.w<=124&&p.y>=35&&p.y+p.h<=103))
      .toBe(true);
    for(const c of ["#f8efdf","#fcf6e8","#d4c5b7","#201c1d"])
      expect(view.rectangles.some(p=>p.color===c)).toBe(true);
    for(const c of ["#a95745","#d47e63","#b2644e","#e3b76b"])
      expect(view.rectangles.some(p=>p.color===c)).toBe(false);
    const profile=plot();
    drawBingsuShopProfile(profile.ctx,meta());
    expect(profile.rectangles.some(p=>p.color==="#fcf6e8")).toBe(true);
  });
  it("keeps world dog compact and able to display two real logs, still without collar",()=>{
    const view=plot();
    drawBingsuWorldSprite(view.ctx,{x:200,y:151,wood:2,dir:-1,phase:"walk",
      motion:80,gait:1.1},0.5);
    const r=view.rectangles;
    expect(r.filter(p=>p.color==="#553824")).toHaveLength(2);
    expect(Math.max(...r.map(p=>p.x+p.w))-Math.min(...r.map(p=>p.x))).toBeLessThanOrEqual(24);
    expect(Math.max(...r.map(p=>p.y+p.h))-Math.min(...r.map(p=>p.y))).toBeLessThanOrEqual(16);
    expect(r.some(p=>p.color==="#b2644e")).toBe(false);
  });
});
