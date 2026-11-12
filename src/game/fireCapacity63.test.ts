import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { createEngine, titleActions, shopRows, update } from "./game";
import { UPGRADES, CX } from "./config";
import { loadMeta, captureRunSnapshot } from "./save";
import { useOneFireLog52, MAX_FIRE_FUEL52 } from "./firewood52";
import {
  FIRE_BASE_CAPACITY63, FIRE_STEP_CAPACITY63, FIRE_MAX_LEVEL63,
  FIRE_MAX_CAPACITY63, FIRE_CAPACITY_COSTS63,
  fireCapacityLevel63, seedFireCapacity63, fireFuelCapacity63,
  fireHeatStrength63, fireHeatRadius63, fireCapacityNextBenefit63
} from "./fireCapacity63";
import { fireWarmthRate } from "./warmth";
import { localTemperature } from "./thermometer";
import { fireSheltered, coldTarget } from "./cold";
import { drawCampHUD } from "./hud";
import { drawShopTabs, SHOP_DETAILS51, SHOP_BUY51 } from "./menuScreens";
import { SHOP_CARD_LABEL51, SHOP_CARD_BENEFIT51, drawShopCardIcon51 } from "./shopCards51";
import { SHOP_TILE_NAME60, chooseShopCategory60 } from "./shopCategories60";

let store:Map<string,string>;
beforeEach(()=>{
  store=new Map();
  vi.stubGlobal("localStorage",{
    getItem:(key:string)=>store.get(key)??null,
    setItem:(key:string,value:string)=>store.set(key,String(value)),
    removeItem:(key:string)=>store.delete(key)
  });
});
afterEach(()=>vi.unstubAllGlobals());
const meta=(up:Record<string,number>={})=>({
  ash:900,up:{...up},totalAsh:900,best:0,runs:0,collection:{},guideFx:true
});
function newRun(m:any=meta()){
  const g=createEngine();titleActions(g,m)[0].act();
  return g;
}
function rectangles(){
  const pixels:Array<{x:number;y:number;w:number;h:number;color:string}>=[];
  let color="";
  const ctx:any={
    set fillStyle(x:string){color=x;},get fillStyle(){return color;},
    fillRect(x:number,y:number,w:number,h:number){
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      pixels.push({x,y,w,h,color});
    },
    save:()=>{},restore:()=>{},beginPath:()=>{},rect:()=>{},clip:()=>{}
  };
  return {ctx,pixels};
}

