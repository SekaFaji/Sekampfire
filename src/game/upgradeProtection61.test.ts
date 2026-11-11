import { afterEach, describe, expect, it, vi } from "vitest";
import { UPGRADES, CX } from "./config";
import { MAX_CARRY_KG, carryCap } from "./rules";
import { coldProtection, coldTarget, advanceCold, coldWarmthDrain } from "./cold";
import { carriedWeightLimit, normalizeInventory, PINE_LOG_ID } from "./inventory";
import { createEngine, shopRows, titleActions } from "./game";
import { loadMeta, captureRunSnapshot } from "./save";
import { SHOP_CARD_BENEFIT51 } from "./shopCards51";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function world() {
  const g=createEngine();
  g.isNight=true; g.night=2; g.weather="clear";
  g.previousWeather="clear"; g.weatherBlend=1; g.dampness=0;
  g.player.x=CX+125; g.player.torchT=0; g.fireLit=false; g.fuel=0;
  g.stage=0; g.crafts={}; g.dog=null;
  return g;
}

describe("Patch #61 - five permanent backpack levels",()=>{
  it("gives exactly +5kg per level, max +25kg, and keeps the crafted +8kg",()=>{
    const g=world(),m:any={up:{}};
    expect(MAX_CARRY_KG).toBe(38);
    for(let level=0;level<=5;level++){
      m.up.pack=level;
      expect(carryCap(g,m)).toBe(5+level*5);
      expect(carriedWeightLimit(g,m)).toBe(5+level*5);
      g.crafts.pack=true;
      expect(carryCap(g,m)).toBe(13+level*5);
      g.crafts.pack=false;
    }
    m.up.pack=99;
    expect(carryCap(g,m)).toBe(30);
    m.up.pack=-8;
    expect(carryCap(g,m)).toBe(5);
  });
  it("charges all five actual shop prices and prevents buying a sixth level",()=>{
    const g=world(),m:any={up:{},ash:300};
    const bag=UPGRADES.find(u=>u.id==="pack")!;
    expect(bag.max).toBe(5);
    expect(bag.costs).toEqual([16,24,34,46,60]);
    for(let i=0;i<5;i++){
      const row=shopRows(g,m).find((r:any)=>r.id==="pack")!;
      expect(row.level).toBe(i);
      expect(row.cost).toBe(bag.costs[i]);
      const prior=m.ash;
      expect(row.buy()).toBe(true);
      expect(m.up.pack).toBe(i+1);
      expect(m.ash).toBe(prior-bag.costs[i]);
    }
    const last=shopRows(g,m).find((r:any)=>r.id==="pack")!;
    expect(last.maxed).toBe(true);
    expect(last.buy()).toBe(false);
    expect(m.up.pack).toBe(5);
    expect(SHOP_CARD_BENEFIT51.pack).toContain("5KG");
  });
  it("restores 38 Pine Logs from both canonical inventory and old wood checkpoints",()=>{
    const g=world();
    const slots=Array.from({length:20},()=>null as any);
    slots[0]={id:PINE_LOG_ID,qty:38};
    expect(normalizeInventory({slots},0).slots[0]?.qty).toBe(38);
    expect(normalizeInventory(null,38).slots[0]?.qty).toBe(38);
    g.ui="run";g.player.wood=38;g.trees=[];g.pickups=[];g.falling=[];
    const snap=captureRunSnapshot(g);
    expect(snap.state.player.wood).toBe(38);
    const restored=createEngine();
    restored.resumeData=snap.state;
    const m:any={up:{pack:5},ash:0};
    titleActions(restored,m)[0].act();
    expect(restored.player.wood).toBe(38);
  });
  it("preserves existing one-level backpack and scarf ownership on loading old meta",()=>{
    const store=new Map<string,string>();
    vi.stubGlobal("localStorage",{
      getItem:(k:string)=>store.get(k)||null,
      setItem:(k:string,v:string)=>store.set(k,String(v)),
      removeItem:(k:string)=>store.delete(k)
    });
    store.set("sekampfire-meta-v1",JSON.stringify({up:{pack:1,scarf:1},ash:40}));
    const m=loadMeta();
    expect(m.up.pack).toBe(1);
    expect(m.up.scarf).toBe(1);
    expect(carryCap(world(),m)).toBe(10);
  });
});

describe("Patch #61 - clothing and companion Cold protection",()=>{
  it("stacks crafted boots, permanent scarf and nearby equipped Bingsu",()=>{
    const g=world(),m:any={up:{}};
    expect(coldProtection(g,m)).toBe(0);
    const baseline=coldTarget(g,m);
    g.crafts.boots=true;
    expect(coldProtection(g,m)).toBe(12);
    expect(coldTarget(g,m)).toBe(baseline-12);
    m.up.scarf=1;
    expect(coldProtection(g,m)).toBe(27);
    expect(coldTarget(g,m)).toBe(baseline-27);
    m.up.dog=1; m.petEquipped="dog";
    g.dog={x:g.player.x+13};
    expect(coldProtection(g,m)).toBe(32);
    expect(coldTarget(g,m)).toBe(baseline-32);
    g.dog.x=g.player.x+80;
    expect(coldProtection(g,m)).toBe(27);
    g.dog.x=g.player.x+13;
    m.petEquipped=null;
    expect(coldProtection(g,m)).toBe(27);
  });
  it("lowers actual exposure and warmth drain without changing outside climate",()=>{
    const g=world(),m:any={up:{}};
    const originalTarget=coldTarget(g,m);
    g.cold=originalTarget;
    const plainDrain=coldWarmthDrain(g,m);
    m.up.scarf=1;
    advanceCold(g,30,m);
    expect(g.cold).toBeLessThan(originalTarget);
    expect(coldWarmthDrain(g,m)).toBeLessThan(plainDrain);
    expect(SHOP_CARD_BENEFIT51.scarf).toContain("COLD PROTECTION");
  });
});
