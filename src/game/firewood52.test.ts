import {beforeEach,afterEach,describe,expect,it,vi} from "vitest";
import {
  WOOD_SPECIES52,INITIAL_TINDER_BONUS52,MAX_FIRE_FUEL52,
  rollWoodFuel52,useOneFireLog52
} from "./firewood52";
import {createEngine,accessHearth,titleActions,update} from "./game";
import {captureRunSnapshot,loadMeta} from "./save";
import {ITEM_DEFINITIONS,itemQuantity} from "./inventory";
import {stationKindlingBonus} from "./campProgress";
import {TUTORIAL_PAGES} from "./tutorial";
import {GUIDE_LEVELS} from "./guide";

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
function state(){
  const g=createEngine();g.ui="run";g.over=false;g.menu=null;
  g.player.wood=0;g.stored=0;g.fuel=0;
  g.fireLit=false;g.firestarter=1;g.guideStokes=0;
  g.trees=[];g.pickups=[];g.falling=[];g.toasts=[];
  return g;
}
const meta=()=>({up:{},ash:0,totalAsh:0,museumBuilt:false,petEquipped:null});
const actualLogs=(g:any)=>g.player.wood+g.stored+
  g.pickups.reduce((n:number,p:any)=>n+p.w,0)+(g.dog?.wood||0);

