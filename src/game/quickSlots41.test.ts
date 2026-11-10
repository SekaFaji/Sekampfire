import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
import {createEngine,drawRunChrome,handlePointer,benchRows,shopRows,titleActions,buildRows} from "./game";
import {drawInventoryMenu} from "./inventoryMenu";
import {inventoryEquipment} from "./inventory";
import {drawDog} from "./renderSprites";
import {drawBingsuPortrait,drawBingsuShopProfile,BINGSU} from "./bingsu";
import {drawShopTabs} from "./menuScreens";
import {activePet,updateDogCompanion} from "./companion";
import {QUICK_SLOT_SIZE,QUICK_SLOT_HIT_SIZE,normalizeQuickSlots,assignQuickSlot,useQuickSlot,tickQuickSlotHolds} from "./quickSlots";
import {captureRunSnapshot} from "./save";
import {GUIDE_LEVELS,guideProgress,drawGuideDialog,advanceGuide} from "./guide";

let store:Map<string,string>;
beforeEach(()=>{
 store=new Map();
 vi.stubGlobal("localStorage",{
  getItem:(key:string)=>store.get(key)??null,
  setItem:(key:string,value:string)=>store.set(key,String(value)),
  removeItem:(key:string)=>store.delete(key),
 });
});
afterEach(()=>vi.unstubAllGlobals());
const meta=()=>({ash:45,totalAsh:45,up:{},collection:{},museumBuilt:false,guideFx:true,petEquipped:null});
const run=()=>{
 const g=createEngine();g.ui="run";g.menu=null;
 g.trees=[];g.pickups=[];g.falling=[];
 return g;
};
function ctx(){
 let ink="";
 const rects:{x:number;y:number;w:number;h:number;color:string}[]=[];
 const canvas:any={
  set fillStyle(v:string){ink=v;},get fillStyle(){return ink;},
  fillRect(x:number,y:number,w:number,h:number){
   expect([x,y,w,h].every(Number.isFinite)).toBe(true);
   expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
   rects.push({x,y,w,h,color:ink});
  }
 };
 return {canvas,rects};
}
describe("Patch #41: small square toolbar and craftable Ember Torch",()=>{
 it("draws two 22px squares with larger hit areas, leaving the central ACT independent",()=>{
  const g=run(),v=ctx();g.zones=[];drawRunChrome(v.canvas,g);
  expect(QUICK_SLOT_SIZE).toBe(22);
  expect(QUICK_SLOT_HIT_SIZE).toEqual({w:28,h:26});
  const slots=g.zones.filter((z:any)=>z.quickSlot===0||z.quickSlot===1);
  expect(slots.map((s:any)=>[s.x,s.y,s.w,s.h])).toEqual([
   [97,151,28,26],[195,151,28,26]
  ]);
  const act=g.zones.find((z:any)=>z.x===133&&z.y===151&&z.w===54&&z.h===26);
  expect(act).toBeDefined();
  expect(slots[0].x+slots[0].w).toBeLessThan(act.x);
  expect(slots[1].x).toBeGreaterThan(act.x+act.w);
  expect(v.rects.some(r=>r.x===100&&r.y===153&&r.w===22&&r.h===22)).toBe(true);
  expect(v.rects.some(r=>r.x===198&&r.y===153&&r.w===22&&r.h===22)).toBe(true);
  expect(v.rects.every(r=>r.x>=0&&r.y>=0&&r.x+r.w<=320&&r.y+r.h<=180)).toBe(true);
 });
 it("new run cannot equip unowned Ember Torch; older learned Ember remains playable",()=>{
  const g=run();
  expect(assignQuickSlot(g,0,"ember_torch")).toBe(false);
  expect(normalizeQuickSlots(["ember","ember_torch"])).toEqual(["ember","ember_torch"]);
  expect(normalizeQuickSlots(["ember_torch","ember_torch"])).toEqual(["ember_torch",null]);
  expect(normalizeQuickSlots(["not-a-tool",42])).toEqual([null,null]);
  g.fireLit=true;g.everLit=true;g.fuel=80;
  expect(assignQuickSlot(g,0,"ember")).toBe(true);
  useQuickSlot(g,0);
  expect(g.pressT).toBe(true);
  g.pressT=false;
  expect(assignQuickSlot(g,1,"ember_torch")).toBe(false);
  expect(g.quickSlots).toEqual(["ember",null]);
 });
 it("crafting an actual reusable Ember Torch consumes real Pine Logs once",()=>{
  const g=run(),m=meta();
  g.builtBench=true;g.craftTab=1;g.player.wood=3;
  const row=benchRows(g,m).find((r:any)=>r.label==="EMBER TORCH");
  expect(row).toBeDefined();
  expect(row!.enabled).toBe(true);
  row!.onDown(); // deliberate two-step purchase
  expect(g.crafts.torch).not.toBe(true);
  expect(g.player.wood).toBe(3);
  benchRows(g,m).find((r:any)=>r.label==="EMBER TORCH")!.onDown();
  expect(g.crafts.torch).toBe(true);
  expect(g.player.wood).toBe(0);
  const torch=inventoryEquipment(g,m).find(e=>e.id==="ember_torch");
  expect(torch).toMatchObject({id:"ember_torch",source:"CRAFTED"});
  expect(assignQuickSlot(g,0,"ember_torch")).toBe(true);
  g.fireLit=true;g.fuel=90;g.pressT=false;useQuickSlot(g,0);
  expect(g.pressT).toBe(true);
  g.pressT=false;g.fireLit=false;useQuickSlot(g,0);
  expect(g.pressT).toBe(false);
 });
 it("a crafted torch is equipable directly from the equipment inventory to either socket",()=>{
  const g=run(),m=meta();g.crafts.torch=true;g.inventoryTab=1;
  g.inventoryGearType="tools";g.inventoryGearChoice="ember_torch";
  g.menu="inventory";g.zones=[];
  const v=ctx();drawInventoryMenu(v.canvas,g,m,()=>{g.menu=null;});
  const equip=g.zones.filter((z:any)=>z.y===149&&z.h===15&&z.w===57);
  expect(equip).toHaveLength(2);
  equip[0].onDown();
  expect(g.quickSlots).toEqual(["ember_torch",null]);
  equip[1].onDown();
  expect(g.quickSlots).toEqual([null,"ember_torch"]);
  expect(g.menu).toBe("inventory");
  expect(v.rects.some(r=>r.color==="#e8874c")).toBe(true);
 });
 it("normal tap uses one torch action; holding opens picker without activating item",()=>{
  const g=run();g.crafts.torch=true;g.fireLit=true;g.fuel=80;
  assignQuickSlot(g,0,"ember_torch");
  g.zones=[];drawRunChrome(ctx().canvas,g);
  handlePointer(g,"down",1,111,165);
  handlePointer(g,"up",1,111,165);
  expect(g.pressT).toBe(true);
  g.pressT=false;
  handlePointer(g,"down",2,111,165);
  tickQuickSlotHolds(g,.51);
  expect(g.menu).toBe("quickslot");
  expect(g.pressT).toBe(false);
  handlePointer(g,"up",2,111,165);
  expect(g.pressT).toBe(false);
  expect(g.pleft).toBe(false);
  expect(g.pright).toBe(false);
 });
 it("preserves legacy Ember slots, and crafted Torch IDs round-trip through v1 checkpoints",()=>{
  const g=run(),m=meta();g.crafts.torch=true;g.fireLit=true;g.fuel=80;
  expect(assignQuickSlot(g,0,"ember_torch")).toBe(true);
  const snap=captureRunSnapshot(g);
  expect(snap.version).toBe(1);
  expect(snap.state.quickSlots).toEqual(["ember_torch",null]);
  const restored=createEngine();restored.resumeData=snap.state;
  titleActions(restored,m)[0].act();
  expect(restored.crafts.torch).toBe(true);
  expect(restored.quickSlots).toEqual(["ember_torch",null]);
  const legacy={...snap.state,quickSlots:["ember",null]};
  const old=createEngine();old.resumeData=legacy;
  titleActions(old,m)[0].act();
  expect(old.quickSlots).toEqual(["ember",null]);
  const corrupt={...snap.state,crafts:{},quickSlots:["ember_torch",null]};
  const safe=createEngine();safe.resumeData=corrupt;
  titleActions(safe,m)[0].act();
  expect(safe.crafts.torch).not.toBe(true);
  safe.pressT=false;useQuickSlot(safe,0);
  expect(safe.pressT).toBe(false);
 });
});
describe("Patch #41: Bingsu the Dogo Argentino",()=>{
 it("retains paid dog ownership and exact price with a named personal companion",()=>{
  const g=run(),m:any=meta();g.shopTab=1;m.up.dog=0;
  const item=shopRows(g,m)[0];
  expect(item.label).toBe("BINGSU");
  expect(item.right).toBe("40 ASH");
  expect(item.desc).toContain("DOGO ARGENTINO");
  item.onDown();expect(m.ash).toBe(45);
  shopRows(g,m)[0].onDown();
  expect(m.ash).toBe(5);
  expect(m.up.dog).toBe(1);
  expect(activePet(m)).toBe("dog");
  expect(BINGSU.breed).toBe("DOGO ARGENTINO");
 });
 it("shows original detailed pet portrait, name, and truthful two-log ability",()=>{
  const v=ctx(),m:any=meta();m.up.dog=1;
  drawBingsuShopProfile(v.canvas,m);
  expect(v.rects.some(r=>r.color==="#fcf6e8")).toBe(true);
  expect(v.rects.some(r=>r.color==="#a95745")).toBe(false); // she wears no collar
  expect(v.rects.every(r=>r.x>=30&&r.x+r.w<=290&&r.y>=73&&r.y+r.h<=152)).toBe(true);
  expect(BINGSU.ability).toContain("2 PINE LOGS");
  const shop=ctx(),g=run();g.shopTab=1;
  drawShopTabs(shop.canvas,g,m,shopRows(g,m),()=>{g.menu=null;});
  expect(shop.rects.some(r=>r.color==="#fcf6e8")).toBe(true);
 });
 it("draws a compact collar-free white Dogo with mirrored head and two real carried logs",()=>{
  const g=run();g.dog={x:800,y:g.player.y,wood:2,dir:1,phase:"walk",motion:70,gait:0.8};
  const v=ctx();drawDog(v.canvas,g);
  expect(v.rects.some(r=>r.color==="#e9ede8")).toBe(true);
  expect(v.rects.some(r=>r.color==="#faf9ef")).toBe(true);
  expect(v.rects.some(r=>r.color==="#b2644e")).toBe(false); // remove red collar from world sprite
  expect(v.rects.filter(r=>r.color==="#553824")).toHaveLength(2);
  const x0=Math.min(...v.rects.map(r=>r.x)),x1=Math.max(...v.rects.map(r=>r.x+r.w));
  const y0=Math.min(...v.rects.map(r=>r.y)),y1=Math.max(...v.rects.map(r=>r.y+r.h));
  expect(x1-x0).toBeLessThanOrEqual(24);
  expect(y1-y0).toBeLessThanOrEqual(16);
  expect(v.rects.every(r=>r.w>0&&r.h>0)).toBe(true);
 });
 it("keeps fetching exactly two real existing pickups and never creates logs for free",()=>{
  const g=run(),m:any=meta();m.up.dog=1;m.petEquipped="dog";
  g.player.x=800;g.pickups=[{x:817,y:151,w:2}];
  const total=()=>g.player.wood+g.stored+(g.dog?.wood||0)+g.pickups.reduce((n:number,p:any)=>n+p.w,0);
  const initial=total();
  for(let i=0;i<25;i++)updateDogCompanion(g,m,.15);
  expect(total()).toBe(initial);
  expect(g.dog?.wood||0).toBeLessThanOrEqual(2);
 });
});
describe("Patch #41: Grooty labels tutorial missions, not campaign levels",()=>{
 it("has the exact five existing objective groups without changing their save identifiers",()=>{
  const g=run();g.guideLevel=0;
  expect(GUIDE_LEVELS).toHaveLength(5);
  expect(guideProgress(g).index).toBe(0);
  expect(guideProgress(g).next?.label).toBe("TALK TO GROOTY AT CAMP");
  g.guideTalked=true;
  expect(guideProgress(g).next?.label).toBe("CHOP ONE PINE TREE");
  const v=ctx();g.zones=[];drawGuideDialog(v.canvas,g,()=>{g.menu=null;});
  expect(v.rects.length).toBeGreaterThan(20);
 });
 it("announces milestone 1 completion and final camp challenges, preserving internal guideLevel",()=>{
  const g=run(),messages:string[]=[];
  g.guideChops=1;g.fenceLeft=true;g.fenceRight=true;g.everLit=true;
  g.guideStokes=1;g.night=1;g.isNight=false;
  g.guideTalked=true;g.scoutVisited=true;g.scoutReturned=true;
  advanceGuide(g,text=>messages.push(text));
  expect(g.guideLevel).toBe(1);
  expect(messages[0]).toContain("MILESTONE 1/3 COMPLETE");
  g.guideLevel=4;g.stage=6;g.campUpgrades={hearth:1,bench:1,pile:1};
  advanceGuide(g,text=>messages.push(text));
  expect(messages.at(-1)).toContain("ALL MISSIONS COMPLETE");
  expect(g.guideLevel).toBe(5);
 });
 it("requires M1-4 before cabin while not renaming actual building upgrade levels",()=>{
  const g=run(),m=meta();g.stage=5;g.fenceLeft=true;g.fenceRight=true;
  g.builtBench=true;g.builtPile=true;g.stored=70;
  g.campUpgrades={hearth:1,bench:1,pile:1};
  expect(buildRows(g,m)[0].right).toBe("FINISH M1-4");
  g.guideLevel=4;
  expect(buildRows(g,m)[0].right).not.toBe("FINISH M1-4");
  expect(g.campUpgrades.bench).toBe(1);
 });
});
