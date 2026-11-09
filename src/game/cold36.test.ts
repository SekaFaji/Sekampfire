import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { createEngine, update, titleActions } from "./game";
import { captureRunSnapshot, loadRunSnapshot } from "./save";
import { drawCampHUD } from "./hud";
import { CX, DAY_LEN } from "./config";
import {
  COLD_RESPONSE_SECONDS, advanceCold, coldTarget, coldWarmthDrain,
  shelteredFromRain, fireSheltered
} from "./cold";

const meta=()=>({ash:5,totalAsh:5,up:{},best:0,runs:0,collection:{},museumBuilt:false,guideFx:true});
let storage:Map<string,string>;
beforeEach(()=>{
  storage=new Map();
  vi.stubGlobal("localStorage",{
    getItem:(k:string)=>storage.get(k)??null,
    setItem:(k:string,v:string)=>storage.set(k,String(v)),
    removeItem:(k:string)=>storage.delete(k)
  });
});
afterEach(()=>{
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function runner(){
  const g=createEngine();
  g.ui="run";g.trees=[];g.pickups=[];g.falling=[];
  g.player.x=CX+125;g.player.warmth=80;
  g.weatherBlend=1;g.previousWeather="clear";
  g.weather="clear";g.fireLit=false;g.fuel=0;g.dampness=0;
  return g;
}
function drawCanvas(){
  const rects:any[]=[];let color="";
  const ctx:any={
    get fillStyle(){return color;},
    set fillStyle(v:string){color=v;},
    fillRect(x:number,y:number,w:number,h:number) {
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
      rects.push({x,y,w,h,color});
    }
  };
  return {ctx,rects};
}
describe("Patch #36 - environmental Cold exposure",()=>{
  it("gives a real 0-100 Cold pressure distinct from the survival Warmth reserve",()=>{
    const g=runner();g.time=14;g.isNight=false;g.night=0;
    expect(coldTarget(g)).toBe(14);
    g.isNight=true;g.night=1;
    expect(coldTarget(g)).toBe(38);
    g.weather="wind";expect(coldTarget(g)).toBe(47);
    g.weather="fog";expect(coldTarget(g)).toBe(42);
    g.weather="rain";expect(coldTarget(g)).toBe(54);
    g.weather="coldsnap";expect(coldTarget(g)).toBe(60);
    g.weather="blizzard";expect(coldTarget(g)).toBe(81);
    g.weather="clear";g.night=8;
    expect(coldTarget(g)).toBe(48); // winter climate bonus
    expect(g.player.warmth).toBe(80); // measuring exposure does not inflict damage
  });
  it("rain gets progressively damp; shelter and fire dry rather than magically deleting existing wetness",()=>{
    const g=runner();g.weather="rain";
    g.isNight=true;g.night=2;
    advanceCold(g,10);
    expect(g.dampness).toBe(50);
    expect(g.cold).toBeGreaterThan(14);
    expect(g.cold).toBeLessThanOrEqual(100);
    g.player.x=CX;g.stage=3;
    expect(shelteredFromRain(g)).toBe(true);
    advanceCold(g,10);
    expect(g.dampness).toBeLessThan(50);
    g.stage=0;g.fireLit=true;g.fuel=75;
    expect(fireSheltered(g)).toBe(true);
    const wet=g.dampness;
    advanceCold(g,2);
    expect(g.dampness).toBeLessThan(wet);
    // Don't add a second rain/wetness bar, this is part of Cold only.
    expect(Number.isFinite(g.cold)).toBe(true);
  });
  it("crafted Warm Boots are insulation without being free shelter or changing stored ownership",()=>{
    const g=runner();g.isNight=true;g.night=2;g.weather="rain";g.dampness=40;
    const without=coldTarget(g);
    g.crafts.boots=true;
    expect(coldTarget(g)).toBe(without-12);
    expect(shelteredFromRain(g)).toBe(false);
    const startingCold=g.cold;
    advanceCold(g,COLD_RESPONSE_SECONDS);
    expect(g.cold).toBeGreaterThan(startingCold);
    expect(g.crafts.boots).toBe(true);
  });
  it("cold is the sole ambient weather penalty, retaining torch/ash/cabin defenses",()=>{
    const g=runner(),m=meta();
    g.isNight=true;g.cold=20;
    const low=coldWarmthDrain(g,m);
    g.cold=80;
    const high=coldWarmthDrain(g,m);
    expect(high).toBeGreaterThan(low*2);
    g.weather="coldsnap"; // weather cannot be counted again by this pure function
    expect(coldWarmthDrain(g,m)).toBe(high);
    g.weather="blizzard";
    expect(coldWarmthDrain(g,m)).toBe(high);
    (m.up as any).blood=2;
    expect(coldWarmthDrain(g,m)).toBeCloseTo(high*0.7);
    g.player.torchT=10;
    expect(coldWarmthDrain(g,m)).toBeCloseTo(high*0.7*0.5);
    g.player.torchT=0;g.stage=6;g.player.x=CX;
    expect(coldWarmthDrain(g,m)).toBeLessThan(high*0.5);
  });
  it("storm and dampness change real warmth loss with equal duration and original fire recovery",()=>{
    const clear=runner(),storm=runner();
    const m=meta(),events={toast:vi.fn(),end:vi.fn()};
    for(const g of [clear,storm]){
      g.isNight=true;g.night=2;g.time=DAY_LEN+3;
      g.cold=38;g.player.warmth=70;
    }
    storm.weather="rain";storm.dampness=75;
    update(clear,m,2,events);
    update(storm,m,2,events);
    expect(storm.cold).toBeGreaterThan(clear.cold);
    expect(storm.player.warmth).toBeLessThan(clear.player.warmth);
    expect(storm.player.warmth).toBeGreaterThan(0);
    // Existing eight-second heat-soak remains active near the same fire.
    storm.player.x=CX;storm.fireLit=true;storm.fuel=80;storm.heatSoak=0;
    const old=storm.heatSoak;
    update(storm,m,1,events);
    expect(storm.heatSoak).toBeGreaterThan(old);
    expect(storm.heatSoak).toBeLessThanOrEqual(8);
  });
  it("first night never randomly starts with rain, cold snap or blizzard",()=>{
    const g=runner(),m=meta();
    g.isNight=false;g.time=DAY_LEN-0.02;g.night=0;
    vi.spyOn(Math,"random").mockReturnValue(0.99);
    update(g,m,0.04,{toast:vi.fn(),end:vi.fn()});
    expect(g.night).toBe(1);
    expect(["clear","wind"]).toContain(g.weather);
    expect(g.weather).toBe("wind");
  });
  it("keeps both Cold and rain dampness through v1 save/resume, deriving safe values for old checkpoints",()=>{
    const g=runner(),m=meta();
    g.isNight=true;g.time=DAY_LEN+4;g.night=2;
    g.cold=63;g.dampness=41;g.weather="rain";g.crafts.boots=true;
    const snap=captureRunSnapshot(g);
    expect(snap.version).toBe(1);
    expect(snap.state.cold).toBe(63);
    expect(snap.state.dampness).toBe(41);
    const restore=createEngine();restore.resumeData=snap.state;
    titleActions(restore,m)[0].act();
    expect(restore.cold).toBe(63);
    expect(restore.dampness).toBe(41);
    expect(restore.crafts.boots).toBe(true);
    const old={...snap.state};delete old.cold;delete old.dampness;
    const legacy=createEngine();legacy.resumeData=old;
    titleActions(legacy,m)[0].act();
    expect(legacy.dampness).toBe(0);
    expect(legacy.cold).toBeCloseTo(coldTarget(legacy));
    expect(legacy.ui).toBe("run");
    // v1 legacy keys and Banked Ash remain untouched
    expect(m.ash).toBe(5);
    expect(loadRunSnapshot()).toBeNull(); // titleActions uses in-memory resumeData, no automatic banking
  });
  it("draws all three readings inside the original 109x23 translucent HUD panel",()=>{
    const g=runner(),m=meta();g.cold=80;g.ui="run";
    const {ctx,rects}=drawCanvas();
    drawCampHUD(ctx,g,m);
    expect(rects).toContainEqual(expect.objectContaining({x:3,y:17,w:109,h:23}));
    const left=rects.filter(r=>r.x>=3&&r.x+r.w<=112&&r.y>=17&&r.y<40);
    expect(left.every(r=>r.y+r.h<=40)).toBe(true);
    expect(left.some(r=>r.y===34&&r.color==="#9ccfe3")).toBe(true);
    expect(rects.some(r=>r.color==="#c3dcef")).toBe(true);
  });
});