describe("Patch #52: data-driven Pine fuel values",()=>{
  it("defines one ACTUAL resource, registered as the existing Pine inventory item",()=>{
    expect(Object.keys(WOOD_SPECIES52)).toEqual(["pine_log"]);
    expect(WOOD_SPECIES52.pine_log.itemId).toBe("pine_log");
    expect(WOOD_SPECIES52.pine_log.tree).toBe("PINE TREE");
    expect(WOOD_SPECIES52.pine_log.weightKg).toBe(ITEM_DEFINITIONS.pine_log.weight);
    expect([WOOD_SPECIES52.pine_log.fuelMin,WOOD_SPECIES52.pine_log.fuelMax])
      .toEqual([5,20]);
    expect(ITEM_DEFINITIONS.pine_log.description.join(" ")).toContain("5-20 FUEL");
  });
  it("rolls inclusive integer 5-20 without ever producing 4, 21 or a fraction",()=>{
    expect(rollWoodFuel52("pine_log",()=>0)).toBe(5);
    expect(rollWoodFuel52("pine_log",()=>0.5)).toBe(13);
    expect(rollWoodFuel52("pine_log",()=>0.999999999)).toBe(20);
    expect(rollWoodFuel52("pine_log",()=>1)).toBe(20);
    expect(rollWoodFuel52("pine_log",()=>-10)).toBe(5);
    expect(rollWoodFuel52("pine_log",()=>Infinity)).toBe(5);
    expect(rollWoodFuel52("pine_log",()=>NaN)).toBe(5);
    expect(Array.from({length:16},(_,i)=>
      rollWoodFuel52("pine_log",()=>(i+.5)/16)
    )).toEqual(Array.from({length:16},(_,i)=>i+5));
    expect(()=>rollWoodFuel52("bogus" as any,()=>0)).toThrow("UNKNOWN WOOD");
  });
  it("does not consume starter tinder or RNG when the first light has NO real wood",()=>{
    const g=state(),rng=vi.fn(()=>0);
    const result=useOneFireLog52(g,rng);
    expect(result).toMatchObject({kind:"no_log",roll:0,added:0,source:null});
    expect(rng).not.toHaveBeenCalled();
    expect(g.fireLit).toBe(false);
    expect(g.firestarter).toBe(1);
    expect(g.fuel).toBe(0);
    expect(g.everLit).toBe(false);
  });
  it("first ignition costs precisely 1 carried log and grants rolled fuel plus starter tinder",()=>{
    const g=state();g.player.wood=3;g.stored=4;
    const before=actualLogs(g);
    const result=useOneFireLog52(g,()=>0);
    expect(result).toMatchObject({
      kind:"lit",wood:"pine_log",source:"carried",roll:5,
      kindlingBonus:0,starterBonus:INITIAL_TINDER_BONUS52,
      added:25,fuel:25
    });
    expect(g.fireLit).toBe(true);expect(g.everLit).toBe(true);
    expect(g.firestarter).toBe(0);
    expect(g.player.wood).toBe(2);
    expect(g.stored).toBe(4);
    expect(actualLogs(g)).toBe(before-1);
    expect(g.guideStokes).toBe(0); // Grooty's FEED task stays separate
    expect(itemQuantity(g.inventory,"pine_log")).toBe(2);
  });
  it("1 Pine Log lights the fire with an actual +25 through +40 first-fuel span",()=>{
    const cold=state(),warm=state();
    cold.player.wood=1;warm.player.wood=1;
    const a=useOneFireLog52(cold,()=>0);
    const b=useOneFireLog52(warm,()=>0.999999);
    expect(a.fuel).toBe(25);
    expect(b.fuel).toBe(40);
    expect(cold.player.wood).toBe(0);
    expect(warm.player.wood).toBe(0);
  });
  it("every later relight needs ONLY ONE Pine Log, without the starter bonus",()=>{
    const g=state();g.firestarter=0;g.everLit=true;g.player.wood=1;
    g.stored=7;
    const result=useOneFireLog52(g,()=>0.9999);
    expect(result).toMatchObject({
      kind:"lit",source:"carried",roll:20,starterBonus:0,added:20
    });
    expect(g.player.wood).toBe(0);
    expect(g.stored).toBe(7);
    expect(g.fuel).toBe(20);
    expect(g.guideStokes).toBe(0);
  });
  it("can light or relight using ONE stored log, without removing any from the backpack",()=>{
    const g=state();g.player.wood=0;g.stored=3;
    const first=useOneFireLog52(g,()=>.5);
    expect(first.source).toBe("storage");
    expect(g.player.wood).toBe(0);
    expect(g.stored).toBe(2);
    expect(g.fuel).toBe(33);
    g.fireLit=false;g.fuel=0;
    const second=useOneFireLog52(g,()=>.5);
    expect(second.source).toBe("storage");
    expect(g.stored).toBe(1);
    expect(second.fuel).toBe(13);
    expect(second.starterBonus).toBe(0);
  });
  it("a feeding action uses a fresh roll per Pine Log and advances Grooty's feed task",()=>{
    const g=state();g.fireLit=true;g.fuel=18;g.firestarter=0;
    g.player.wood=3;
    const rolls=[0,0.99999,0.5];
    for(const [i,expected] of [5,20,13].entries()){
      const result=useOneFireLog52(g,()=>rolls[i]);
      expect(result.kind).toBe("stoked");
      expect(result.roll).toBe(expected);
      expect(result.added).toBe(expected);
      expect(g.guideStokes).toBe(i+1);
      expect(g.player.wood).toBe(2-i);
    }
    expect(g.fuel).toBe(18+5+20+13);
  });
  it("Kindling Bundle adds +5 to EACH genuine log, without overriding the random roll",()=>{
    const g=state();g.firestarter=0;g.crafts.kindling=true;
    g.player.wood=2;
    expect(stationKindlingBonus(g)).toBe(5);
    const first=useOneFireLog52(g,()=>0);
    expect(first).toMatchObject({kind:"lit",roll:5,kindlingBonus:5,
      starterBonus:0,added:10});
    const second=useOneFireLog52(g,()=>0.9999);
    expect(second).toMatchObject({kind:"stoked",roll:20,
      kindlingBonus:5,added:25});
    expect(g.fuel).toBe(35);
    expect(g.player.wood).toBe(0);
  });
  it("never feeds a nearly full fire without a log, and never overflows fuel cap",()=>{
    const g=state();g.fireLit=true;g.fuel=99;g.player.wood=1;
    const random=vi.fn(()=>1);
    const blocked=useOneFireLog52(g,random);
    expect(blocked.kind).toBe("full");
    expect(g.player.wood).toBe(1);
    expect(random).not.toHaveBeenCalled();
    g.fuel=98;
    const filled=useOneFireLog52(g,random);
    expect(filled.roll).toBe(20);
    expect(filled.added).toBe(2);
    expect(filled.fuel).toBe(MAX_FIRE_FUEL52);
    expect(g.player.wood).toBe(0);
  });
  it("no available log never creates free fire, while an already lit fire remains lit",()=>{
    const g=state();g.firestarter=0;g.everLit=true;
    const result=useOneFireLog52(g,()=>.95);
    expect(result.kind).toBe("no_log");
    expect(g.fireLit).toBe(false);
    expect(g.everLit).toBe(true);
    g.fireLit=true;g.fuel=20;
    expect(useOneFireLog52(g,()=>.95).kind).toBe("no_log");
    expect(g.fireLit).toBe(true);
    expect(g.fuel).toBe(20);
  });
});

