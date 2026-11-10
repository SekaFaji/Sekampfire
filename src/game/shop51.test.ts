import {beforeEach,afterEach,describe,expect,it,vi} from "vitest";
import {createEngine,drawMenu,handleKey,shopRows} from "./game";
import {SHOP_CARD51,SHOP_DETAILS51,SHOP_BUY51,drawShopTabs} from "./menuScreens";
import {SHOP_CARD_LABEL51,SHOP_CARD_BENEFIT51,drawShopCardIcon51} from "./shopCards51";
import {drawBingsuPortrait,BINGSU} from "./bingsu";
import {drawBingsuWorldSprite} from "./bingsuWorld49";
import {loadMeta} from "./save";
import {activePet} from "./companion";

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

const meta=()=>({
 ash:160,totalAsh:200,up:{} as Record<string,number>,petEquipped:null as "dog"|null,
 axeEquipped:"stick",museumBuilt:false,guideFx:true
});
function world(){
 const g=createEngine();
 g.ui="run";g.menu="shop";g.shopTab=0;g.menuSel=0;g.zones=[];
 return g;
}
function canvas(){
 const pixels:{x:number;y:number;w:number;h:number;ink:string}[]=[];
 let fill="";
 const ctx:any={
  set fillStyle(v:string){fill=v;},get fillStyle(){return fill;},
  fillRect(x:number,y:number,w:number,h:number){
   expect([x,y,w,h].every(Number.isFinite)).toBe(true);
   expect(w).toBeGreaterThan(0);
   expect(h).toBeGreaterThan(0);
   pixels.push({x,y,w,h,ink:fill});
  }
 };
 return {ctx,pixels};
}
function render(g:any,m:any){
 const v=canvas();g.zones=[];
 drawShopTabs(v.ctx,g,m,shopRows(g,m),()=>{g.menu=null});
 return v;
}
function findHit(g:any,x:number,y:number){
 return [...g.zones].reverse().find((z:any)=>
  x>=z.x&&x<z.x+z.w&&y>=z.y&&y<z.y+z.h);
}
function tap(g:any,x:number,y:number){
 const z=findHit(g,x,y);
 expect(z).toBeDefined();
 z.onDown();
}
const cardCenter=(index:number)=>{
 const {x,y,w,h,colGap,rowGap,cols}=SHOP_CARD51;
 return {
  x:x+(index%cols)*(w+colGap)+w/2,
  y:y+Math.floor(index/cols)*(h+rowGap)+h/2
 };
};

describe("Patch #51: Ash Shop six compact pixel-art cards",()=>{
 it("renders six readable native cards, fixed tab/header and a dedicated bottom inspector",()=>{
  const g=world(),m=meta(),v=render(g,m);
  const cardZones=g.zones.filter((z:any)=>z.w===SHOP_CARD51.w&&z.h===SHOP_CARD51.h);
  expect(cardZones).toHaveLength(6);
  expect(cardZones.map((z:any)=>[z.x,z.y])).toEqual([
   [30,52],[118,52],[206,52],[30,85],[118,85],[206,85]
  ]);
  const close=g.zones.find((z:any)=>z.x===278&&z.y===13);
  expect(close).toBeDefined();
  const tabs=g.zones.filter((z:any)=>z.y===33&&z.h===16);
  expect(tabs).toHaveLength(3);
  expect(tabs.every((z:any)=>z.y>=close.y+close.h)).toBe(true);
  expect(SHOP_DETAILS51.y).toBeGreaterThan(
   SHOP_CARD51.y+SHOP_CARD51.h*2+SHOP_CARD51.rowGap-1);
  expect(v.pixels.every(r=>r.x>=24&&r.y>=8&&r.x+r.w<=296&&r.y+r.h<=172)).toBe(true);
  expect(Object.keys(SHOP_CARD_LABEL51)).toHaveLength(8); // 7 upgrade icons plus Bingsu
  expect(Object.values(SHOP_CARD_BENEFIT51).every(s=>s.length>10)).toBe(true);
 });
 it("tapping a card ONLY selects details and cannot spend banked or run Ash",()=>{
  const g=world(),m=meta();g.ashEarned=888;
  render(g,m);const c=cardCenter(3);tap(g,c.x,c.y);
  expect(g.menuSel).toBe(3);
  expect(m.ash).toBe(160);
  expect(g.ashEarned).toBe(888);
  expect(m.up.axe).toBeUndefined();
  render(g,m);
  expect(findHit(g,SHOP_BUY51.x+4,SHOP_BUY51.y+4)).toBeDefined();
 });
 it("BUY spends exact live costs, increments the correct level and never repurchases MAX",()=>{
  const g=world(),m=meta();
  // Warm Blood: 12, 26, 45 - costs from existing config, unchanged.
  for(const [prior,price,after] of [[160,12,148],[148,26,122],[122,45,77]]){
   render(g,m);
   tap(g,SHOP_BUY51.x+5,SHOP_BUY51.y+5);
   expect(m.ash).toBe(after);
   expect(prior-price).toBe(after);
  }
  expect(m.up.blood).toBe(3);
  render(g,m);
  expect(g.zones.find((z:any)=>z.x===SHOP_BUY51.x&&z.y===SHOP_BUY51.y))
   .toBeUndefined();
  expect(shopRows(g,m)[0].maxed).toBe(true);
  expect(m.ash).toBe(77);
  const saved=loadMeta();
  expect(saved.up.blood).toBe(3);expect(saved.ash).toBe(77);
 });
 it("owning or lacking Ash still allows looking at a card, never creates BUY hitboxes",()=>{
  const g=world(),m=meta();m.ash=0;
  render(g,m);
  const c=cardCenter(5);tap(g,c.x,c.y);
  expect(g.menuSel).toBe(5);
  expect(shopRows(g,m)[5].canBuy).toBe(false);
  render(g,m);
  expect(findHit(g,SHOP_BUY51.x+15,SHOP_BUY51.y+7)).toBeUndefined();
  expect(m.ash).toBe(0);
  m.up.scarf=1;
  render(g,m);
  expect(shopRows(g,m)[5].maxed).toBe(true);
  expect(findHit(g,SHOP_BUY51.x+15,SHOP_BUY51.y+7)).toBeUndefined();
 });
 it("clicking upgrade tabs never purchases an item or closes the modal",()=>{
  const g=world(),m=meta();
  render(g,m);tap(g,151,39);
  expect(g.shopTab).toBe(1);expect(g.menuSel).toBe(0);
  expect(m.ash).toBe(160);
  render(g,m);tap(g,245,39);
  expect(g.shopTab).toBe(2);
  render(g,m);
  expect(g.zones.filter((z:any)=>z.x===SHOP_BUY51.x)).toHaveLength(0);
  expect(g.menu).toBe("shop");
  expect(m.up.dog).toBeUndefined();
 });
 it("keyboard chooses a card with arrows, then uses the explicit BUY action",()=>{
  const g=world(),m=meta();
  render(g,m);
  handleKey(g,m,"arrowdown",true);
  expect(g.menuSel).toBe(1);
  expect(m.ash).toBe(160);
  handleKey(g,m,"enter",true);
  expect(m.ash).toBe(146);
  expect(m.up.flint).toBe(1);
  expect(m.up.blood).toBeUndefined();
  handleKey(g,m,"arrowright",true);
  expect(g.shopTab).toBe(1);
  expect(g.menuSel).toBe(0);
  expect(m.ash).toBe(146);
 });
 it("does not use run-earned Ash to buy while the player is in a run",()=>{
  const g=world(),m=meta();m.ash=0;g.ashEarned=9999;
  render(g,m);expect(shopRows(g,m)[0].canBuy).toBe(false);
  expect(findHit(g,SHOP_BUY51.x+6,SHOP_BUY51.y+6)).toBeUndefined();
  expect(m.ash).toBe(0);expect(g.ashEarned).toBe(9999);
 });
});

