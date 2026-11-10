import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import {
 WEST_POST_X, EAST_POST_X, EAST_EXPANDED_X, EXPANSION_MARKER_X,
 EXPANSION_COST, campEstablished, campClaimBounds, isCampTreeExcluded,
 placeFencePost, expandCamp, drawCampFence, drawCampGround
} from "./campBoundary";
import { createEngine, update, buildRows, titleActions } from "./game";
import { MUSEUM_X, MUSEUM_COST } from "./museum";
import { captureRunSnapshot } from "./save";
import { GUIDE_LEVELS, guideProgress } from "./guide";
import { CX } from "./config";

let storage: Map<string,string>;
beforeEach(()=>{
 storage=new Map();
 vi.stubGlobal("localStorage",{
  getItem:(key:string)=>storage.get(key)??null,
  setItem:(key:string,val:string)=>storage.set(key,String(val)),
  removeItem:(key:string)=>storage.delete(key)
 });
});
afterEach(()=>vi.unstubAllGlobals());
const meta=()=>({ash:20,up:{},museumBuilt:false,collection:{ordinary:false,twisted:false,hand:false,eight:false}});
function camp(){
 const g=createEngine();g.ui="run";g.time=12;g.trees=[];g.pickups=[];
 g.falling=[];g.player.wood=5;
 return g;
}
const callbacks=()=>({toast:vi.fn(),end:vi.fn()});
function canvas(){
 const marks:any[]=[];let color="";
 return {
  marks, ctx: {
   set fillStyle(c:string){color=c;},
   get fillStyle(){return color;},
   fillRect(x:number,y:number,w:number,h:number){
    expect([x,y,w,h].every(Number.isFinite)).toBe(true);
    expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
    marks.push({x,y,w,h,color});
   }
  } as any
 };
}
describe("Patch #31 establish a real camp",()=>{
 it("posts use actual carried logs, one per physical boundary and cannot be paid twice",()=>{
  const g=camp();expect(campEstablished(g)).toBe(false);
  expect(placeFencePost(g,"left")).toContain("LEFT POST BUILT");
  expect(g.player.wood).toBe(4);
  expect(placeFencePost(g,"left")).toContain("ALREADY");
  expect(g.player.wood).toBe(4);
  expect(placeFencePost(g,"right")).toContain("CAMP ESTABLISHED");
  expect(g.player.wood).toBe(3);
  expect(campEstablished(g)).toBe(true);
  expect(campClaimBounds(g)).toEqual({west:WEST_POST_X,east:EAST_POST_X});
 });
 it("physical ACT interactions build posts without interfering with fire or Grooty",()=>{
  const g=camp(),cb=callbacks(),m=meta();g.player.wood=2;
  g.player.x=WEST_POST_X;g.pressE=true;update(g,m,0.02,cb);
  expect(g.fenceLeft).toBe(true);expect(g.player.wood).toBe(1);
  expect(g.fenceRight).toBe(false);
  g.player.x=EAST_POST_X;g.pressE=true;update(g,m,0.02,cb);
  expect(campEstablished(g)).toBe(true);expect(g.player.wood).toBe(0);
  expect(cb.toast).toHaveBeenCalledWith(expect.stringContaining("CAMP ESTABLISHED"));
 });
 it("requires a completed fence before structures or stations can be built",()=>{
  const g=camp(),m=meta();g.player.wood=80;
  expect(buildRows(g,m)[0].right).toBe("BUILD FENCE");
  expect(buildRows(g,m)[0].enabled).toBe(false);
  g.buildTab=1;
  expect(buildRows(g,m)[0].right).toBe("BUILD FENCE");
  g.buildTab=0;
  g.fenceLeft=true;g.fenceRight=true;
  expect(buildRows(g,m)[0].right).toBe("8 WOOD");
  expect(buildRows(g,m)[0].enabled).toBe(true);
 });
 it("expansion claims new eastern land for exactly 5 real logs",()=>{
  const g=camp();
  expect(expandCamp(g)).toContain("ESTABLISH");
  g.fenceLeft=true;g.fenceRight=true;g.player.wood=1;g.stored=3;
  expect(expandCamp(g)).toContain("FIVE LOGS");
  expect(g.player.wood+g.stored).toBe(4);
  g.stored=4;
  expect(expandCamp(g)).toContain("EASTERN CAMP EXPANDED");
  expect(g.player.wood).toBe(0);expect(g.stored).toBe(0);
  expect(g.campExpansion).toBe(1);
  expect(campClaimBounds(g).east).toBe(EAST_EXPANDED_X);
  expect(expandCamp(g)).toContain("ALREADY");
  expect(g.stored).toBe(0);
  expect(EXPANSION_COST).toBe(5);
 });
 it("makes room for the later Museum but preserves existing ownership",()=>{
  const g=camp(),m=meta();g.player.wood=30;
  expect(buildRows(g,m).at(-1)!.right).toBe("EXPAND CAMP");
  g.fenceLeft=true;g.fenceRight=true;
  expect(buildRows(g,m).at(-1)!.enabled).toBe(false);
  expect(buildRows(g,m).some((r:any)=>r.label==="EASTERN CAMP EXPANSION")).toBe(true);
  g.campExpansion=1;
  expect(MUSEUM_X).toBeGreaterThan(EAST_POST_X);
  expect(MUSEUM_X).toBeLessThan(EAST_EXPANDED_X);
  const row=buildRows(g,m).at(-1)!;
  expect(row.right).toBe(MUSEUM_COST+" WOOD");
  row.onDown();buildRows(g,m).at(-1)!.onDown();
  expect(m.museumBuilt).toBe(true);
  g.campExpansion=0;
  expect(buildRows(g,m).at(-1)!.label).toBe("VISIT LOG MUSEUM");
 });
 it("protects center and expanded land from respawning trees and converts occupied sites to wood",()=>{
  const g=camp();g.fenceLeft=true;g.fenceRight=true;
  expect(isCampTreeExcluded(g,CX)).toBe(true);
  expect(isCampTreeExcluded(g,CX+160)).toBe(false);
  g.trees=[{x:CX+139,y:151,id:3,tier:2},{x:CX+214,y:149,id:4,tier:0}];
  g.player.wood=5;g.stored=0;
  expect(expandCamp(g)).toContain("1 TREES CLEARED");
  expect(g.trees).toHaveLength(1);
  expect(g.trees[0].id).toBe(4);
  expect(g.pickups).toEqual([{x:EAST_EXPANDED_X+48,y:151,w:3}]);
  expect(isCampTreeExcluded(g,CX+160)).toBe(true);
  expect(isCampTreeExcluded(g,CX+238)).toBe(false);
 });
 it("Grooty introduces the fence and expansion while preserving later teaching goals",()=>{
  const g=camp();
  expect(GUIDE_LEVELS).toHaveLength(5);
  expect(GUIDE_LEVELS[0].title).toBe("FIRST CAMP");
  g.guideTalked=true;g.guideChops=1;
  expect(guideProgress(g).next?.label).toBe("BUILD THE LEFT FENCE POST");
  g.fenceLeft=true;g.fenceRight=true;g.everLit=true;g.guideStokes=1;g.night=1;
  g.scoutVisited=true;g.scoutReturned=true;
  update(g,meta(),0.02,callbacks());
  expect(g.guideLevel).toBe(1);
  // Patch #33 teaches building storage first, before expanding the fence.
  expect(guideProgress(g).next?.label).toContain("BUILD LOG STORAGE");
 });
 it("saves fence progress in existing version-one run snapshots, with old runs grandfathered",()=>{
  const g=camp();g.fenceLeft=true;g.fenceRight=true;g.campExpansion=1;
  const snap=captureRunSnapshot(g);
  expect(snap.version).toBe(1);
  expect(snap.state.fenceLeft).toBe(true);
  expect(snap.state.fenceRight).toBe(true);
  expect(snap.state.campExpansion).toBe(1);
  const resumed=createEngine();resumed.resumeData=snap.state;
  titleActions(resumed,meta())[0].act();
  expect(resumed.campExpansion).toBe(1);
  const legacy={...snap.state,stage:2,builtPile:true,guideLevel:2};
  delete legacy.fenceLeft;delete legacy.fenceRight;delete legacy.campExpansion;
  const old=createEngine();old.resumeData=legacy;
  titleActions(old,meta())[0].act();
  expect(campEstablished(old)).toBe(true);
  expect(old.campExpansion).toBe(0);
  const fresh=createEngine();fresh.ui="title";
  titleActions(fresh,meta())[0].act();
  expect(fresh.fenceLeft).toBe(false);expect(fresh.fenceRight).toBe(false);
  expect(fresh.campExpansion).toBe(0);
 });
 it("draws rear palisade only after both posts and extends it after expansion",()=>{
  const g=camp(),colors={speckle:"#a99264"};
  const before=canvas();drawCampFence(before.ctx,g);
  expect(before.marks.length).toBeGreaterThan(0);
  const preMax=Math.max(...before.marks.map(p=>p.x+p.w));
  g.fenceLeft=true;g.fenceRight=true;
  const built=canvas();drawCampFence(built.ctx,g);
  expect(built.marks.length).toBeGreaterThan(100);
  expect(built.marks.some(p=>p.y<130&&p.x>=WEST_POST_X&&p.x<=EAST_POST_X)).toBe(true);
  const ground=canvas();drawCampGround(ground.ctx,g,colors);
  expect(ground.marks.length).toBeGreaterThan(4);
  g.campExpansion=1;
  const larger=canvas();drawCampFence(larger.ctx,g);
  const postMax=Math.max(...larger.marks.map(p=>p.x+p.w));
  expect(postMax).toBeGreaterThan(preMax);
  expect(postMax).toBeGreaterThan(EAST_EXPANDED_X-5);
  expect(larger.marks.length).toBeGreaterThan(built.marks.length);
 });
});