describe("Patch #52: real-world integration, saves, UI and balance",()=>{
  it("the actual hearth action requires one log, not free fire or three-log relight",()=>{
    const g=state();
    accessHearth(g);
    expect(g.fireLit).toBe(false);
    expect(g.firestarter).toBe(1);
    g.player.wood=1;
    accessHearth(g);
    expect(g.fireLit).toBe(true);
    expect(g.player.wood).toBe(0);
    expect(g.fuel).toBeGreaterThanOrEqual(25);
    expect(g.fuel).toBeLessThanOrEqual(40);
    expect(g.toasts.join(" ")).not.toContain("3 PINE LOGS");
    g.fireLit=false;g.fuel=0;g.stored=1;
    accessHearth(g);
    expect(g.fireLit).toBe(true);
    expect(g.stored).toBe(0);
    expect(g.fuel).toBeGreaterThanOrEqual(5);
    expect(g.fuel).toBeLessThanOrEqual(20);
  });
  it("the tutorial and Grooty's real fire task explain one-log ignition and variable Pine fuel",()=>{
    const firePage=TUTORIAL_PAGES.find(x=>x.art==="fire");
    expect(firePage?.lines.join(" ")).toContain("ONE PINE LOG");
    expect(firePage?.lines.join(" ")).toContain("5-20 FUEL");
    const hint=GUIDE_LEVELS[0].goals.find(x=>x.id==="light-fire")?.hint;
    expect(hint).toContain("1 PINE LOG");
  });
  it("old v1 run checkpoints still restore carried and stored logs and the unlit starter",()=>{
    const g=state();g.player.wood=2;g.stored=4;
    const original=captureRunSnapshot(g);
    expect(original.version).toBe(1);
    expect(original.state.inventory.slots[0]).toEqual({id:"pine_log",qty:2});
    expect(original.state).not.toHaveProperty("woodBurnQuality");
    expect(original.state.firestarter).toBe(1);
    const restored=createEngine();restored.resumeData=original.state;
    titleActions(restored,meta())[0].act();
    expect(restored.player.wood).toBe(2);
    expect(restored.stored).toBe(4);
    expect(restored.firestarter).toBe(1);
    const result=useOneFireLog52(restored,()=>0);
    expect(result.fuel).toBe(25);
    expect(restored.player.wood).toBe(1);
    expect(restored.stored).toBe(4);
  });
  it("Old Flint remains a permanent pre-lit Ash upgrade with original startup fuel",()=>{
    const g=createEngine(),m:any=meta();
    m.up.flint=1;
    titleActions(g,m)[0].act();
    expect(g.ui).toBe("run");
    expect(g.fireLit).toBe(true);
    expect(g.fuel).toBe(40);
    expect(g.firestarter).toBe(0);
    expect(g.player.wood).toBe(2);
    const next=useOneFireLog52(g,()=>0);
    expect(next.kind).toBe("stoked");
    expect(next.roll).toBe(5);
    expect(next.starterBonus).toBe(0);
    expect(g.fuel).toBe(45);
    expect(g.player.wood).toBe(1);
  });
  it("ordinary weather and reflector fuel drain remain unchanged",()=>{
    const g=state(),m=meta();
    g.fireLit=true;g.firestarter=0;g.fuel=50;
    g.player.x=123;g.weather="clear";g.time=5;
    g.crafts.refl=false;g.campUpgrades.hearth=0;
    update(g,m,1,{toast:()=>{},end:()=>{}});
    expect(g.fuel).toBeCloseTo(50-0.85,4);
    g.weather="wind";g.stage=0;g.fuel=50;
    update(g,m,1,{toast:()=>{},end:()=>{}});
    expect(g.fuel).toBeCloseTo(50-0.85*1.5,4);
    g.weather="clear";g.crafts.refl=true;g.fuel=50;
    update(g,m,1,{toast:()=>{},end:()=>{}});
    expect(g.fuel).toBeCloseTo(50-0.85*0.8,4);
  });
  it("does not alter permanent Ash or Museum collection during Pine burning",()=>{
    const g=state(),m:any=meta();
    m.ash=22;m.collection={ordinary:true};
    g.player.wood=2;g.stored=3;
    useOneFireLog52(g,()=>0.3);
    expect(m.ash).toBe(22);
    expect(m.collection).toEqual({ordinary:true});
    expect(g.player.wood).toBe(1);
    expect(g.stored).toBe(3);
  });
});
