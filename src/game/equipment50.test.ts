import {beforeEach,afterEach,describe,expect,it,vi} from "vitest";
import {
 AXE_STATS,ownedAxeOptions,ownedPetOptions,defaultPermanentAxe,
 normalizeEquippedAxe,equippedAxe,equipAxe,equipPet,equippedPet
} from "./equipment50";
import {choppingToolTier,choppingSeconds} from "./rules";
import {createEngine,shopRows,benchRows,titleActions} from "./game";
import {captureRunSnapshot,loadMeta,saveMeta} from "./save";
import {activePet,updateDogCompanion} from "./companion";
import {inventoryEquipment,ITEM_DEFINITIONS} from "./inventory";
import {
 drawInventoryMenu,chooseEquipmentCategory50,navigateEquipment50,
 activateEquipment50,EQUIPMENT_SLOTS50,EQUIPMENT_ACTION50,BAG_GRID,
 INVENTORY_MODAL
} from "./inventoryMenu";

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
function meta(){
 return {up:{dog:0,axe:0,pack:0},ash:99,totalAsh:100,
  petEquipped:null as "dog"|null,axeEquipped:"stick",guideFx:true};
}
function run(){
 const g=createEngine();g.ui="run";g.over=false;g.menu="inventory";
 g.player.wood=2;g.player.chopT=0;g.crafts={};
 return g;
}
function canvas(){
 const rects:{x:number;y:number;w:number;h:number;fill:string}[]=[];
 let fill="";
 const ctx:any={
  get fillStyle(){return fill;},
  set fillStyle(v:string){fill=v;},
  fillRect(x:number,y:number,w:number,h:number){
   expect([x,y,w,h].every(Number.isFinite)).toBe(true);
   expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
   rects.push({x,y,w,h,fill});
  }
 };
 return {ctx,rects};
}
function render(g:any,m:any){
 const c=canvas();g.zones=[];
 drawInventoryMenu(c.ctx,g,m,()=>{g.menu=null;});
 return c;
}
function tap(g:any,x:number,y:number){
 const zone=[...g.zones].reverse().find((z:any)=>
   x>=z.x&&x<z.x+z.w&&y>=z.y&&y<z.y+z.h);
 expect(zone).toBeDefined();
 zone.onDown();
}
describe("Patch #50: one genuinely equipped axe and permanent Stick",()=>{
 it("the Stick is ALWAYS present, even with zero crafted or purchased gear",()=>{
  const g=run(),m=meta();
  expect(ownedAxeOptions(g,m)).toEqual(["stick"]);
  expect(equippedAxe(g,m)).toBe("stick");
  expect(choppingToolTier(g,m)).toBe(0);
  expect(choppingSeconds(g,m)).toBe(1);
  expect(ITEM_DEFINITIONS.stick.name).toBe("WOOD STICK");
  expect(equipAxe(g,m,"wood_axe")).toBe(false);
  expect(equipAxe(g,m,"grandpas_axe")).toBe(false);
 });
 it("owning two axes never stacks their bonuses and the actual sprite tier matches",()=>{
  const g=run(),m=meta();g.crafts.maul=true;m.up.axe=1;
  expect(ownedAxeOptions(g,m)).toEqual(["stick","wood_axe","grandpas_axe"]);
  expect(equipAxe(g,m,"wood_axe")).toBe(true);
  expect(choppingSeconds(g,m)).toBe(AXE_STATS.wood_axe.chopSeconds);
  expect(choppingToolTier(g,m)).toBe(1);
  expect(equipAxe(g,m,"grandpas_axe")).toBe(true);
  expect(choppingSeconds(g,m)).toBe(AXE_STATS.grandpas_axe.chopSeconds);
  expect(choppingToolTier(g,m)).toBe(2);
  expect(equipAxe(g,m,"stick")).toBe(true);
  expect(choppingSeconds(g,m)).toBe(1);
  expect(choppingToolTier(g,m)).toBe(0);
  expect(g.crafts.maul).toBe(true);expect(m.up.axe).toBe(1);
 });
 it("selecting an axe cancels a mid-swing animation without consuming wood",()=>{
  const g=run(),m=meta();g.crafts.maul=true;
  const target={x:g.player.x+1};g.player.chopT=.3;g.player.chopTree=target;
  const logs=g.player.wood;
  expect(equipAxe(g,m,"wood_axe")).toBe(true);
  expect(g.player.chopT).toBe(0);
  expect(g.player.chopTree).toBeNull();
  expect(g.chopBlocked).toBe(true);
  expect(g.player.wood).toBe(logs);
 });
 it("does not expose a forged owned axe ID when loading malformed checkpoints",()=>{
  const g=run(),m=meta();
  expect(normalizeEquippedAxe("grandpas_axe",g,m)).toBe("stick");
  expect(normalizeEquippedAxe("wood_axe",g,m)).toBe("stick");
  expect(normalizeEquippedAxe({axe:"grandpas_axe"},g,m)).toBe("stick");
  g.crafts.maul=true;
  expect(normalizeEquippedAxe(null,g,m)).toBe("wood_axe");
  m.up.axe=1;
  expect(normalizeEquippedAxe(undefined,g,m)).toBe("grandpas_axe");
  expect(normalizeEquippedAxe("stick",g,m)).toBe("stick");
 });
 it("old permanent buyers retain Grandpa's Axe, explicit Stick preferences survive new runs",()=>{
  storage.set("sekampfire-meta-v1",JSON.stringify({
   ash:14,totalAsh:30,up:{axe:1}
  }));
  const old=loadMeta();
  expect(old.axeEquipped).toBe("grandpas_axe");
  expect(defaultPermanentAxe(old)).toBe("grandpas_axe");
  expect(equipAxe(run(),old,"stick")).toBe(true);
  saveMeta(old);
  expect(loadMeta().axeEquipped).toBe("stick");
  expect(defaultPermanentAxe(loadMeta())).toBe("stick");
 });
 it("old v1 runs without an equipment field migrate to strongest owned, without altering Ash",()=>{
  const g=run(),m=meta();m.up.axe=1;g.crafts.maul=true;
  g.equippedAxe="grandpas_axe";
  const snap=captureRunSnapshot(g);
  expect(snap.version).toBe(1);
  expect(snap.state.equippedAxe).toBe("grandpas_axe");
  const legacy={...snap.state};delete legacy.equippedAxe;
  const resumed=createEngine();resumed.resumeData=legacy;
  titleActions(resumed,m)[0].act();
  expect(resumed.equippedAxe).toBe("grandpas_axe");
  expect(m.ash).toBe(99);
  const revised=createEngine();revised.resumeData={...snap.state,equippedAxe:"stick"};
  titleActions(revised,m)[0].act();
  expect(revised.equippedAxe).toBe("stick");
  expect(captureRunSnapshot(revised)?.state.equippedAxe).toBe("stick");
 });
 it("crafting Wood Axe and buying Grandpa's Axe auto-equips like old progression",()=>{
  const g=run(),m=meta();g.menu="bench";g.builtBench=true;
  g.player.wood=5;g.craftTab=0;
  const recipe=benchRows(g,m).find((r:any)=>r.label==="WOOD AXE");
  expect(recipe).toBeDefined();
  recipe!.onDown();recipe!.onDown();
  expect(g.crafts.maul).toBe(true);
  expect(g.equippedAxe).toBe("wood_axe");
  expect(choppingSeconds(g,m)).toBe(.7);
  g.shopTab=0;
  const card=shopRows(g,m).find((r:any)=>r.label.includes("GRANDPAS AXE"));
  expect(card).toBeDefined();
  card!.onDown();card!.onDown();
  expect(m.up.axe).toBe(1);
  expect(g.equippedAxe).toBe("grandpas_axe");
  expect(loadMeta().axeEquipped).toBe("grandpas_axe");
 });
});

