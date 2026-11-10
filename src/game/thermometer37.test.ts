import { describe, expect, it } from "vitest";
import { DAY_LEN } from "./config";
import { createEngine, updateAmbient, titleActions, pauseRows } from "./game";
import { drawCampHUD } from "./hud";
import { captureRunSnapshot } from "./save";
import {
  ambientTemperature, settleThermometer, thermometerLiquidColor,
  drawLivingThermometer, THERMOMETER_RECT, AIR_TEMP_MIN, AIR_TEMP_MAX,
} from "./thermometer";

const meta = () => ({ ash:22, up:{}, collection:{}, museumBuilt:false, guideFx:true });
const world = () => {
  const g=createEngine();
  g.ui="run";g.weather="clear";g.previousWeather="clear";
  g.weatherBlend=1;g.time=20;g.isNight=false;g.night=0;
  return g;
};
function pixels(){
  let color="";const marks: {x:number;y:number;w:number;h:number;color:string}[]=[];
  const ctx:any={
    get fillStyle(){return color;},
    set fillStyle(c:string){color=c;},
    fillRect(x:number,y:number,w:number,h:number){
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
      marks.push({x,y,w,h,color});
    }
  };
  return {ctx,marks};
}

describe("Patch #37: living outside thermometer",()=>{
  it("uses environment, not the player's Cold reserve, boots, fire or upgrades",()=>{
    const g=world();
    const outside=ambientTemperature(g);
    expect(outside).toBe(11);
    g.cold=92;g.dampness=90;g.crafts.boots=true;
    g.fireLit=true;g.fuel=95;g.stage=6;g.player.x=800;
    expect(ambientTemperature(g)).toBe(outside);
    g.isNight=true;g.time=DAY_LEN+2;
    expect(ambientTemperature(g)).toBe(4);
  });

  it("has distinct seasonal baselines, both in day and night",()=>{
    const g=world();
    for(const [night,temp] of [[0,11],[7,-5],[14,14],[21,25]] as const){
      g.night=night;g.isNight=false;g.time=20;
      expect(ambientTemperature(g)).toBe(temp);
      g.isNight=true;g.night=night+1;g.time=DAY_LEN+2;
      expect(ambientTemperature(g)).toBe(temp-7);
    }
  });

  it("responds to real blended weather, including cold snaps and blizzards",()=>{
    const g=world();
    const base=ambientTemperature(g);
    g.weather="rain";g.previousWeather="clear";g.weatherBlend=.5;
    expect(ambientTemperature(g)).toBe(base-2);
    g.weatherBlend=1;expect(ambientTemperature(g)).toBe(base-4);
    g.weather="wind";expect(ambientTemperature(g)).toBe(base-2);
    g.weather="coldsnap";expect(ambientTemperature(g)).toBe(base-10);
    g.weather="blizzard";expect(ambientTemperature(g)).toBe(base-14);
    g.weather="fog";expect(ambientTemperature(g)).toBe(base-1);
    expect(ambientTemperature(g)).toBeGreaterThanOrEqual(AIR_TEMP_MIN);
    expect(ambientTemperature(g)).toBeLessThanOrEqual(AIR_TEMP_MAX);
  });

  it("settles gently, consistently across frame rates and never oscillates on its own",()=>{
    const start=11,target=-16;
    const once=settleThermometer(start,target,6);
    let steps=start;
    for(let i=0;i<60;i++)steps=settleThermometer(steps,target,.1);
    expect(once).toBeCloseTo(steps,6);
    expect(once).toBeGreaterThan(target);
    expect(once).toBeLessThan(start);
    expect(settleThermometer(target,target,20)).toBe(target);
    expect(settleThermometer(start,target,0)).toBe(start);
    expect(settleThermometer(1000,-1000,1000)).toBe(AIR_TEMP_MIN);
  });

  it("is animated during live ambient updates and safely initializes on resumed v1 saves",()=>{
    const g=world();g.thermometerTemp=11;g.weather="coldsnap";
    updateAmbient(g,1);
    expect(g.thermometerTemp).toBeLessThan(11);
    expect(g.thermometerTemp).toBeGreaterThan(ambientTemperature(g));
    const snapshot=captureRunSnapshot(g);
    expect(snapshot.version).toBe(1);
    expect("thermometerTemp" in snapshot.state).toBe(false);
    const restored=createEngine();restored.resumeData=snapshot.state;
    titleActions(restored,meta())[0].act();
    expect(restored.thermometerTemp).toBeCloseTo(ambientTemperature(restored));
  });

  it("renders a brass, glass, bulb, tick marks, frost and colored liquid strictly inside its plaque",()=>{
    for(const v of [-25,0,11,28,35]){
      const g=world();g.thermometerTemp=v;g.animT=3.5;
      const {ctx,marks}=pixels();
      drawLivingThermometer(ctx,g);
      expect(marks.length).toBeGreaterThan(65);
      expect(marks.every(r=>r.x>=THERMOMETER_RECT.x&&r.y>=THERMOMETER_RECT.y&&
        r.x+r.w<=THERMOMETER_RECT.x+THERMOMETER_RECT.w&&
        r.y+r.h<=THERMOMETER_RECT.y+THERMOMETER_RECT.h)).toBe(true);
      expect(marks.some(r=>r.color===thermometerLiquidColor(v)&&r.y===32)).toBe(true);
      expect(marks.some(r=>r.color==="#d4ad70"&&r.y===29)).toBe(true);
      if(v<=0)expect(marks.some(r=>r.color==="#a7d6e2")).toBe(true);
      if(v>=20)expect(marks.some(r=>r.color.startsWith("rgba(248,186,96,"))).toBe(true);
    }
  });

  it("subtle glint moves, and liquid grows only when world temperature rises",()=>{
    const g=world(),a=pixels(),b=pixels(),c=pixels();
    g.thermometerTemp=-20;g.animT=0;drawLivingThermometer(a.ctx,g);
    const first=a.marks.find(r=>r.color==="rgba(229,248,250,0.46)");
    g.animT=3;drawLivingThermometer(b.ctx,g);
    const moved=b.marks.find(r=>r.color==="rgba(229,248,250,0.46)");
    expect(first).toBeDefined();expect(moved).toBeDefined();
    expect(first!.x).not.toBe(moved!.x);
    g.thermometerTemp=23;drawLivingThermometer(c.ctx,g);
    const low=a.marks.find(r=>r.color===thermometerLiquidColor(-20)&&r.y===32&&r.h===2);
    const high=c.marks.find(r=>r.color===thermometerLiquidColor(23)&&r.y===32&&r.h===2);
    expect(high!.w).toBeGreaterThan(low!.w);
  });

  it("keeps personal Cold invisible but displays real carried wood and Run Ash in the third panel",()=>{
    const g=world(),m=meta();
    g.player.warmth=74;g.fuel=49;g.fireLit=true;
    g.thermometerTemp=11;g.ashEarned=6;g.player.wood=5;g.cold=80;
    const a=pixels();drawCampHUD(a.ctx,g,m);
    g.player.wood=0;g.ashEarned=99;g.cold=12;
    const b=pixels();drawCampHUD(b.ctx,g,m);
    expect(a.marks).not.toEqual(b.marks); // inventory and Ash now have their own plaque
    expect(a.marks.some(r=>r.x===108&&r.y===17&&r.w===85&&r.h===23)).toBe(true);
    expect(a.marks.some(r=>r.x===195&&r.y===17&&r.w===38&&r.h===23)).toBe(true);
    const left=a.marks.filter(r=>r.x>=3&&r.x+r.w<=112&&r.y>=17&&r.y<40);
    expect(left.some(r=>r.y===22&&r.color==="#bc554a")).toBe(true);
    expect(left.some(r=>r.y===33&&r.color==="#c77732")).toBe(true);
    expect(left.some(r=>r.color==="#9ccfe3")).toBe(false);
    expect(g.cold).toBe(12); // still runs independently from player-local air temperature
    expect(pauseRows(g,m).some((r:any)=>r.label==="END RUN"&&r.right==="+99 ASH")).toBe(true);
  });
});
