import {beforeEach,afterEach,describe,expect,it,vi} from "vitest";
import {createEngine,shopRows,handlePointer,handleWheel,handleKey} from "./game";
import {drawShopTabs,SHOP_CARD51,SHOP_DETAILS51,SHOP_BUY51} from "./menuScreens";
import {textW} from "./font";
import {SHOP_CARD_LABEL51} from "./shopCards51";
import {SHOP_CATEGORIES60,SHOP_SIDEBAR60,SHOP_TILE_NAME60,SHOP_UPGRADE_CATEGORY60,chooseShopCategory60,shopCategory60,visibleShopUpgrades60} from "./shopCategories60";
import {SHOP_VIEW58,SHOP_SCROLLBAR58,shopMaxScroll58,moveShopScroll58,
  clampShopScroll58,revealShopCard58,tickShopScroll58,wheelShop58,
  insideShopViewport58} from "./shopScroll58";

let store:Map<string,string>;
beforeEach(()=>{
 store=new Map();
 vi.stubGlobal("localStorage",{
  getItem:(key:string)=>store.get(key)??null,
  setItem:(key:string,value:string)=>store.set(key,String(value)),
  removeItem:(key:string)=>store.delete(key)
 });
});
afterEach(()=>vi.unstubAllGlobals());
const meta=()=>({ash:200,totalAsh:200,up:{} as Record<string,number>,petEquipped:null});
const world=()=>{
 const g=createEngine();g.ui="run";g.menu="shop";g.shopTab=0;
 g.menuSel=0;g.shopScroll=0;g.shopVelocity=0;g.zones=[];
 return g;
};
function render(g:any,m:any,rows:any[]=shopRows(g,m)){
 const rectangles:{x:number;y:number;w:number;h:number;ink:string}[]=[];
 let ink="";
 const clips:any[]=[];
 const ctx:any={
   set fillStyle(v:string){ink=v;},get fillStyle(){return ink;},
   fillRect(x:number,y:number,w:number,h:number){
     expect([x,y,w,h].every(Number.isFinite)).toBe(true);
     expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
     rectangles.push({x,y,w,h,ink});
   },
   save:()=>{},restore:()=>{},beginPath:()=>{},
   rect:(x:number,y:number,w:number,h:number)=>clips.push({x,y,w,h}),
   clip:()=>{}
 };
 g.zones=[];g.menuZonesFor="shop";g.menuZonesStart=0;
 drawShopTabs(ctx,g,m,rows,()=>{g.menu=null;});
 return {rectangles,clips};
}
function find(g:any,x:number,y:number){
 return [...g.zones].reverse().find((z:any)=>x>=z.x&&y>=z.y&&x<z.x+z.w&&y<z.y+z.h);
}
/** UI stress fixture with exactly sixteen entries; the real eleven Ash
 * upgrades already use this same clipped scrolling path. */
