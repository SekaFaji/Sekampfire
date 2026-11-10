import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
import {createEngine,drawRunChrome,handlePointer,handleKey,updateAmbient,titleActions,drawMenu,closeMenu,pauseRows,toolbarRows,quickSlotRows} from "./game";
import {captureRunSnapshot} from "./save";
import {drawCampMinimap} from "./hud";
import {WEST_POST_X,EAST_POST_X,EAST_EXPANDED_X} from "./campBoundary";
import {BENCH_X,PILE_X,CX} from "./config";
import {normalizeQuickSlots,assignQuickSlot,useQuickSlot,tickQuickSlotHolds,QUICK_SLOT_HOLD_SECONDS} from "./quickSlots";
import {guideTarget,guideMenuPosition} from "./guidance";

const meta=()=>({ash:9,up:{},collection:{},museumBuilt:false,guideFx:true});
let storage:Map<string,string>;
beforeEach(()=>{
 storage=new Map();
 vi.stubGlobal("localStorage",{
   getItem:(k:string)=>storage.get(k)??null,
   setItem:(k:string,v:string)=>storage.set(k,String(v)),
   removeItem:(k:string)=>storage.delete(k)
 });
});
afterEach(()=>vi.unstubAllGlobals());
function canvas(){
 let color="";const marks:any[]=[];
 const ctx:any={
  set fillStyle(v:string){color=v;},get fillStyle(){return color;},
  fillRect(x:number,y:number,w:number,h:number){
   expect([x,y,w,h].every(Number.isFinite)).toBe(true);
   expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
   marks.push({x,y,w,h,color});
  }
 };
 return {ctx,marks};
}
const run=()=>{
 const g=createEngine();g.ui="run";g.menu=null;
 g.player.x=CX;g.trees=[];g.pickups=[];g.falling=[];
 return g;
};
describe("Patch #38 - real camp minimap",()=>{
 it("adds west/east post, joined palisade and expanded claim without making up buildings",()=>{
  const g=run(),colors={ridge:"#665544",treeLight:"#a7804a"};
  let v=canvas();drawCampMinimap(v.ctx,g,colors);
  expect(v.marks.some(m=>m.color==="#e0ad74")).toBe(false);
  g.fenceLeft=true;g.fenceRight=true;
  v=canvas();drawCampMinimap(v.ctx,g,colors);
  const wood=v.marks.filter(m=>m.color==="#e0ad74");
  expect(wood).toHaveLength(2);
  expect(wood[0].x).toBeLessThan(wood[1].x);
  const rail=v.marks.find(m=>m.color==="#a06c42"&&m.y===10);
  expect(rail).toBeDefined();
  const oldWidth=rail!.w;
  expect(oldWidth).toBeGreaterThan(30);
  g.campExpansion=1;
  v=canvas();drawCampMinimap(v.ctx,g,colors);
  const expanded=v.marks.find(m=>m.color==="#a06c42"&&m.y===10);
  expect(expanded!.w).toBeGreaterThan(oldWidth);
 });
 it("distinguishes unbuilt sites from finished workshop, storage, cabin and museum",()=>{
  const g=run(),colors={ridge:"#665544",treeLight:"#a7804a"};
  let v=canvas();drawCampMinimap(v.ctx,g,colors);
  expect(v.marks.filter(m=>m.color==="#a9ac95")).toHaveLength(2);
  g.builtBench=true;g.builtPile=true;g.stage=5;g.museumBuilt=true;
  v=canvas();drawCampMinimap(v.ctx,g,colors);
  expect(v.marks.filter(m=>m.color==="#a9ac95")).toHaveLength(0);
  for(const color of ["#d8ae78","#c58b53","#dfbd85","#e2c991"]){
    expect(v.marks.some(m=>m.color===color)).toBe(true);
  }
  expect(v.marks.some(m=>m.color==="#fff9ea"&&m.w===2&&m.h===5)).toBe(true);
 });
 it("map remains strictly within existing 320x15 strip and never adds input zones",()=>{
  const g=run(),v=canvas();g.fenceLeft=true;g.fenceRight=true;g.campExpansion=1;
  g.builtBench=true;g.builtPile=true;g.museumBuilt=true;g.stage=6;
  g.trees=[{x:80},{x:1400}];g.camX=650;
  const zones=g.zones.length;
  drawCampMinimap(v.ctx,g,{ridge:"#668877",treeLight:"#aa7744"});
  expect(g.zones).toHaveLength(zones);
  expect(v.marks.every(m=>m.x>=0&&m.x+m.w<=320&&m.y>=2&&m.y+m.h<=15)).toBe(true);
 });
});
describe("Patch #38 - two usable quick-access slots",()=>{
 it("starts empty, rejects invalid IDs and prevents duplicate active assignments",()=>{
  const g=run();
  expect(normalizeQuickSlots(g.quickSlots)).toEqual([null,null]);
  expect(assignQuickSlot(g,0,"ember")).toBe(false); // not learned yet
  g.fireLit=true;g.everLit=true;
  expect(assignQuickSlot(g,0,"ember")).toBe(true);
  expect(g.quickSlots).toEqual(["ember",null]);
  expect(assignQuickSlot(g,1,"ember")).toBe(true);
  expect(g.quickSlots).toEqual([null,"ember"]);
  expect(assignQuickSlot(g,1,null)).toBe(true);
  expect(g.quickSlots).toEqual([null,null]);
  expect(assignQuickSlot(g,2,"ember")).toBe(false);
  expect(normalizeQuickSlots(["corrupt",{item:"ember"}])).toEqual([null,null]);
 });
 it("short tapping an assigned slot uses existing fire ember rules only once",()=>{
  const g=run();g.fireLit=true;g.everLit=true;g.fuel=90;
  assignQuickSlot(g,0,"ember");
  g.zones=[];drawRunChrome(canvas().ctx,g);
  handlePointer(g,"down",7,111,166);
  expect(g.pressT).toBe(false);
  expect(g.pleft).toBe(false);expect(g.pright).toBe(false);
  handlePointer(g,"up",7,111,166);
  expect(g.pressT).toBe(true);
  expect(Object.keys(g.pointers)).toHaveLength(0);
  g.pressT=false;g.fireLit=false;
  handlePointer(g,"down",8,111,166);
  handlePointer(g,"up",8,111,166);
  expect(g.pressT).toBe(false); // invalid without a fire
 });
 it("long press opens a modal picker without consuming the ember or moving",()=>{
  const g=run();g.fireLit=true;g.everLit=true;g.fuel=90;
  assignQuickSlot(g,0,"ember");
  g.zones=[];drawRunChrome(canvas().ctx,g);
  handlePointer(g,"down",5,111,166);
  tickQuickSlotHolds(g,QUICK_SLOT_HOLD_SECONDS-.01);
  expect(g.menu).toBeNull();
  tickQuickSlotHolds(g,.02);
  expect(g.menu).toBe("quickslot");
  expect(g.quickSlotIndex).toBe(0);
  expect(g.pressT).toBe(false);
  handlePointer(g,"up",5,111,166);
  expect(g.pressT).toBe(false);
  expect(g.pleft).toBe(false);
  expect(g.pright).toBe(false);
  const m=meta();g.zones=[];drawMenu(canvas().ctx,g,m);
  expect(g.menuRect).toBeTruthy();
  closeMenu(g);
  expect(g.menu).toBeNull();
 });
 it("dragging away cancels tap and hold, preserving multitouch movement",()=>{
  const g=run();g.fireLit=true;g.everLit=true;
  assignQuickSlot(g,1,"ember");
  g.zones=[];drawRunChrome(canvas().ctx,g);
  handlePointer(g,"down",3,210,166);
  handlePointer(g,"move",3,170,110);
  tickQuickSlotHolds(g,.8);
  expect(g.menu).toBeNull();
  handlePointer(g,"up",3,170,110);
  expect(g.pressT).toBe(false);
  handlePointer(g,"down",4,310,95);
  expect(g.pright).toBe(true);
  handlePointer(g,"down",5,111,166);
  expect(g.pright).toBe(true);
  handlePointer(g,"up",5,111,166);
  expect(g.pright).toBe(true);
  handlePointer(g,"up",4,310,95);
  expect(g.pright).toBe(false);
 });
 it("pause preserves End Run without Toolbar, while long-hold still equips quickslots",()=>{
  const g=run(),m=meta();g.ashEarned=19;
  expect(pauseRows(g,m)[2].right).toBe("+19 ASH");
  expect(pauseRows(g,m).map((row:any)=>row.label)).toEqual(["RESUME","SETTINGS","END RUN"]);
  g.fireLit=true;g.everLit=true;
  g.zones=[];drawRunChrome(canvas().ctx,g);
  handlePointer(g,"down",7,210,166);
  tickQuickSlotHolds(g,QUICK_SLOT_HOLD_SECONDS+0.1);
  expect(g.menu).toBe("quickslot");
  expect(g.quickSlotIndex).toBe(1);
  expect(quickSlotRows(g)[0].enabled).toBe(false); // craftable Torch not owned
  expect(quickSlotRows(g)[1].enabled).toBe(true); // legacy Ember
  quickSlotRows(g)[1].onDown();
  expect(g.quickSlots).toEqual([null,"ember"]);
  expect(g.menu).toBeNull(); // returns directly to live run
 });
 it("preserves assignments in existing version one run saves, sanitizing old and corrupted data",()=>{
  const g=run(),m=meta();g.fireLit=true;g.everLit=true;g.fuel=25;
  assignQuickSlot(g,0,"ember");
  const snapshot=captureRunSnapshot(g);
  expect(snapshot.version).toBe(1);
  expect(snapshot.state.quickSlots).toEqual(["ember",null]);
  const restored=createEngine();restored.resumeData=snapshot.state;
  titleActions(restored,m)[0].act();
  expect(restored.quickSlots).toEqual(["ember",null]);
  const legacy={...snapshot.state};delete legacy.quickSlots;
  const older=createEngine();older.resumeData=legacy;
  titleActions(older,m)[0].act();
  expect(older.quickSlots).toEqual([null,null]);
  const polluted={...snapshot.state,quickSlots:[{hack:true},"not-an-item"]};
  const safe=createEngine();safe.resumeData=polluted;
  titleActions(safe,m)[0].act();
  expect(safe.quickSlots).toEqual([null,null]);
 });
 it("keeps Grooty pointing to the real Storage station Upgrade button",()=>{
  const g=run(),m=meta();g.guideLevel=1;g.builtPile=true;g.guideStoredTen=true;g.campExpansion=1;g.fenceLeft=true;g.fenceRight=true;g.player.wood=50;g.stored=10;
  let target=guideTarget(g,m);
  expect(target).toMatchObject({space:"world",x:PILE_X});
  g.menu="station";g.stationId="pile";g.zones=[];drawMenu(canvas().ctx,g,m);
  target=guideTarget(g,m);
  expect(target).toMatchObject({space:"menu",menu:"station",row:1});
  const pos=guideMenuPosition(g,target!);
  expect(pos).toEqual({x:207,y:113});
 });
 it("keeps the central ACT zone and two water-side tool sockets non-overlapping",()=>{
  const g=run();g.zones=[];drawRunChrome(canvas().ctx,g);
  const act=g.zones.find((z:any)=>z.x===133&&z.y===151&&z.w===54&&z.h===26);
  const quick=g.zones.filter((z:any)=>z.quickSlot===0||z.quickSlot===1);
  expect(act).toBeTruthy();expect(quick).toHaveLength(2);
  expect(quick[0].x+quick[0].w).toBeLessThan(act.x);
  expect(quick[1].x).toBeGreaterThan(act.x+act.w);
  expect(quick.every((z:any)=>z.w===28&&z.h===26)).toBe(true);
 });
});