describe("Patch #63 - eight-level permanent fuel capacity",()=>{
  it("starts at 100 and adds exactly 50 each tier until 500",()=>{
    expect(MAX_FIRE_FUEL52).toBe(100);
    expect(FIRE_BASE_CAPACITY63).toBe(100);
    expect(FIRE_STEP_CAPACITY63).toBe(50);
    expect(FIRE_MAX_LEVEL63).toBe(8);
    expect(FIRE_MAX_CAPACITY63).toBe(500);
    for(let tier=0;tier<=8;tier++){
      const g=createEngine();
      seedFireCapacity63(g,meta({firecap:tier}));
      expect(g.fireCapacityTier63).toBe(tier);
      expect(fireFuelCapacity63(g)).toBe(100+50*tier);
    }
    expect(fireCapacityLevel63(meta({firecap:99}))).toBe(8);
    expect(fireCapacityLevel63(meta({firecap:-10}))).toBe(0);
    expect(fireCapacityLevel63(meta({firecap:3.9}))).toBe(3);
    expect(fireCapacityLevel63(meta({firecap:Infinity}))).toBe(0);
    expect(fireCapacityLevel63(meta({firecap:NaN}))).toBe(0);
    expect(fireCapacityLevel63({up:{firecap:"8"}})).toBe(0);
    expect(fireCapacityNextBenefit63(7)).toContain("500");
    expect(fireCapacityNextBenefit63(8)).toContain("500");
  });
  it("uses exactly eight prices, banked Ash only, and never buys level nine",()=>{
    const g=createEngine(),m=meta();
    g.ui="run";g.shopTab=0;g.shopCategory60="camp";g.ashEarned=9999;
    const u=UPGRADES.find(entry=>entry.id==="firecap")!;
    expect(u.max).toBe(8);
    expect(u.costs).toEqual(FIRE_CAPACITY_COSTS63);
    m.ash=0;
    expect(shopRows(g,m).find((r:any)=>r.id==="firecap")!.buy()).toBe(false);
    for(let i=0;i<8;i++){
      const row=shopRows(g,m).find((r:any)=>r.id==="firecap")!;
      expect(row.level).toBe(i);
      expect(row.cost).toBe(FIRE_CAPACITY_COSTS63[i]);
      expect(row.desc).toBe(fireCapacityNextBenefit63(i));
      m.ash+=row.cost;
      expect(row.buy()).toBe(true);
      expect(m.ash).toBe(0);
      expect(m.up.firecap).toBe(i+1);
      expect(fireFuelCapacity63(g)).toBe(100); // purchase never retrofits this run
    }
    expect(loadMeta().up.firecap).toBe(8);
    const done=shopRows(g,m).find((r:any)=>r.id==="firecap")!;
    expect(done.maxed).toBe(true);
    expect(done.buy()).toBe(false);
  });
  it("makes higher-cap fires accept real Pine Logs, never spends at the cap",()=>{
    const g=createEngine();
    g.fireLit=true;g.fuel=100;g.fireCapacityTier63=8;g.player.wood=3;g.stored=0;
    const one=useOneFireLog52(g,()=>1);
    expect(one.kind).toBe("stoked");
    expect(one.fuel).toBe(120);
    expect(g.player.wood).toBe(2);
    g.fuel=498;
    const near=useOneFireLog52(g,()=>1);
    expect(near.added).toBe(2);
    expect(near.fuel).toBe(500);
    expect(g.player.wood).toBe(1);
    const random=vi.fn(()=>1);
    const full=useOneFireLog52(g,random);
    expect(full.kind).toBe("full");
    expect(random).not.toHaveBeenCalled();
    expect(g.player.wood).toBe(1);
    const normal=createEngine();
    normal.fireLit=true;normal.fuel=99;normal.player.wood=1;
    expect(useOneFireLog52(normal,random).kind).toBe("full"); // old behavior unchanged
  });
  it("does not provide free fuel, even with Old Flint, Camp Legacy or mastery",()=>{
    const g=newRun(meta({firecap:8,legacy:4,hearth:2}));
    expect(fireFuelCapacity63(g)).toBe(500);
    expect(g.fuel).toBe(0);
    expect(g.fireLit).toBe(false);
    const flint=newRun(meta({firecap:8,flint:1}));
    expect(flint.fuel).toBe(40);
    expect(flint.fireLit).toBe(true);
    expect(fireFuelCapacity63(flint)).toBe(500);
  });
  it("saves real fuel beyond 100 and refuses to retrofit older checkpoints",()=>{
    const m=meta({firecap:8}),g=newRun(m);
    g.fireLit=true;g.fuel=450;
    const snap=captureRunSnapshot(g);
    expect(snap.version).toBe(1);
    expect(snap.state.fuel).toBe(450);
    expect(snap.state.fireCapacityTier63).toBe(8);
    const resumed=createEngine();resumed.resumeData=snap.state;
    titleActions(resumed,meta())[0].act();
    expect(resumed.fuel).toBe(450);
    expect(resumed.fireCapacityTier63).toBe(8);
    const oldm=meta(),oldRun=newRun(oldm);
    const legacy=captureRunSnapshot(oldRun);
    delete legacy.state.fireCapacityTier63;
    oldm.up.firecap=8;
    const oldRestore=createEngine();oldRestore.resumeData=legacy.state;
    titleActions(oldRestore,oldm)[0].act();
    expect(oldRestore.fireCapacityTier63).toBe(0);
    expect(fireFuelCapacity63(oldRestore)).toBe(100);
    expect(newRun(oldm).fireCapacityTier63).toBe(8);
  });
  it("preserves existing Ash upgrades and clamps bad new ownership levels",()=>{
    store.set("sekampfire-meta-v1",JSON.stringify({
      up:{legacy:2,pack:4,scarf:1,firecap:999},ash:41,totalAsh:90
    }));
    const m=loadMeta();
    expect(m.up.legacy).toBe(2);
    expect(m.up.pack).toBe(4);
    expect(m.up.scarf).toBe(1);
    expect(m.up.firecap).toBe(8);
    expect(m.ash).toBe(41);
  });
});