function overflowing(g:any,m:any){
 const originals=shopRows(g,m);
 return [...originals,...originals].slice(0,16);
}
describe("Patch #60: sidebar and compact two-row Ash Shop",()=>{
 it("shows 4 x 2 complete 41-pixel squares beside a nonoverlapping sidebar",()=>{
   const g=world(),m=meta(),v=render(g,m);
   expect(SHOP_CARD51).toMatchObject({x:86,y:51,w:41,h:41,colGap:5,rowGap:3,cols:4});
   expect(SHOP_CARD51.w).toBe(SHOP_CARD51.h);
   expect(SHOP_VIEW58).toEqual({x:85,y:51,w:188,h:85});
   expect(SHOP_DETAILS51).toEqual({x:30,y:138,w:260,h:27});
   expect(SHOP_VIEW58.y+SHOP_VIEW58.h).toBeLessThan(SHOP_DETAILS51.y);
   expect(SHOP_SIDEBAR60.x+SHOP_SIDEBAR60.w).toBeLessThan(SHOP_VIEW58.x);
   expect(SHOP_SCROLLBAR58.x).toBeGreaterThan(
     SHOP_CARD51.x+SHOP_CARD51.w*4+SHOP_CARD51.colGap*3);
   expect(v.clips).toEqual([SHOP_VIEW58]);
   const cards=g.zones.filter((z:any)=>z.shopCardIndex58!==undefined);
   expect(cards).toHaveLength(8);
   expect(cards.map((z:any)=>[z.x,z.y,z.w,z.h])).toEqual([
     [86,51,41,41],[132,51,41,41],[178,51,41,41],[224,51,41,41],
     [86,95,41,41],[132,95,41,41],[178,95,41,41],[224,95,41,41]
   ]);
   expect(g.zones.filter((z:any)=>z.shopCategory60!==undefined)).toHaveLength(4);
   expect(cards.every((z:any)=>z.y>=51&&z.y+z.h<=136)).toBe(true);
   expect(g.zones.some((z:any)=>z.x===SHOP_BUY51.x&&z.y===SHOP_BUY51.y))
     .toBe(true);
   expect(v.rectangles.every(p=>p.x>=24&&p.y>=8&&p.x+p.w<=296&&p.y+p.h<=172))
     .toBe(true);
 });
 it("short card labels fit fully; the inspector retains the original full names",()=>{
   const g=world(),m=meta();render(g,m);
   for(const r of shopRows(g,m)){
     const short=SHOP_TILE_NAME60[r.id];
     expect(short).toBeDefined();
     expect(textW(short)).toBeLessThanOrEqual(SHOP_CARD51.w-4);
     expect(SHOP_CARD_LABEL51[r.id as keyof typeof SHOP_CARD_LABEL51]).toBeDefined();
   }
   expect(SHOP_UPGRADE_CATEGORY60.legacy).toBe("camp");
   expect(SHOP_CATEGORIES60.map(c=>c.id)).toEqual(["all","survival","equipment","camp"]);
 });
 it("filters existing real upgrades, retaining prices and ownership unchanged",()=>{
   const g=world(),m=meta();render(g,m);
   const baseline=shopRows(g,m).map((r:any)=>[r.id,r.cost]);
   expect(baseline.map(x=>x[0])).toEqual(
     ["blood","flint","pack","axe","blue","scarf","legacy","hearth","fence","workshop","storage"]);
   for(const [category,expected] of [
     ["survival",["blood","flint","scarf"]],
     ["equipment",["pack","axe"]],
     ["camp",["blue","legacy","hearth","fence","workshop","storage"]]
   ] as const){
     chooseShopCategory60(g,category);
     expect(shopCategory60(g)).toBe(category);
     expect(shopRows(g,m).map((r:any)=>r.id)).toEqual(expected);
     const ui=render(g,m);
     expect(g.zones.filter((z:any)=>z.shopCardIndex58!==undefined))
       .toHaveLength(expected.length);
     expect(ui.clips).toEqual([SHOP_VIEW58]);
     expect(m.ash).toBe(200);
     expect(m.up).toEqual({});
   }
   chooseShopCategory60(g,"all");
   expect(shopRows(g,m).map((r:any)=>[r.id,r.cost])).toEqual(baseline);
   expect(visibleShopUpgrades60(shopRows(g,m),"all")).toHaveLength(11);
 });
 it("the sidebar is interactive and switches categories without spending Ash",()=>{
   const g=world(),m=meta();g.ashEarned=999;
   render(g,m);
   const first=g.zones.filter((z:any)=>z.shopCategory60!==undefined);
   expect(first.map((z:any)=>[z.shopCategory60,z.x,z.y,z.w,z.h])).toEqual([
     ["all",30,51,50,19],["survival",30,73,50,19],
     ["equipment",30,95,50,19],["camp",30,117,50,19]
   ]);
   first[3].onDown(); // Camp
   expect(g.menuSel).toBe(0);
   expect(g.shopScroll).toBe(0);
   expect(g.shopVelocity).toBe(0);
   expect(m.ash).toBe(200);
   render(g,m);
   expect(shopRows(g,m).map((r:any)=>r.id)).toEqual(["blue","legacy","hearth","fence","workshop","storage"]);
   const card=g.zones.find((z:any)=>z.shopCardIndex58===1);
   card.onDown();
   expect(g.menuSel).toBe(1);
   expect(m.up.legacy).toBeUndefined();
   expect(m.ash).toBe(200);
   // One explicit BUY, not a category change or a card tap, purchases.
   render(g,m);
   const buy=find(g,SHOP_BUY51.x+5,SHOP_BUY51.y+6);
   expect(buy).toBeDefined();
   buy.onDown();
   expect(m.up.legacy).toBe(1);
   expect(m.ash).toBe(165);
   expect(g.ashEarned).toBe(999);
   render(g,m);
   expect(shopRows(g,m)[1].cost).toBe(60);
 });
 it("changing categories resets stale selection and inertia; keeps pet tab untouched",()=>{
   const g=world(),m=meta();render(g,m);
   g.menuSel=6;g.shopVelocity=95;g.shopScroll=40;
   chooseShopCategory60(g,"equipment");
   expect(g.menuSel).toBe(0);expect(g.shopScroll).toBe(0);
   expect(g.shopVelocity).toBe(0);
   expect(g.shopUpgradeCount58).toBe(0);
   render(g,m);
   expect(g.shopUpgradeCount58).toBe(2);
   g.shopTab=1;render(g,m);
   expect(shopRows(g,m).map((r:any)=>r.id)).toEqual(["dog"]);
   expect(find(g,SHOP_BUY51.x+5,SHOP_BUY51.y+6)).toBeDefined();
   expect(m.ash).toBe(200);
   g.shopTab=0;chooseShopCategory60(g,"all");render(g,m);
   expect(shopRows(g,m)).toHaveLength(11);
 });
 it("C keyboard shortcut cycles categories and Arrow navigation stays inside each",()=>{
   const g=world(),m=meta();render(g,m);
   handleKey(g,m,"c",true);
   expect(shopCategory60(g)).toBe("survival");
   expect(shopRows(g,m)).toHaveLength(3);
   handleKey(g,m,"arrowdown",true);
   expect(g.menuSel).toBe(1);
   handleKey(g,m,"c",true);
   expect(shopCategory60(g)).toBe("equipment");
   expect(g.menuSel).toBe(0);
   expect(shopRows(g,m).map((r:any)=>r.id)).toEqual(["pack","axe"]);
   handleKey(g,m,"c",true);
   expect(shopCategory60(g)).toBe("camp");
   handleKey(g,m,"c",true);
   expect(shopCategory60(g)).toBe("all");
   expect(m.ash).toBe(200);
   handleKey(g,m,"arrowright",true);
   expect(g.shopTab).toBe(1); // original top-tab keyboard navigation
 });
 it("a maxed upgrade fills its progress strip without altering banked Ash",()=>{
   const g=world(),m=meta();m.up.blood=3;
   const v=render(g,m);
   expect(v.rectangles.some(r=>r.x===89&&r.y===88&&r.w===35&&r.h===2
     &&r.ink==="#9cd0a9")).toBe(true);
   expect(m.ash).toBe(200);
 });
 it("two full rows need no scroll; future third and fourth rows retain scrolling",()=>{
   const g=world(),m=meta();render(g,m);
   expect(shopMaxScroll58(0)).toBe(0);
   expect(shopMaxScroll58(7)).toBe(0);
   expect(shopMaxScroll58(8)).toBe(0);
   expect(shopMaxScroll58(9)).toBe(44);
   expect(shopMaxScroll58(16)).toBe(88);
   expect(moveShopScroll58(g,999,7)).toBe(0);
   const fake=overflowing(g,m);
   render(g,m,fake);
   expect(handleWheel(g,25,105,90)).toBe(true);
   expect(g.shopScroll).toBe(25);
   render(g,m,fake);
   expect(handleWheel(g,40,105,90)).toBe(true);
   expect(g.shopScroll).toBe(65);
   render(g,m,fake);
   expect(g.zones.some((z:any)=>z.shopCardIndex58===12)).toBe(true);
   expect(g.zones.filter((z:any)=>z.shopCardIndex58!==undefined)
     .every((z:any)=>z.y>=SHOP_VIEW58.y&&z.y+z.h<=SHOP_VIEW58.y+SHOP_VIEW58.h))
     .toBe(true);
   expect(m.ash).toBe(200);
   moveShopScroll58(g,999,16);
   expect(g.shopScroll).toBe(88);
   moveShopScroll58(g,-999,16);
   expect(g.shopScroll).toBe(0);
   g.shopScroll=Infinity;
   expect(clampShopScroll58(g,16)).toBe(0);
   expect(moveShopScroll58(g,NaN,16)).toBe(0);
 });
 it("dragging an overflowing list coasts but never selects or buys",()=>{
   const g=world(),m=meta(),fake=overflowing(g,m);
   render(g,m,fake);
   handlePointer(g,"down",101,110,105);
   expect(g.pointers[101].shopScroll58).toBe(true);
   handlePointer(g,"move",101,110,90);
   expect(g.shopScroll).toBe(15);
   handlePointer(g,"move",101,110,75);
   expect(g.shopScroll).toBe(30);
   handlePointer(g,"up",101,0,0);
   expect(g.menuSel).toBe(0);expect(m.ash).toBe(200);
   const before=g.shopScroll;
   tickShopScroll58(g,0.016,16);
   expect(g.shopScroll).toBeGreaterThan(before);
   for(let i=0;i<300;i++)tickShopScroll58(g,0.016,16);
   expect(g.shopScroll).toBeLessThanOrEqual(88);
   expect(g.shopVelocity).toBe(0);
   expect(m.up).toEqual({});
 });
 it("a tiny-finger-jitter tap selects the correct square and BUY alone spends",()=>{
   const g=world(),m=meta();render(g,m);
   handlePointer(g,"down",12,238,68); // AXE, fourth tile
   handlePointer(g,"move",12,239,70);
   handlePointer(g,"up",12,0,0);
   expect(g.menuSel).toBe(3);
   expect(m.ash).toBe(200);
   render(g,m);
   handlePointer(g,"down",13,SHOP_BUY51.x+5,SHOP_BUY51.y+5);
   expect(m.up.axe).toBe(1);
   expect(m.ash).toBe(180);
   handlePointer(g,"up",13,0,0);
   expect(m.ash).toBe(180);
 });
 it("wheel over the sidebar, tabs, BUY or pet portrait never moves cards",()=>{
   const g=world(),m=meta();render(g,m);
   expect(handleWheel(g,70,46,90)).toBe(false);
   expect(handleWheel(g,70,220,148)).toBe(false);
   expect(handleWheel(g,70,150,40)).toBe(false);
   expect(g.shopScroll).toBe(0);
   g.shopTab=1;render(g,m);
   expect(handleWheel(g,70,100,70)).toBe(false);
   expect(wheelShop58(g,20,16)).toBe(false);
 });
 it("partial off-screen hitboxes remain clipped and never overlap the inspector",()=>{
   const g=world(),m=meta(),fake=overflowing(g,m);
   g.shopScroll=20;
   const v=render(g,m,fake);
   const cards=g.zones.filter((z:any)=>z.shopCardIndex58!==undefined);
   expect(cards.some((z:any)=>z.h<SHOP_CARD51.h)).toBe(true);
   expect(cards.every((z:any)=>z.y>=SHOP_VIEW58.y&&
     z.y+z.h<=SHOP_VIEW58.y+SHOP_VIEW58.h)).toBe(true);
   expect(v.clips).toEqual([SHOP_VIEW58]);
   expect(find(g,110,SHOP_DETAILS51.y+5)?.shopCardIndex58).toBeUndefined();
 });
 it("keyboard reveal supports a future overflowing category without a page system",()=>{
   const g=world(),m=meta(),fake=overflowing(g,m);render(g,m,fake);
   g.menuSel=15;
   revealShopCard58(g,15,16);
   expect(g.shopScroll).toBe(88);
   render(g,m,fake);
   const last=g.zones.find((z:any)=>z.shopCardIndex58===15);
   expect(last).toBeDefined();
   expect(last.h).toBe(41);
   expect(m.ash).toBe(200);
 });
 it("no changes to banked Ash, pet ownership or running Ash from scrolling",()=>{
   const g=world(),m=meta(),fake=overflowing(g,m);
   m.ash=0;g.ashEarned=777;render(g,m,fake);
   handleWheel(g,150,110,88);
   handlePointer(g,"down",88,111,110);
   handlePointer(g,"move",88,111,70);
   handlePointer(g,"up",88,0,0);
   render(g,m);
   expect(g.zones.some((z:any)=>z.x===SHOP_BUY51.x&&z.y===SHOP_BUY51.y))
     .toBe(false);
   expect(m.ash).toBe(0);expect(g.ashEarned).toBe(777);
   expect(m.up).toEqual({});
 });
});
