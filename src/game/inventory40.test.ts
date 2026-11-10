import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
import {createEngine,drawRunChrome,drawMenu,handlePointer,handleKey,
  closeMenu,pauseRows,titleActions,update} from "./game";
import {captureRunSnapshot} from "./save";
import {hudInventoryReadout} from "./hud";
import {
  ITEM_DEFINITIONS,INVENTORY_GRID_SLOTS,INVENTORY_START_SLOTS,PINE_LOG_ID,
  normalizeInventory,installInventory,itemQuantity,occupiedInventorySlots,
  availableInventorySlots,carriedWeight,carriedWeightLimit,inventoryEquipment
} from "./inventory";
import {BAG_GRID,INVENTORY_MODAL,drawInventoryMenu,drawInventoryItemIcon,inventorySelection} from "./inventoryMenu";
import {BACKPACK_BUTTON45} from "./proximity45";

let local:Map<string,string>;
beforeEach(()=>{
 local=new Map();
 vi.stubGlobal("localStorage",{
  getItem:(k:string)=>local.get(k)??null,
  setItem:(k:string,v:string)=>local.set(k,String(v)),
  removeItem:(k:string)=>local.delete(k)
 });
});
afterEach(()=>vi.unstubAllGlobals());
const meta=()=>({ash:8,totalAsh:8,best:0,runs:0,up:{},guideFx:true,collection:{},museumBuilt:false});
function run(){
 const g=createEngine();g.ui="run";g.menu=null;g.trees=[];g.pickups=[];g.falling=[];
 return g;
}
function canvas(){
 const rects:any[]=[];let color="";
 const ctx:any={
  set fillStyle(v:string){color=v;},get fillStyle(){return color;},
  fillRect(x:number,y:number,w:number,h:number){
   expect([x,y,w,h].every(Number.isFinite)).toBe(true);
   expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
   rects.push({x,y,w,h,color});
  }
 };
 return {ctx,rects};
}
describe("Patch #40 MMO backpack inventory and Pine Logs",()=>{
 it("owns one real Pine Logs stack, with legacy wood reads/writes bound to it",()=>{
   const g=run();
   expect(INVENTORY_GRID_SLOTS).toBe(20);
   expect(INVENTORY_START_SLOTS).toBe(5);
   expect(g.inventory.slots).toHaveLength(20);
   expect(ITEM_DEFINITIONS.pine_log.name).toBe("PINE LOGS");
   expect(g.player.wood).toBe(0);
   g.player.wood=4;
   expect(g.inventory.slots[0]).toEqual({id:PINE_LOG_ID,qty:4});
   expect(itemQuantity(g.inventory,PINE_LOG_ID)).toBe(4);
   g.player.wood+=2;
   expect(g.inventory.slots[0].qty).toBe(6);
   g.player.wood-=5;
   expect(g.inventory.slots[0].qty).toBe(1);
   g.player.wood=0;
   expect(g.inventory.slots[0]).toBeNull();
   expect(occupiedInventorySlots(g)).toBe(0);
 });
 it("provides genuine occupied-slot counts distinct from the existing carried weight cap",()=>{
   const g=run(),m=meta();
   expect(hudInventoryReadout(g,m)).toBe("WEIGHT 0/5KG");
   expect(availableInventorySlots(g,m)).toBe(5);
   g.player.wood=5;
   expect(hudInventoryReadout(g,m)).toBe("WEIGHT 5/5KG");
   expect(occupiedInventorySlots(g)).toBe(1);
   expect(carriedWeight(g)).toBe(5);
   expect(carriedWeightLimit(g,m)).toBe(5);
   g.crafts.pack=true;
   expect(availableInventorySlots(g,m)).toBe(10);
   expect(carriedWeightLimit(g,m)).toBe(13);
   (m.up as any).pack=1;
   expect(availableInventorySlots(g,m)).toBe(15);
   expect(carriedWeightLimit(g,m)).toBe(21);
   expect(hudInventoryReadout(g,m)).toBe("WEIGHT 5/21KG");
 });
 it("supports old version-one checkpoint migration, stable round-trip and rejecting corrupted stacks",()=>{
   const g=run(),m=meta();g.player.wood=4;
   let snap=captureRunSnapshot(g);
   expect(snap.version).toBe(1);
   expect(snap.state.player.wood).toBe(4);
   expect(snap.state.inventory.slots[0]).toEqual({id:PINE_LOG_ID,qty:4});
   const resumed=createEngine();resumed.resumeData=snap.state;
   titleActions(resumed,m)[0].act();
   expect(resumed.player.wood).toBe(4);
   expect(resumed.inventory.slots[0]?.qty).toBe(4);
   resumed.player.wood++;
   expect(resumed.inventory.slots[0]?.qty).toBe(5);
   snap=captureRunSnapshot(resumed);
   expect(snap.state.inventory.slots[0]?.qty).toBe(5);
   const old={...snap.state};delete old.inventory;old.player={...old.player,wood:3};
   const restored=createEngine();restored.resumeData=old;
   titleActions(restored,m)[0].act();
   expect(restored.inventory.slots[0]?.qty).toBe(3);
   expect(restored.player.wood).toBe(3);
   expect(normalizeInventory({slots:Array(20).fill({id:"evil",qty:9999})},4).slots[0]).toBeNull();
   expect(normalizeInventory({slots:[{id:PINE_LOG_ID,qty:900000}]},4).slots[0]?.qty).toBe(4);
 });
 it("legacy resource pickup uses the same canonical item as fire, storage and craft costs",()=>{
   const g=run(),m=meta(),events={toast:vi.fn(),end:vi.fn()};
   g.player.x=800;g.player.y=151;
   g.pickups=[{x:800,y:151,w:3}];
   update(g,m,.03,events);
   expect(g.player.wood).toBe(3);
   expect(g.inventory.slots[0]?.qty).toBe(3);
   const n=g.player.wood;
   g.player.wood-=2; // existing fire / construction cost path
   expect(g.inventory.slots[0]?.qty).toBe(n-2);
   g.stored+=g.player.wood;g.player.wood=0; // existing storage path
   expect(g.inventory.slots[0]).toBeNull();
   expect(g.stored).toBe(1);
 });
 it("equipment tab reflects previously crafted items without duplicating those in backpack",()=>{
   const g=run(),m=meta();
   g.crafts.maul=true;g.crafts.boots=true;g.crafts.pack=true;
   const entries=inventoryEquipment(g,m);
   expect(entries.map(e=>e.id)).toEqual(["wood_axe","warm_boots","timber_pack"]);
   expect(entries.every(e=>e.source==="CRAFTED")).toBe(true);
   expect(occupiedInventorySlots(g)).toBe(0);
   g.inventoryTab=1;g.inventoryEquipSel=1;
   expect(inventorySelection(g,m)).toMatchObject({id:"warm_boots",qty:1});
   (m.up as any).axe=1;
   expect(inventoryEquipment(g,m).filter(e=>e.id==="wood_axe")).toHaveLength(1);
 });
 it("draws 20 crisp native slots, locks unowned capacity, and opens item details on tap",()=>{
   const g=run(),m=meta();g.player.wood=5;
   g.zones=[];g.inventorySel=0;
   const picture=canvas();
   drawInventoryMenu(picture.ctx,g,m,()=>closeMenu(g));
   expect(g.menuRect).toEqual(INVENTORY_MODAL);
   expect(g.zones.filter((z:any)=>z.w===22&&z.h===22)).toHaveLength(5);
   expect(inventorySelection(g,m)).toMatchObject({id:PINE_LOG_ID,qty:5});
   expect(picture.rects.some(r=>r.color==="#9e6540")).toBe(true);
   expect(picture.rects.some(r=>r.color==="#222a2e")).toBe(true);
   expect(picture.rects.every(r=>r.x>=18&&r.y>=8&&r.x+r.w<=302&&r.y+r.h<=172)).toBe(true);
   g.crafts.pack=true;g.zones=[];
   drawInventoryMenu(canvas().ctx,g,m,()=>closeMenu(g));
   expect(g.zones.filter((z:any)=>z.w===22&&z.h===22)).toHaveLength(10);
   g.inventorySel=1;
   expect(inventorySelection(g,m)).toBeNull();
   const icon=canvas();drawInventoryItemIcon(icon.ctx,"pine_log",0,0);
   expect(icon.rects.every(r=>r.x>=0&&r.y>=0&&r.x+r.w<=12&&r.y+r.h<=12)).toBe(true);
 });
 it("opens from dedicated bottom-right BAG and ignores underlying controls beneath its modal",()=>{
   const g=run(),m=meta();g.zones=[];
   drawRunChrome(canvas().ctx,g);
   const inv=g.zones.find((z:any)=>z.x===BACKPACK_BUTTON45.x && z.y===BACKPACK_BUTTON45.y && z.w===BACKPACK_BUTTON45.w && z.h===BACKPACK_BUTTON45.h);
   expect(inv).toBeDefined();
   handlePointer(g,"down",1,BACKPACK_BUTTON45.x+10,BACKPACK_BUTTON45.y+10);
   expect(g.menu).toBe("inventory");
   expect(g.keys.act).toBe(false);
   g.zones=[];drawMenu(canvas().ctx,g,m);
   expect(g.menuRect).toEqual(INVENTORY_MODAL);
   handlePointer(g,"down",2,134,155); // blank zone inside dialog
   expect(g.menu).toBe("inventory");
   g.pressE=false;g.pressT=false;
   handlePointer(g,"down",3,140,163); // underneath ACT but inside modal
   expect(g.pressE).toBe(false);
   expect(g.pressT).toBe(false);
   expect(g.menu).toBe("inventory");
   handlePointer(g,"down",4,15,175); // outside dismisses inventory
   expect(g.menu).toBeNull();
 });
 it("supports right-side equipment selection, keyboard controls, back and I shortcut",()=>{
   const g=run(),m=meta();
   g.menu="inventory";g.inventoryFrom="run";g.crafts.pack=true;g.crafts.maul=true;
   g.zones=[];drawMenu(canvas().ctx,g,m);
   handlePointer(g,"down",7,176,55); // actual right-side AXE socket
   expect(g.inventoryTab).toBe(1);
   expect(g.inventoryGearType).toBe("axe");
   handleKey(g,m,"arrowright",true);
   expect(g.inventoryGearChoice).toBe("wood_axe");
   handleKey(g,m,"arrowleft",true);
   expect(g.inventoryGearChoice).toBe("stick");
   g.pressE=false;
   handleKey(g,m,"enter",true); // legitimate equipment action
   expect(g.pressE).toBe(false);
   handleKey(g,m,"escape",true);
   expect(g.menu).toBeNull();
   expect(pauseRows(g,m).some((r:any)=>r.label==="INVENTORY")).toBe(false);
   handleKey(g,m,"i",true);
   expect(g.menu).toBe("inventory");
   handleKey(g,m,"i",true);
   expect(g.menu).toBeNull();
 });
});