describe("Patch #63 - fire fullness drives heat and readable Shop",()=>{
  it("more REAL fuel means more radius, higher local air and faster Warmth recovery",()=>{
    const g=createEngine();
    g.fireCapacityTier63=8;g.fireLit=true;g.player.x=CX;
    g.weather="clear";g.previousWeather="clear";g.weatherBlend=1;
    g.heatSoak=8;
    g.fuel=20;
    const weak={radius:fireHeatRadius63(g),temp:localTemperature(g),rate:fireWarmthRate(g)};
    g.fuel=100;
    const normal={radius:fireHeatRadius63(g),temp:localTemperature(g),rate:fireWarmthRate(g)};
    expect(fireHeatStrength63(g)).toBeCloseTo(1);
    expect(normal.rate).toBeCloseTo(8.5);
    g.fuel=500;
    const strong={radius:fireHeatRadius63(g),temp:localTemperature(g),rate:fireWarmthRate(g)};
    expect(fireHeatStrength63(g)).toBeCloseTo(1.75);
    expect(weak.radius).toBeLessThan(normal.radius);
    expect(normal.radius).toBeLessThan(strong.radius);
    expect(weak.temp).toBeLessThan(normal.temp);
    expect(normal.temp).toBeLessThan(strong.temp);
    expect(weak.rate).toBeLessThan(normal.rate);
    expect(normal.rate).toBeLessThan(strong.rate);
    g.player.x=CX+67;
    g.fuel=100;
    expect(fireSheltered(g)).toBe(false);
    const exposed=coldTarget(g,meta());
    g.fuel=500;
    expect(fireSheltered(g)).toBe(true);
    expect(coldTarget(g,meta())).toBeLessThan(exposed);
  });
  it("the HUD fuel bar uses a 500-capacity ratio and draws actual numeric fuel",()=>{
    const g=createEngine(),m=meta();
    g.ui="run";g.fireLit=true;g.fuel=250;g.fireCapacityTier63=8;
    g.weather="clear";g.previousWeather="clear";g.weatherBlend=1;
    const v=rectangles();
    drawCampHUD(v.ctx,g,m);
    expect(v.pixels.some(p=>p.x===40&&p.y===33&&p.w===25&&p.h===3)).toBe(true);
    g.fuel=500;
    const full=rectangles();
    drawCampHUD(full.ctx,g,m);
    expect(full.pixels.some(p=>p.x===40&&p.y===33&&p.w===30&&p.h===3)).toBe(true);
    expect(full.pixels.some(p=>p.x===70&&p.y===33&&p.w===20&&p.h===3)).toBe(true);
  });
  it("the Shop removes its old footer and devotes an extra line to specific benefits",()=>{
    const g=createEngine(),m=meta();
    g.ui="run";g.menu="shop";g.shopTab=0;g.shopCategory60="camp";g.menuSel=1;
    expect(SHOP_DETAILS51).toEqual({x:30,y:137,w:260,h:33});
    const v=rectangles();
    g.zones=[];
    drawShopTabs(v.ctx,g,m,shopRows(g,m),()=>{g.menu=null});
    expect(v.pixels.some(p=>p.x===24&&p.y===8&&p.w===272&&p.h===164&&p.color==="rgba(8,12,26,0.96)")).toBe(true);
    expect(v.pixels.some(p=>p.x===30&&p.y===137&&p.w===260&&p.h===33)).toBe(true);
    expect(g.zones.some((z:any)=>z.x===SHOP_BUY51.x&&z.y===SHOP_BUY51.y)).toBe(true);
    expect(SHOP_CARD_BENEFIT51.scarf).toContain("WARMTH LOSS");
    expect(SHOP_CARD_BENEFIT51.fence).toContain("COLD PROTECTION");
    expect(SHOP_CARD_BENEFIT51.firecap).toContain("500");
    expect(SHOP_CARD_LABEL51.firecap).toBe("FIRE CAPACITY");
    expect(SHOP_TILE_NAME60.firecap).toBe("FUEL");
    const icon=rectangles();
    drawShopCardIcon51(icon.ctx,"firecap",0,0);
    expect(icon.pixels.length).toBeGreaterThan(5);
    chooseShopCategory60(g,"all");
    expect(shopRows(g,m)).toHaveLength(12);
  });
  it("larger fire lasts longer with identical fuel burn rate, not free fuel",()=>{
    const g=createEngine(),m=meta(),cb={toast:vi.fn(),end:vi.fn()};
    g.ui="run";g.fireLit=true;g.fuel=400;g.fireCapacityTier63=8;
    g.player.x=CX;g.player.warmth=60;g.isNight=false;
    g.weather="clear";g.previousWeather="clear";g.weatherBlend=1;
    g.trees=[];g.pickups=[];g.falling=[];
    update(g,m,1,cb);
    expect(g.fuel).toBeCloseTo(399.15,2);
    expect(g.player.warmth).toBeGreaterThan(60);
  });
});
