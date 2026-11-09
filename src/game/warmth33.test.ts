import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
import {HEAT_SOAK_SECONDS, HEAT_FADE_SECONDS, advanceHeatSoak, fireWarmthRate} from "./warmth";
import {createEngine,update,titleActions,settingsRows} from "./game";
import {captureRunSnapshot,loadMeta} from "./save";
import {CX} from "./config";

let saved:Map<string,string>;
beforeEach(()=>{
  saved=new Map();
  vi.stubGlobal("localStorage",{
    getItem:(k:string)=>saved.get(k)??null,
    setItem:(k:string,v:string)=>saved.set(k,String(v)),
    removeItem:(k:string)=>saved.delete(k)
  });
});
afterEach(()=>vi.unstubAllGlobals());
const meta=()=>({ash:4,totalAsh:4,best:0,runs:0,up:{},collection:{},guideFx:true});
function game(){
  const g=createEngine();
  g.ui="run";g.time=12;g.trees=[];g.pickups=[];g.falling=[];
  g.player.x=CX;g.player.warmth=30;g.fireLit=true;g.fuel=90;
  return g;
}
const cb=()=>({toast:vi.fn(),end:vi.fn()});
describe("Patch #33 progressive fire warmth",()=>{
  it("warms gently at first, then faster after lingering eight seconds",()=>{
    const g=game(),m=meta(),gains:number[]=[];
    for(let i=0;i<8;i++){
      const before=g.player.warmth;
      update(g,m,1,cb());
      gains.push(g.player.warmth-before);
    }
    expect(HEAT_SOAK_SECONDS).toBe(8);
    expect(HEAT_FADE_SECONDS).toBe(4);
    expect(g.heatSoak).toBe(8);
    expect(gains[0]).toBeGreaterThan(0.8);
    expect(gains[0]).toBeLessThan(3.2);
    expect(gains[7]).toBeGreaterThan(gains[0]+4);
    expect(g.player.warmth).toBeGreaterThan(30);
  });
  it("quick movement inside the warmth radius keeps soaking, walking away fades",()=>{
    let s=0;
    s=advanceHeatSoak(s,4,true);expect(s).toBe(4);
    s=advanceHeatSoak(s,1,true);expect(s).toBe(5);
    s=advanceHeatSoak(s,1,false);expect(s).toBe(3);
    s=advanceHeatSoak(s,3,false);expect(s).toBe(0);
    expect(advanceHeatSoak(8,4,false)).toBe(0);
    expect(advanceHeatSoak(8,1,true)).toBe(8);
    expect(advanceHeatSoak(100,0,true)).toBe(8);
  });
  it("fire out, distance from fire, or cold conditions do not accumulate heat",()=>{
    const g=game(),m=meta();
    g.player.x=CX+140;
    update(g,m,1,cb());
    expect(g.heatSoak).toBe(0);
    g.player.x=CX;g.fireLit=false;g.fuel=0;
    update(g,m,1,cb());
    expect(g.heatSoak).toBe(0);
    g.fireLit=true;g.fuel=90;
    update(g,m,8,cb());
    expect(g.heatSoak).toBe(8);
    g.fireLit=false;g.fuel=0;
    update(g,m,4,cb());
    expect(g.heatSoak).toBe(0);
  });
  it("stage 2 Log Bench and fireplace levels still improve warmth recovery",()=>{
    const g=game();g.heatSoak=8;
    const baseline=fireWarmthRate(g);
    expect(baseline).toBeCloseTo(8.5);
    g.stage=2;expect(fireWarmthRate(g)).toBeGreaterThan(baseline);
    g.campUpgrades.hearth=2;
    expect(fireWarmthRate(g)).toBeGreaterThan(baseline*1.25);
    g.heatSoak=0;expect(fireWarmthRate(g)).toBeLessThan(4.5);
  });
  it("saves warming progress in existing v1 runs and defaults safely on old saves",()=>{
    const g=game();g.heatSoak=4.5;
    const snapshot=captureRunSnapshot(g);
    expect(snapshot.version).toBe(1);
    expect(snapshot.state.heatSoak).toBe(4.5);
    const resumed=createEngine();resumed.resumeData=snapshot.state;
    titleActions(resumed,meta())[0].act();
    expect(resumed.heatSoak).toBe(4.5);
    const old={...snapshot.state};delete old.heatSoak;
    const legacy=createEngine();legacy.resumeData=old;
    titleActions(legacy,meta())[0].act();
    expect(legacy.heatSoak).toBe(0);
    const fresh=createEngine();expect(fresh.heatSoak).toBe(0);
  });
  it("a saved Settings toggle disables optional guidance without changing Ash",()=>{
    const g=createEngine(),m=meta();
    const row=settingsRows(g,m).find((r:any)=>r.label==="GUIDING FIREFLIES");
    expect(row).toBeDefined();
    expect(row!.right).toBe("ON");
    row!.onDown();
    expect(m.guideFx).toBe(false);
    expect(loadMeta().guideFx).toBe(false);
    expect(m.ash).toBe(4);
    const toggle=settingsRows(g,m).find((r:any)=>r.label==="GUIDING FIREFLIES");
    expect(toggle!.right).toBe("OFF");
    toggle!.onDown();
    expect(loadMeta().guideFx).toBe(true);
  });
});