describe("Patch #51: Bingsu is SHE, no collar, authentic white Dogo Argentino",()=>{
 it("pet is a large portrait card with a distinct buy button and exact 40 Ash",()=>{
  const g=world(),m=meta();g.shopTab=1;m.ash=40;
  const v=render(g,m);
  expect(g.zones.some((z:any)=>z.x===31&&z.y===52&&z.w===73&&z.h===66))
   .toBe(true);
  expect(v.pixels.some(p=>p.ink==="#fafaf4")).toBe(true);
  tap(g,55,64);
  expect(m.ash).toBe(40);expect(m.up.dog).toBeUndefined();
  render(g,m);
  tap(g,SHOP_BUY51.x+6,SHOP_BUY51.y+7);
  expect(m.ash).toBe(0);
  expect(m.up.dog).toBe(1);
  expect(m.petEquipped).toBe("dog");
  expect(activePet(m)).toBe("dog");
  render(g,m);
  expect(shopRows(g,m)[0].maxed).toBe(true);
  expect(findHit(g,SHOP_BUY51.x+5,SHOP_BUY51.y+5)).toBeUndefined();
 });
 it("her portrait and world sprite are entirely collar-free, with white neck",()=>{
  const v=canvas();
  drawBingsuPortrait(v.ctx,40,20);
  expect(v.pixels.some(p=>p.ink==="#f8f8f1")).toBe(true);
  expect(v.pixels.some(p=>p.ink==="#252e30")).toBe(true);
  for(const red of ["#a95745","#d47e63","#e2c47b","#b2644e"])
    expect(v.pixels.some(p=>p.ink===red)).toBe(false);
  const dog=canvas();
  drawBingsuWorldSprite(dog.ctx,{x:120,y:150,dir:1,phase:"idle",
   gait:0,motion:0,wood:2},0);
  expect(dog.pixels.filter(p=>p.ink==="#553824")).toHaveLength(2);
  for(const color of ["#a95745","#d47e63","#b2644e","#e3b76b"])
    expect(dog.pixels.some(p=>p.ink===color)).toBe(false);
  expect(BINGSU.breed).toBe("DOGO ARGENTINO");
  expect(SHOP_CARD_BENEFIT51.dog).toContain("SHE");
 });
 it("the pet tab is visually bounded and the three-tab close hitbox remains clear",()=>{
  const g=world(),m=meta();g.shopTab=1;
  const v=render(g,m);
  expect(v.pixels.every(p=>p.x>=24&&p.y>=8&&p.x+p.w<=296
    &&p.y+p.h<=172)).toBe(true);
  const close=findHit(g,284,18);
  expect(close).toBeDefined();
  close.onDown();
  expect(g.menu).toBeNull();
 });
 it("icon artwork for every upgrade is real rectangle art, without emoji",()=>{
  for(const id of Object.keys(SHOP_CARD_LABEL51) as Array<keyof typeof SHOP_CARD_LABEL51>){
   const v=canvas();
   drawShopCardIcon51(v.ctx,id,0,0);
   expect(v.pixels.length).toBeGreaterThan(4);
   expect(v.pixels.every(p=>p.x>=0&&p.y>=0&&p.x+p.w<=14&&p.y+p.h<=14)).toBe(true);
  }
 });
});