describe("Patch #50: side-by-side backpack and real touch/keyboard equipment",()=>{
 it("keeps the entire 20-slot backpack left while Axe/Pet are always visible right",()=>{
  const g=run(),m=meta();
  const picture=render(g,m);
  expect(g.menuRect).toEqual(INVENTORY_MODAL);
  expect(BAG_GRID.cols*BAG_GRID.rows).toBe(20);
  expect(BAG_GRID.x+5*BAG_GRID.size+4*BAG_GRID.gap).toBeLessThan(160);
  expect(EQUIPMENT_SLOTS50.axe.x).toBeGreaterThan(160);
  expect(EQUIPMENT_SLOTS50.pet.x).toBeGreaterThan(EQUIPMENT_SLOTS50.axe.x);
  expect(g.zones.filter((z:any)=>z.w===22&&z.h===22)).toHaveLength(5);
  expect(g.zones.some((z:any)=>z.x===EQUIPMENT_SLOTS50.axe.x
    &&z.y===EQUIPMENT_SLOTS50.axe.y)).toBe(true);
  expect(g.zones.some((z:any)=>z.x===EQUIPMENT_SLOTS50.pet.x
    &&z.y===EQUIPMENT_SLOTS50.pet.y)).toBe(true);
  expect(picture.rects.every(r=>r.x>=18&&r.y>=8
    &&r.x+r.w<=302&&r.y+r.h<=172)).toBe(true);
 });
 it("select an owned axe from the right and explicitly Equip, then Unequip to Stick",()=>{
  const g=run(),m=meta();g.crafts.maul=true;m.up.axe=1;
  render(g,m);tap(g,170,53); // Axe socket
  expect(g.inventoryTab).toBe(1);
  expect(g.inventoryGearType).toBe("axe");
  render(g,m);tap(g,216,112); // Wood Axe choice in center
  expect(g.inventoryGearChoice).toBe("wood_axe");
  render(g,m);tap(g,EQUIPMENT_ACTION50.x+6,EQUIPMENT_ACTION50.y+6);
  expect(g.equippedAxe).toBe("wood_axe");
  expect(choppingToolTier(g,m)).toBe(1);
  render(g,m);tap(g,EQUIPMENT_ACTION50.x+6,EQUIPMENT_ACTION50.y+6);
  expect(g.equippedAxe).toBe("stick");
  expect(g.crafts.maul).toBe(true);
  render(g,m);
  tap(g,174,112); // Stick option on the left
  expect(g.inventoryGearChoice).toBe("stick");
 });
 it("keyboard moves between categories and options without triggering world ACT",()=>{
  const g=run(),m=meta();g.crafts.maul=true;m.up.dog=1;
  chooseEquipmentCategory50(g,m,"axe");
  navigateEquipment50(g,m,1,0);
  expect(g.inventoryGearChoice).toBe("wood_axe");
  expect(activateEquipment50(g,m)).toBe(true);
  expect(g.equippedAxe).toBe("wood_axe");
  navigateEquipment50(g,m,0,1);
  expect(g.inventoryGearType).toBe("pet");
  expect(g.inventoryGearChoice).toBe("bingsu");
  expect(activateEquipment50(g,m)).toBe(true);
  expect(equippedPet(m)).toBe("dog");
  expect(g.menu).toBe("inventory");
  expect(g.keys.act).toBeFalsy();
 });
 it("Bingsu can be equipped and unequipped in Inventory, never through Shop",()=>{
  const g=run(),m=meta();m.up.dog=1;m.petEquipped=null;
  expect(ownedPetOptions(m)).toEqual(["dog"]);
  render(g,m);tap(g,235,53);
  expect(g.inventoryGearType).toBe("pet");
  render(g,m);tap(g,EQUIPMENT_ACTION50.x+3,EQUIPMENT_ACTION50.y+4);
  expect(activePet(m)).toBe("dog");
  expect(loadMeta().petEquipped).toBe("dog");
  expect(shopRows({...g,shopTab:1},m)[0].right).toBe("OWNED");
  render(g,m);tap(g,EQUIPMENT_ACTION50.x+3,EQUIPMENT_ACTION50.y+4);
  expect(activePet(m)).toBeNull();
  expect(loadMeta().petEquipped).toBeNull();
  expect(m.up.dog).toBe(1);
 });
 it("unequipping Bingsu conserves his carried real logs",()=>{
  const g=run(),m=meta();g.pickups=[];m.up.dog=1;m.petEquipped="dog";
  g.dog={x:g.player.x+12,y:g.player.y,dir:1,wood:2,phase:"idle"};
  chooseEquipmentCategory50(g,m,"pet");
  expect(activateEquipment50(g,m)).toBe(true);
  updateDogCompanion(g,m,.1);
  expect(g.dog).toBeNull();
  expect(g.pickups).toHaveLength(1);
  expect(g.pickups[0].w).toBe(2);
 });
 it("new owned gear does not enter backpack wood stacks or alter weight",()=>{
  const g=run(),m=meta();g.crafts.maul=true;m.up.axe=1;m.up.dog=1;
  const count=g.player.wood;
  const owned=inventoryEquipment(g,m);
  expect(owned.map(x=>x.id)).toContain("wood_axe");
  expect(owned.map(x=>x.id)).toContain("grandpas_axe");
  expect(owned.map(x=>x.id)).toContain("bingsu");
  expect(g.inventory.slots.filter((x:any)=>x!==null)).toHaveLength(1);
  expect(g.player.wood).toBe(count);
 });
 it("the existing inventory Ember Torch can still be assigned to Quick Slots",()=>{
  const g=run(),m=meta();g.crafts.torch=true;
  chooseEquipmentCategory50(g,m,"tools");
  render(g,m);
  expect(g.inventoryGearChoice).toBe("ember_torch");
  tap(g,185,156);
  expect(g.quickSlots[0]).toBe("ember_torch");
  render(g,m);tap(g,244,156);
  expect(g.quickSlots[1]).toBe("ember_torch");
 });
});
