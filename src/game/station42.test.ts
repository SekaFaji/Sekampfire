import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
import {createEngine,update,drawMenu,handlePointer,handleKey,
  closeMenu,pauseRows,benchRows,buildRows,stationRows,openStation,
  accessStorage,accessHearth,drawRunChrome} from "./game";
import {drawStationIcon,STATION_ACTIONS,STATION_POPUP} from "./stationPopup";
import {CX,BENCH_X,PILE_X} from "./config";
import {stationLevel,stationCost} from "./campProgress";
import {guideTarget,guideMenuPosition} from "./guidance";
import {captureRunSnapshot} from "./save";
import {selectStation} from "./proximity45";
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
const meta=()=>({ash:18,totalAsh:18,best:0,runs:0,up:{},collection:{},museumBuilt:false,guideFx:true});
const state=()=>{
 const g=createEngine();g.ui="run";g.menu=null;g.over=false;
 g.trees=[];g.pickups=[];g.falling=[];g.keys={};
 g.fenceLeft=true;g.fenceRight=true;
 return g;
};
const cb=()=>({toast:vi.fn(),end:vi.fn()});
function picture(){
 let color="";const rects:{x:number;y:number;w:number;h:number;color:string}[]=[];
 const ctx:any={
  get fillStyle(){return color;},
  set fillStyle(c:string){color=c;},
  fillRect(x:number,y:number,w:number,h:number){
    expect([x,y,w,h].every(Number.isFinite)).toBe(true);
    expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
    rects.push({x,y,w,h,color});
  }
 };
 return {ctx,rects};
}
describe("Patch #42 physical construction, access and upgrade",()=>{
 it("has no remote BUILD or inventory pause row; keeps world crafting and I shortcut",()=>{
  const g=state(),m=meta();
  const rows=pauseRows(g,m);
  expect(rows.some((r:any)=>r.label==="BUILD")).toBe(false);
  expect(rows.some((r:any)=>r.label==="INVENTORY")).toBe(false);
  expect(rows.some((r:any)=>r.label==="END RUN")).toBe(true);
  handleKey(g,m,"b",true);
  expect(g.menu).toBeNull();
  g.menu="pause";g.zones=[];
  drawMenu(picture().ctx,g,m);
  expect(g.menu).toBe("pause");
  expect(g.zones.some((z:any)=>z.onDown&&z.quickSlot!==undefined)).toBe(false);
 });
 it("keeps initial Workbench and Storage physically constructible without requiring a finished bench",()=>{
  const g=state(),m=meta();
  g.builtBench=false;g.builtPile=false;g.player.wood=5;
  g.player.x=BENCH_X;g.pressE=true;
  update(g,m,.02,cb());
  expect(g.menu).toBeNull();
  expect(g.benchLogs).toBe(5);
  expect(g.player.wood).toBe(0);
  g.player.wood=5;g.player.x=PILE_X;g.pressE=true;
  update(g,m,.02,cb());
  expect(g.pileLogs).toBe(5);
  expect(g.player.wood).toBe(0);
  expect(openStation(g,"bench")).toBe(false);
  expect(openStation(g,"pile")).toBe(false);
 });
 it("ACT at completed stations performs the left action instead of opening station popup",()=>{
  const g=state(),m=meta();
  g.builtBench=true;g.builtPile=true;g.player.x=BENCH_X;
  g.pressE=true;update(g,m,.02,cb());
  expect(g.menu).toBeNull();expect(g.selectedStation).toBe("bench");
  g.pressE=true;update(g,m,.02,cb());
  expect(g.menu).toBe("bench"); // second ACT enters real crafting
  expect(g.stationFrom).toBe(false);
  closeMenu(g);expect(g.menu).toBeNull();
  g.player.x=PILE_X;g.player.wood=2;g.pressE=true;update(g,m,.02,cb());
  expect(g.menu).toBeNull();expect(g.stored).toBe(0);
  g.pressE=true;update(g,m,.02,cb());
  expect(g.stored).toBe(2);
  g.player.x=CX;g.fireLit=true;g.fuel=10;g.player.wood=1;
  g.pressE=true;update(g,m,.02,cb());
  expect(g.selectedStation).toBe("hearth");
  expect(g.player.wood).toBe(1);
  g.pressE=true;update(g,m,.02,cb());
  expect(g.menu).toBeNull();expect(g.stationId).toBe("hearth");
  expect(g.player.wood).toBe(0);expect(g.guideStokes).toBe(1);
  g.player.x=CX+130;
  expect(openStation(g,"bench")).toBe(false);
  expect(openStation(g,"pile")).toBe(false);
 });
 it("physical ACCESS/UPGRADE panel has distinct large buttons and never exposes the world underneath",()=>{
  const g=state(),m=meta();g.builtBench=true;g.player.x=BENCH_X;
  expect(openStation(g,"bench")).toBe(true);
  g.zones=[];const v=picture();drawMenu(v.ctx,g,m);
  expect(g.menuRect).toEqual(STATION_POPUP);
  expect(g.zones.some((z:any)=>z.x===STATION_ACTIONS.access.x&&z.y===STATION_ACTIONS.access.y)).toBe(true);
  expect(g.zones.some((z:any)=>z.x===STATION_ACTIONS.upgrade.x&&z.y===STATION_ACTIONS.upgrade.y)).toBe(true);
  expect(g.zones.some((z:any)=>z.x===STATION_ACTIONS.plans.x&&z.y===STATION_ACTIONS.plans.y)).toBe(true);
  expect(v.rects.some(r=>r.color==="#879da2")).toBe(true); // original workbench tool
  const underlying=picture();g.zones=[];drawRunChrome(underlying.ctx,g);
  drawMenu(underlying.ctx,g,m);
  g.pressE=false;
  handlePointer(g,"down",1,145,158); // ACT outside station modal closes it, never activates ACT
  expect(g.pressE).toBe(false);
  expect(g.menu).toBeNull();
 });
 it("Workbench ACCESS opens crafting, PLANS opens physical structures, Back returns to same station",()=>{
  const g=state(),m=meta();g.builtBench=true;g.player.x=BENCH_X;
  openStation(g,"bench");
  stationRows(g,m)[0].onDown();
  expect(g.menu).toBe("bench");
  expect(g.craftTab).toBe(0);
  expect(benchRows(g,m).some((r:any)=>r.label.includes("LV"))).toBe(false);
  closeMenu(g);expect(g.menu).toBe("station");
  stationRows(g,m)[2].onDown();
  expect(g.menu).toBe("build");expect(g.buildTab).toBe(0);
  expect(buildRows(g,m)[0].label).toBe("WOOD RING");
  // Even a stale hidden buildTab=1 cannot reveal remote upgrades.
  g.buildTab=1;
  expect(buildRows(g,m).some((r:any)=>r.label.includes("LV"))).toBe(false);
  closeMenu(g);expect(g.menu).toBe("station");
  closeMenu(g);expect(g.menu).toBeNull();
 });
 it("local station upgrade requires an explicit second press, spends exact logs and awards the old Ash",()=>{
  const g=state(),m=meta();g.builtBench=true;g.player.x=BENCH_X;
  g.player.wood=5;g.stored=7;g.ashEarned=4;
  expect(openStation(g,"bench")).toBe(true);
  const initialCost=stationCost(g,"bench");
  expect(initialCost).toBe(10);
  stationRows(g,m)[1].onDown();
  expect(g.buildConfirm).toBe("bench");
  expect(g.player.wood+g.stored).toBe(12);
  expect(stationLevel(g,"bench")).toBe(0);
  stationRows(g,m)[1].onDown();
  expect(stationLevel(g,"bench")).toBe(1);
  expect(g.player.wood+g.stored).toBe(2);
  expect(g.ashEarned).toBe(6);
  closeMenu(g);
  expect(g.buildConfirm).toBeNull();
 });
 it("Hearth ACCESS preserves original firestarter, 3-log relight and tutorial stoke behavior",()=>{
  const g=state();g.player.x=CX;
  g.fireLit=false;g.firestarter=1;g.fuel=0;
  accessHearth(g);
  expect(g.fireLit).toBe(true);expect(g.fuel).toBe(34);
  expect(g.firestarter).toBe(0);expect(g.everLit).toBe(true);
  g.player.wood=2;accessHearth(g);
  expect(g.player.wood).toBe(1);expect(g.guideStokes).toBe(1);
  g.fireLit=false;g.fuel=0;g.player.wood=1;g.stored=2;
  accessHearth(g);
  expect(g.fireLit).toBe(true);expect(g.player.wood).toBe(0);
  expect(g.stored).toBe(0);expect(g.fuel).toBe(28);
 });
 it("Storage ACCESS conserves real Pine Logs, still respects original capacities",()=>{
  const g=state(),m=meta();g.builtPile=true;g.player.x=PILE_X;
  g.player.wood=5;
  accessStorage(g,m);
  expect(g.stored).toBe(5);
  expect(g.player.wood).toBe(0);
  expect(g.inventory.slots[0]).toBeNull();
  accessStorage(g,m);
  expect(g.stored).toBe(0);expect(g.player.wood).toBe(5);
  expect(g.inventory.slots[0]?.qty).toBe(5);
 });
 it("Grooty's live markers target the real local UPGRADE and BUILD PLANS button",()=>{
  const g=state(),m=meta();g.builtPile=true;g.builtBench=true;
  g.guideLevel=1;g.guideStoredTen=true;g.campExpansion=1;g.stored=15;
  g.campUpgrades.pile=0;g.player.x=PILE_X;
  let target=guideTarget(g,m);
  expect(target).toMatchObject({space:"world",x:PILE_X});
  openStation(g,"pile");
  target=guideTarget(g,m);
  expect(target).toMatchObject({space:"menu",menu:"station",row:1});
  drawMenu(picture().ctx,g,m);
  const at=guideMenuPosition(g,target!);
  expect(at).toEqual({x:STATION_ACTIONS.upgrade.x+STATION_ACTIONS.upgrade.w/2,
    y:STATION_ACTIONS.upgrade.y+STATION_ACTIONS.upgrade.h/2});
  closeMenu(g);
  g.guideLevel=3;g.stage=0;g.player.x=BENCH_X;
  expect(selectStation(g,"bench")).toBe(true);
  target=guideTarget(g,m);expect(target).toMatchObject({space:"screen"});
  openStation(g,"bench");
  target=guideTarget(g,m);
  expect(target).toMatchObject({space:"menu",menu:"station",row:2});
  stationRows(g,m)[2].onDown();
  target=guideTarget(g,m);
  expect(target).toMatchObject({space:"menu",menu:"build",row:0});
 });
 it("run checkpoint retains the original station upgrades without persisting transient popup state",()=>{
  const g=state();g.builtBench=true;g.player.x=BENCH_X;
  g.campUpgrades.bench=1;openStation(g,"bench");
  stationRows(g,meta())[1].onDown();
  const snap=captureRunSnapshot(g);
  expect(snap.version).toBe(1);
  expect(snap.state.campUpgrades.bench).toBe(1);
  expect("stationId" in snap.state).toBe(false);
  expect("stationFrom" in snap.state).toBe(false);
  expect("buildConfirm" in snap.state).toBe(false);
 });
});
