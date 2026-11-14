import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngine, update, drawMenu, handleKey, handlePointer, titleActions
} from "./game";
import { DAY_LEN, LONG_NIGHT_LEN } from "./config";
import { advanceCold, coldWarmthDrain, fireSheltered } from "./cold";
import {
  HUT_DOOR_X, HUT_LOG_COST, HUT_WARMTH_DRAIN_FACTOR,
  nearDebrisHut, interactDebrisHut, advanceDebrisHutBuild,
  sleepUntilDawn, drawDebrisHutExterior
} from "./debrisHut";
import { captureRunSnapshot } from "./save";

let storage: Map<string,string>;
beforeEach(() => {
  storage = new Map();
  vi.stubGlobal("localStorage",{
    getItem: (k:string)=>storage.get(k) ?? null,
    setItem: (k:string,v:string)=>storage.set(k,String(v)),
    removeItem: (k:string)=>storage.delete(k),
  });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const meta = () => ({
  ash: 0, totalAsh: 0, best: 0, runs: 0, up: {},
  museumBuilt: false, collection: {}, guideFx: true
});
const callbacks = () => ({ toast: vi.fn(), end: vi.fn() });

function camp() {
  const g = createEngine();
  g.ui="run";g.menu=null;g.over=false;g.keys={};g.pointers={};
  g.fenceLeft=true;g.fenceRight=true;
  g.player.x=HUT_DOOR_X;g.player.warmth=100;g.player.wood=0;
  g.trees=[];g.pickups=[];g.falling=[];g.critters=[];
  g.weather="clear";g.previousWeather="clear";g.weatherBlend=1;
  g.time=10;g.isNight=false;g.night=0;
  return g;
}
function inside() {
  const g=camp();
  g.hutBuilt=true;g.hutLogs=HUT_LOG_COST;g.hutInside=true;g.menu="hut";
  g.time=DAY_LEN+2;g.isNight=true;g.night=2;
  return g;
}
function canvas(){
  const rects:any[]=[];
  let fill="";
  const ctx:any={
    get fillStyle(){return fill;},
    set fillStyle(v:string){fill=v;},
    fillRect(x:number,y:number,w:number,h:number){
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      rects.push({x,y,w,h,fill});
    }
  };
  return {ctx,rects};
}

describe("Patch #71 - physical Debris Hut and survival-safe sleep",()=>{
  it("unlocks its site only after both fence posts and does not hijack the fire or storage reach",()=>{
    const g=camp(),art=canvas();
    g.fenceRight=false;
    expect(nearDebrisHut(g)).toBe(false);
    drawDebrisHutExterior(art.ctx,g);
    expect(art.rects).toHaveLength(0);
    g.fenceRight=true;
    expect(nearDebrisHut(g)).toBe(true);
    drawDebrisHutExterior(art.ctx,g);
    expect(art.rects.length).toBeGreaterThan(0);
    g.player.x=HUT_DOOR_X+10;
    expect(nearDebrisHut(g)).toBe(false);
    g.player.x=HUT_DOOR_X-10;
    expect(nearDebrisHut(g)).toBe(false);
  });
  it("takes exactly 25 REAL carried logs in installments and completes after the build timer",()=>{
    const g=camp();
    g.player.wood=9;
    expect(interactDebrisHut(g)).toContain("9/25");
    expect(g.player.wood).toBe(0);
    expect(g.hutLogs).toBe(9);
    expect(g.hutBuilt).toBe(false);
    g.player.wood=16;
    expect(interactDebrisHut(g)).toContain("25/25");
    expect(g.hutLogs).toBe(25);
    expect(g.player.wood).toBe(0);
    expect(interactDebrisHut(g)).toContain("RAISING");
    expect(g.hutBuildT).toBe(0);
    expect(advanceDebrisHutBuild(g,6.5)).toBe(false);
    expect(g.hutBuilt).toBe(false);
    expect(advanceDebrisHutBuild(g,0.5)).toBe(true);
    expect(g.hutBuilt).toBe(true);
    expect(g.hutBuildT).toBe(-1);
    expect(advanceDebrisHutBuild(g,50)).toBe(false);
    expect(g.hutLogs).toBe(25);
    expect(interactDebrisHut(g)).toContain("ENTERED");
    expect(g.hutInside).toBe(true);
    expect(g.menu).toBe("hut");
    expect(g.player.wood).toBe(0);
  });
  it("provides rain shelter and 65% less ordinary Warmth loss, never a free fire soak",()=>{
    const g=inside(),m=meta();
    g.fireLit=false;g.fuel=0;g.weather="rain";g.dampness=45;g.cold=52;
    const sheltered=coldWarmthDrain(g,m);
    expect(HUT_WARMTH_DRAIN_FACTOR).toBe(0.35);
    g.hutInside=false;
    const outside=coldWarmthDrain(g,m);
    expect(sheltered).toBeCloseTo(outside*0.35);
    expect(sheltered).toBeGreaterThan(0);
    g.hutInside=true;
    advanceCold(g,1,m);
    expect(g.dampness).toBeLessThan(45);
    g.fireLit=true;g.fuel=100;
    expect(fireSheltered(g)).toBe(false); // roof blocks direct heat-soak
    g.heatSoak=0;
    const old=g.player.warmth;
    update(g,m,1,callbacks());
    expect(g.heatSoak).toBe(0);
    expect(g.player.warmth).toBeLessThan(old);
  });
  it("can sleep to real dawn with the normal Ash and torch-expiry rules, consuming fuel",()=>{
    const g=inside(),m=meta(),cb=callbacks();
    g.time=DAY_LEN+1;g.night=1;g.player.warmth=100;
    g.fireLit=true;g.fuel=10;g.fenceTorches.left=1;
    expect(sleepUntilDawn(g, dt => update(g,m,dt,cb))).toBe("dawn");
    expect(g.isNight).toBe(false);
    expect(g.time).toBe(0);
    expect(g.hutInside).toBe(true);
    expect(g.menu).toBe("hut");
    expect(g.ashLedger.dawn).toBe(4);
    expect(g.ashEarned).toBe(4);
    expect(g.fenceTorches.left).toBe(0);
    expect(g.fireLit).toBe(false);
    expect(g.player.warmth).toBeGreaterThan(0);
    expect(cb.end).not.toHaveBeenCalled();
    expect(sleepUntilDawn(g,dt=>update(g,m,dt,cb))).toBe("unavailable");
    expect(g.ashEarned).toBe(4); // no duplicate dawn
  });
  it("fails sleep correctly in a blizzard, banking no fake sunrise",()=>{
    const g=inside(),m=meta(),cb=callbacks();
    g.night=8;g.weather="blizzard";g.previousWeather="blizzard";g.cold=90;
    g.player.warmth=0.05;g.fireLit=false;g.fuel=0;
    expect(sleepUntilDawn(g,dt=>update(g,m,dt,cb))).toBe("dead");
    expect(g.over).toBe(true);
    expect(g.hutInside).toBe(false);
    expect(g.menu).toBeNull();
    expect(g.ashEarned).toBe(0);
    expect(g.isNight).toBe(true);
    expect(cb.end).toHaveBeenCalledTimes(1);
    expect(cb.end).toHaveBeenCalledWith("dead",expect.objectContaining({nights:8}));
  });
  it("preserves the Long Night victory transition instead of inventing a skip reward",()=>{
    const g=inside(),m=meta(),cb=callbacks();
    g.night=5;g.time=DAY_LEN+LONG_NIGHT_LEN-0.5;
    g.longNightActive=true;g.player.warmth=100;
    expect(sleepUntilDawn(g,dt=>update(g,m,dt,cb))).toBe("interrupted");
    expect(g.ui).toBe("win");
    expect(g.victoryPending).toBe(true);
    expect(g.ashLedger.longNight).toBe(100);
    expect(g.hutInside).toBe(false);
    expect(g.menu).toBeNull();
    expect(g.isNight).toBe(false);
    expect(cb.end).not.toHaveBeenCalled(); // explicit End Run banks later
  });
  it("has actual keyboard and touch Exit, and no daytime fast-forward",()=>{
    const g=inside(),m=meta(),v=canvas();
    g.isNight=false;g.time=10;g.zones=[];
    drawMenu(v.ctx,g,m);
    expect(g.zones.filter((z:any)=>z.y===146)).toHaveLength(2);
    expect(g.menu).toBe("hut");
    handleKey(g,m,"enter",true); // daytime sleep is disabled
    expect(g.hutInside).toBe(true);
    expect(g.time).toBe(10);
    handleKey(g,m,"arrowdown",true);
    expect(g.menuSel).toBe(1);
    handleKey(g,m,"enter",true);
    expect(g.menu).toBeNull();
    expect(g.hutInside).toBe(false);
    g.menu="hut";g.hutInside=true;g.zones=[];
    drawMenu(v.ctx,g,m);
    handlePointer(g,"down",3,225,152);
    expect(g.menu).toBeNull();
    expect(g.hutInside).toBe(false);
    g.menu="hut";g.hutInside=true;
    handleKey(g,m,"escape",true);
    expect(g.menu).toBeNull();
    expect(g.hutInside).toBe(false);
  });
  it("uses optional v1 save fields so built/interior and old unfinished runs remain safe",()=>{
    const g=inside(),m=meta();
    const snap=captureRunSnapshot(g);
    expect(snap.version).toBe(1);
    expect(snap.state.hutBuilt).toBe(true);
    expect(snap.state.hutInside).toBe(true);
    expect(snap.state.hutLogs).toBe(25);
    const restored=createEngine();restored.resumeData=snap.state;
    titleActions(restored,m)[0].act();
    expect(restored.hutBuilt).toBe(true);
    expect(restored.hutInside).toBe(true);
    expect(restored.menu).toBe("hut");
    const old={...snap.state};
    delete old.hutBuilt;delete old.hutInside;delete old.hutLogs;delete old.hutBuildT;
    const legacy=createEngine();legacy.resumeData=old;
    titleActions(legacy,m)[0].act();
    expect(legacy.hutBuilt).toBe(false);
    expect(legacy.hutInside).toBe(false);
    expect(legacy.menu).toBeNull();
    expect(legacy.ui).toBe("run");
    expect(m.ash).toBe(0);
    const site=camp();site.hutLogs=17;site.hutBuildT=2.5;
    const siteSnap=captureRunSnapshot(site);
    const resumed=createEngine();resumed.resumeData=siteSnap.state;
    titleActions(resumed,m)[0].act();
    expect(resumed.hutLogs).toBe(17);
    expect(resumed.hutBuildT).toBe(2.5);
    expect(resumed.hutBuilt).toBe(false);
  });
});
