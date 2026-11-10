import {describe,it,expect} from "vitest";
import {createEngine,drawMenu} from "./game";
import {guideProgress, GUIDE_LEVELS} from "./guide";
import {guideTarget,guideMenuPosition,drawWorldFireflies,drawOffscreenGuide,drawScreenFireflies} from "./guidance";
import {WEST_POST_X,EAST_POST_X,EXPANSION_MARKER_X} from "./campBoundary";
import {CX,BENCH_X,PILE_X} from "./config";
function g(){
 const g=createEngine();g.ui="run";g.time=12;g.player.x=CX;
 g.trees=[{x:600,y:149,id:1},{x:1250,y:151,id:2}];g.pickups=[];
 return g;
}
const meta=()=>({ash:0,up:{},guideFx:true,museumBuilt:false,collection:{}});
function canvas(){
 const shapes:any[]=[];let fill="";
 const ctx:any={
  set fillStyle(c:string){fill=c;},
  get fillStyle(){return fill;},
  fillRect(x:number,y:number,w:number,h:number){
   expect([x,y,w,h].every(Number.isFinite)).toBe(true);
   expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
   shapes.push({x,y,w,h,fill});
  }
 };
 return {ctx,shapes};
}
describe("Patch #33 Grooty firefly wayfinding",()=>{
 it("has a stable unique ID for every objective and only one active goal",()=>{
   const ids=GUIDE_LEVELS.flatMap(level=>level.goals.map(o=>o.id));
   expect(new Set(ids).size).toBe(ids.length);
   const state=g();
   expect(guideProgress(state).next?.id).toBe("chop");
   expect(guideTarget(state,meta())?.x).toBe(600);
   state.pickups=[{x:801,y:151,w:3}];
   // Chop ONE TREE, not collect a log: fireflies stay with a standing tree.
   expect(guideTarget(state,meta())?.x).toBe(600);
 });
 it("switches from resource gathering to each real post as wood arrives",()=>{
   const state=g();state.guideChops=1;
   expect(guideTarget(state,meta())?.x).toBe(600);
   state.player.wood=2;
   expect(guideTarget(state,meta())?.x).toBe(WEST_POST_X);
   state.fenceLeft=true;
   expect(guideTarget(state,meta())?.x).toBe(EAST_POST_X);
   state.fenceRight=true;
   expect(guideTarget(state,meta())?.x).toBe(CX); // light fire
   state.everLit=true;state.guideStokes=0;
   expect(guideProgress(state).next?.id).toBe("feed-fire");
   state.guideStokes=1;state.night=1;state.isNight=false;
   expect(guideProgress(state).next).toBeNull();
 });
 it("Level 2 teaches storage before expansion and points to the current site",()=>{
   const state=g();state.guideLevel=1;state.player.wood=4;
   expect(GUIDE_LEVELS[1].goals.map(o=>o.id)).toEqual([
     "build-storage","store-ten","expand","upgrade-storage"
   ]);
   expect(guideTarget(state,meta())?.x).toBe(PILE_X);
   state.builtPile=true;
   expect(guideTarget(state,meta())?.x).toBe(PILE_X); // store
   state.guideStoredTen=true;state.stored=5;
   expect(guideTarget(state,meta())?.x).toBe(EXPANSION_MARKER_X);
 });
 it("guides to actual Log Storage and its physical Upgrade popup button",()=>{
   const state=g(),m=meta();
   state.guideLevel=1;state.builtPile=true;state.guideStoredTen=true;
   state.fenceLeft=true;state.fenceRight=true;state.campExpansion=1;
   state.player.wood=15;state.stored=15;
   let target=guideTarget(state,m);
   expect(target).toMatchObject({space:"world",x:PILE_X});
   state.player.x=PILE_X;state.menu="station";state.stationId="pile";
   state.zones=[];drawMenu(canvas().ctx,state,m);
   target=guideTarget(state,m);
   expect(target).toMatchObject({space:"menu",menu:"station",row:1});
   const row=guideMenuPosition(state,target!);
   expect(row).toEqual({x:207,y:113});
   const fx=canvas(),zones=state.zones.length;
   drawScreenFireflies(fx.ctx,state,target);
   expect(fx.shapes.length).toBeGreaterThan(8);
   expect(state.zones).toHaveLength(zones); // no new buttons
 });
 it("guides to the real workbench, then to Tools tab and Timber Pack row",()=>{
   const state=g(),m=meta();state.guideLevel=2;state.builtBench=true;
   state.player.wood=7;
   expect(guideTarget(state,m)).toMatchObject({space:"world",x:BENCH_X});
   state.menu="bench";state.craftTab=1;state.menuRect={x:24,y:20,w:272,h:118};
   let marker=guideTarget(state,m);
   expect(marker).toMatchObject({space:"menu",tab:0,row:0});
   const tab=guideMenuPosition(state,marker!);
   expect(tab?.x).toBe(93);
   state.craftTab=0;
   marker=guideTarget(state,m);
   expect(guideMenuPosition(state,marker!)?.y).toBe(20+34-5);
 });
 it("minimap and world effects stay decorative, bounded, and hide after tutorial",()=>{
   const state=g(),m=meta();
   const near={space:"world" as const,x:600,y:106,goal:"chop"};
   let fx=canvas();
   drawWorldFireflies(fx.ctx,state,near,480);
   expect(fx.shapes.length).toBeGreaterThan(10);
   expect(fx.shapes.every(s=>Number.isFinite(s.x)&&Number.isFinite(s.y))).toBe(true);
   const before=state.zones.length;
   fx=canvas();drawOffscreenGuide(fx.ctx,state,near,900);
   expect(fx.shapes.some(s=>s.y===4&&s.w===3)).toBe(true);
   expect(state.zones.length).toBe(before);
   fx=canvas();drawOffscreenGuide(fx.ctx,state,near,480);
   expect(fx.shapes).toHaveLength(0);
   state.guideLevel=5;
   expect(guideTarget(state,m)).toBeNull();
   state.guideLevel=0;m.guideFx=false;
   expect(guideTarget(state,m)).toBeNull();
 });
 it("does not overlay other menus, the main menu, or a completed run",()=>{
   const state=g(),m=meta();state.guideChops=1;state.player.wood=1;
   state.menu="settings";expect(guideTarget(state,m)).toBeNull();
   state.menu="guide";expect(guideTarget(state,m)).toBeNull();
   state.menu=null;state.ui="title";expect(guideTarget(state,m)).toBeNull();
   state.ui="win";expect(guideTarget(state,m)).toBeNull();
 });
});
