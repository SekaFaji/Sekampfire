import {describe,it,expect} from "vitest";
import {createEngine,updateAmbient,titleActions} from "./game";
import {HUD_RECTS,drawCampHUD,hudInventoryReadout,hudAshReadout} from "./hud";
import {ambientTemperature,localTemperature,settleThermometer,drawLivingThermometer,THERMOMETER_RECT,formatTemperature} from "./thermometer";
import {CX,DAY_LEN} from "./config";
import {captureRunSnapshot} from "./save";

const meta=()=>({ash:28,totalAsh:28,best:0,runs:0,up:{},guideFx:true,collection:{},museumBuilt:false});
function state(){
 const g=createEngine();g.ui="run";g.weather="clear";g.previousWeather="clear";
 g.weatherBlend=1;g.isNight=false;g.night=0;g.time=20;
 g.player.x=CX+140;g.fireLit=false;g.fuel=0;
 return g;
}
function pixels(){
 const marks:{x:number;y:number;w:number;h:number;color:string}[]=[];
 let color="";
 const ctx:any={
  get fillStyle(){return color;},
  set fillStyle(v:string){color=v;},
  fillRect(x:number,y:number,w:number,h:number){
   expect([x,y,w,h].every(Number.isFinite)).toBe(true);
   expect(w).toBeGreaterThan(0);
   expect(h).toBeGreaterThan(0);
   marks.push({x,y,w,h,color});
  }
 };
 return {ctx,marks};
}
describe("Patch #39: smaller local Celsius & weather instrument",()=>{
 it("retains environmental temperature and adds local fire heat with distance falloff",()=>{
   const g=state();
   const outdoors=ambientTemperature(g);
   expect(localTemperature(g)).toBe(outdoors);
   g.fireLit=true;g.fuel=100;g.player.x=CX;
   const near=localTemperature(g);
   expect(near).toBeGreaterThan(outdoors+9);
   expect(ambientTemperature(g)).toBe(outdoors); // world weather is untouched
   g.player.x=CX+27;
   const midpoint=localTemperature(g);
   expect(midpoint).toBeGreaterThan(outdoors);
   expect(midpoint).toBeLessThan(near);
   g.player.x=CX+56;
   expect(localTemperature(g)).toBe(outdoors);
   g.fireLit=false;g.player.x=CX;
   expect(localTemperature(g)).toBe(outdoors);
 });
 it("gear and Ash do not heat the air, but outdoor season/night/weather still matter",()=>{
   const g=state();
   g.fireLit=true;g.fuel=65;g.player.x=CX;g.cold=90;
   const baseline=localTemperature(g);
   g.crafts.boots=true;g.crafts.pack=true;g.stage=6;g.dampness=99;
   expect(localTemperature(g)).toBe(baseline);
   g.isNight=true;g.time=DAY_LEN+2;
   expect(localTemperature(g)).toBe(baseline-7);
   g.weather="blizzard";
   expect(localTemperature(g)).toBeLessThan(baseline-17);
 });
 it("instrument follows character movement smoothly without abrupt jumps",()=>{
   const g=state();g.thermometerTemp=ambientTemperature(g);
   g.fireLit=true;g.fuel=85;g.player.x=CX;
   const destination=localTemperature(g);
   updateAmbient(g,1);
   expect(g.thermometerTemp).toBeGreaterThan(ambientTemperature(g));
   expect(g.thermometerTemp).toBeLessThan(destination);
   g.player.x=CX+200;
   const warmerReading=g.thermometerTemp;
   updateAmbient(g,1);
   expect(g.thermometerTemp).toBeLessThan(warmerReading);
   expect(settleThermometer(11,11,2)).toBe(11);
 });
 it("old saves still load and display their actual local air when starting with Old Flint",()=>{
   const g=state();g.fireLit=true;g.fuel=70;g.player.x=CX;
   const snap=captureRunSnapshot(g);
   expect(snap.version).toBe(1);
   expect("thermometerTemp" in snap.state).toBe(false);
   const resumed=createEngine();resumed.resumeData=snap.state;
   titleActions(resumed,meta())[0].act();
   expect(resumed.thermometerTemp).toBeCloseTo(localTemperature(resumed));
   const withFlint=meta();(withFlint.up as any).flint=1;
   const fresh=createEngine();titleActions(fresh,withFlint)[0].act();
   expect(fresh.fireLit).toBe(true);
   expect(fresh.thermometerTemp).toBeCloseTo(localTemperature(fresh));
 });
 it("formats positive, zero and negative Celsius values consistently",()=>{
   expect(formatTemperature(8)).toBe("+8");
   expect(formatTemperature(0)).toBe("0");
   expect(formatTemperature(-13)).toBe("-13");
   expect(formatTemperature(32.8)).toBe("+33");
 });
 it("fits detailed brass/glass rendering inside the smaller plaque with weather on same row",()=>{
   expect(THERMOMETER_RECT.w).toBeLessThan(105);
   expect(THERMOMETER_RECT).toEqual({x:108,y:17,w:85,h:23});
   const g=state();
   for(const [temperature,weather] of [[8,"wind"],[-22,"blizzard"],[3,"coldsnap"],[30,"clear"]] as const){
     g.thermometerTemp=temperature;g.weather=weather;g.animT=2.3;
     const {ctx,marks}=pixels();drawLivingThermometer(ctx,g);
     expect(marks.length).toBeGreaterThan(75);
     expect(marks.every(r=>r.x>=108&&r.y>=17&&r.x+r.w<=193&&r.y+r.h<=40)).toBe(true);
     const weatherPixels=marks.filter(r=>r.color==="#c6d8d7");
     expect(weatherPixels.length).toBeGreaterThan(8);
     expect(weatherPixels.every(r=>r.y>=20&&r.y<=24)).toBe(true);
     // No weather label appears below the liquid tube.
     expect(weatherPixels.some(r=>r.y>24)).toBe(false);
     expect(marks.some(r=>r.y===32)).toBe(true);
   }
 });
});
describe("Patch #39: four compact survival HUD plaques",()=>{
 it("has four ordered, non-overlapping native rectangles with no extra scenery covered",()=>{
   const frames=Object.values(HUD_RECTS);
   expect(frames).toHaveLength(4);
   expect(frames.map(f=>[f.x,f.y,f.w,f.h])).toEqual([
     [3,17,103,23],[108,17,85,23],[195,17,38,23],[235,17,83,23]
   ]);
   expect(frames.every(f=>f.y+f.h===40)).toBe(true);
   for(let i=1;i<frames.length;i++)
     expect(frames[i-1].x+frames[i-1].w).toBeLessThan(frames[i].x);
   const g=state(),v=pixels();drawCampHUD(v.ctx,g,meta());
   for(const f of frames)expect(v.marks.some(m=>m.x===f.x&&m.y===f.y&&m.w===f.w&&m.h===f.h)).toBe(true);
   expect(v.marks.every(m=>m.x>=0&&m.x+m.w<=320)).toBe(true);
 });
 it("readout reflects real wood-only carry amount pending item inventory, and actual Run Ash",()=>{
   const g=state(),m=meta();
   expect(hudInventoryReadout(g,m)).toBe("INV 0/5");
   g.player.wood=4;expect(hudInventoryReadout(g,m)).toBe("INV 4/5");
   g.player.wood=99;expect(hudInventoryReadout(g,m)).toBe("INV 5/5");
   (m.up as any).pack=1;g.crafts.pack=true;g.player.wood=19;
   expect(hudInventoryReadout(g,m)).toBe("INV19/21");
   g.ashEarned=18;expect(hudAshReadout(g)).toBe("ASH 18");
   g.ashEarned=1276;expect(hudAshReadout(g)).toBe("ASH 1.3K");
   expect(m.ash).toBe(28); // no banking just because Ash appears on HUD
 });
 it("moves weather into thermometer only; day/calendar panel reflects season and menu footprint",()=>{
   const g=state(),m=meta();g.player.wood=3;g.ashEarned=7;
   g.weather="wind";g.thermometerTemp=9;
   const a=pixels();drawCampHUD(a.ctx,g,m);
   const weatherPixels=a.marks.filter(r=>r.color==="#c6d8d7");
   expect(weatherPixels.length).toBeGreaterThan(8);
   expect(weatherPixels.every(r=>r.x<193)).toBe(true);
   expect(a.marks.some(r=>r.x>=235&&r.x<=281&&r.y===32)).toBe(true);
   const before=a.marks;
   g.player.wood=5;g.ashEarned=11;
   const b=pixels();drawCampHUD(b.ctx,g,m);
   expect(b.marks).not.toEqual(before);
   expect(b.marks.some(r=>r.x>=195&&r.x<233&&r.y>=17)).toBe(true);
 });
});
