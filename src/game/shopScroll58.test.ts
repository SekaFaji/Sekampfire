import {beforeEach,afterEach,describe,expect,it,vi} from "vitest";
import {createEngine,shopRows,handlePointer,handleWheel,handleKey} from "./game";
import {drawShopTabs,SHOP_CARD51,SHOP_DETAILS51,SHOP_BUY51} from "./menuScreens";
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
function render(g:any,m:any){
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
 drawShopTabs(ctx,g,m,shopRows(g,m),()=>{g.menu=null;});
 return {rectangles,clips};
}
function find(g:any,x:number,y:number){
 return [...g.zones].reverse().find((z:any)=>x>=z.x&&y>=z.y&&x<z.x+z.w&&y<z.y+z.h);
}
describe("Patch #58: scrollable Ash Shop geometry",()=>{
 it("has four square cards across the fixed Shop viewport",()=>{
   expect(SHOP_CARD51).toMatchObject({x:30,y:52,w:59,h:59,cols:4,colGap:6,rowGap:5});
   expect(SHOP_CARD51.w).toBe(SHOP_CARD51.h);
   expect(SHOP_VIEW58).toEqual({x:30,y:52,w:260,h:64});
   expect(SHOP_VIEW58.y+SHOP_VIEW58.h).toBeLessThan(SHOP_DETAILS51.y);
   expect(SHOP_SCROLLBAR58.x).toBeGreaterThan(
     SHOP_CARD51.x+SHOP_CARD51.w*4+SHOP_CARD51.colGap*3);
   const g=world(),m=meta(),v=render(g,m);
   expect(v.clips).toEqual([SHOP_VIEW58]);
   const cards=g.zones.filter((z:any)=>z.shopCardIndex58!==undefined);
   expect(cards).toHaveLength(4);
   expect(cards.map((z:any)=>[z.x,z.y])).toEqual([
     [30,52],[95,52],[160,52],[225,52]
   ]);
   expect(cards.every((z:any)=>z.y>=52&&z.y+z.h<=116)).toBe(true);
   expect(g.zones.some((z:any)=>z.x===SHOP_BUY51.x&&z.y===SHOP_BUY51.y))
     .toBe(true);
 });
 it("scroll range is derived from rows; clamps all malformed inputs safely",()=>{
   expect(shopMaxScroll58(0)).toBe(0);
   expect(shopMaxScroll58(2)).toBe(0);
   expect(shopMaxScroll58(4)).toBe(0); // one full square row fits
   expect(shopMaxScroll58(7)).toBe(59);
   const g=world();
   expect(moveShopScroll58(g,999,7)).toBe(59);
   expect(moveShopScroll58(g,-999,7)).toBe(0);
   g.shopScroll=Infinity;
   expect(clampShopScroll58(g,7)).toBe(0);
   expect(moveShopScroll58(g,NaN,7)).toBe(0);
 });
 it("wheel scroll changes offset only, not selected upgrade or banked Ash",()=>{
   const g=world(),m=meta();render(g,m);
   expect(handleWheel(g,40,148,84)).toBe(true);
   expect(g.shopScroll).toBe(40);expect(g.menuSel).toBe(0);
   expect(m.ash).toBe(200);expect(m.up).toEqual({});
   render(g,m);
   const peek=g.zones.find((z:any)=>z.shopCardIndex58===6);
   expect(peek).toBeDefined(); // after scrolling, lower square row appears
   expect(peek.h).toBe(40); // clipped to the 64px card viewport
   expect(handleWheel(g,40,148,84)).toBe(true);
   expect(g.shopScroll).toBe(59);
   render(g,m);
   expect(g.zones.some((z:any)=>z.shopCardIndex58===6)).toBe(true);
   expect(g.zones.every((z:any)=>z.shopCardIndex58===undefined||
     z.y>=SHOP_VIEW58.y&&z.y+z.h<=SHOP_VIEW58.y+SHOP_VIEW58.h)).toBe(true);
   expect(handleWheel(g,-999,148,84)).toBe(true);
   expect(g.shopScroll).toBe(11); // wheel per event is bounded to 48
   expect(handleWheel(g,-999,148,84)).toBe(true);
   expect(g.shopScroll).toBe(0);
 });
 it("wheel over the BUY button, tabs and Bingsu pet image is ignored",()=>{
   const g=world(),m=meta();render(g,m);
   expect(handleWheel(g,80,220,150)).toBe(false);
   expect(handleWheel(g,80,150,40)).toBe(false);
   expect(handleWheel(g,80,5,5)).toBe(false);
   expect(g.shopScroll).toBe(0);
   g.shopTab=1;render(g,m);
   expect(handleWheel(g,80,50,70)).toBe(false);
   expect(wheelShop58(g,40,7)).toBe(false);
 });
 it("touch dragging coast-scrolls without selecting upgrades or buying",()=>{
   const g=world(),m=meta();render(g,m);
   handlePointer(g,"down",101,80,92);
   expect(g.pointers[101].shopScroll58).toBe(true);
   expect(g.menuSel).toBe(0);
   handlePointer(g,"move",101,80,80);
   expect(g.shopScroll).toBe(12);
   handlePointer(g,"move",101,80,66);
   expect(g.shopScroll).toBe(26);
   handlePointer(g,"up",101,0,0);
   expect(g.pointers[101]).toBeUndefined();
   expect(g.menuSel).toBe(0);
   expect(m.ash).toBe(200);
   const initial=g.shopScroll;
   tickShopScroll58(g,0.016,7);
   expect(g.shopScroll).toBeGreaterThan(initial);
   for(let i=0;i<300;i++)tickShopScroll58(g,0.016,7);
   expect(g.shopScroll).toBeLessThanOrEqual(59);
   expect(g.shopVelocity).toBe(0);
 });
 it("a deliberate card tap selects, never spends; BUY still rechecks live balance",()=>{
   const g=world(),m=meta();render(g,m);
   handlePointer(g,"down",12,246,100);
   handlePointer(g,"move",12,247,102); // tiny finger jitter, not a drag
   handlePointer(g,"up",12,0,0);
   expect(g.menuSel).toBe(3);
   expect(m.ash).toBe(200);
   render(g,m);
   const btn=find(g,SHOP_BUY51.x+5,SHOP_BUY51.y+5);
   expect(btn).toBeDefined();
   handlePointer(g,"down",13,SHOP_BUY51.x+5,SHOP_BUY51.y+5);
   expect(m.up.axe).toBe(1);
   expect(m.ash).toBe(180);
   handlePointer(g,"up",13,0,0);
   expect(m.ash).toBe(180);
 });
 it("partly visible cards never have touch targets below the viewport",()=>{
   const g=world(),m=meta();g.shopScroll=15;
   const v=render(g,m);
   const cards=g.zones.filter((z:any)=>z.shopCardIndex58!==undefined);
   expect(cards.some((z:any)=>z.h<SHOP_CARD51.h)).toBe(true);
   expect(cards.every((z:any)=>z.y>=52&&z.y+z.h<=116)).toBe(true);
   expect(v.clips).toEqual([SHOP_VIEW58]);
   expect(find(g,45,SHOP_DETAILS51.y+5)?.shopCardIndex58).toBeUndefined();
 });
 it("keyboard arrows auto-reveal the selected Legacy card and Enter is the only keyboard buy",()=>{
   const g=world(),m=meta();render(g,m);
   for(let i=0;i<6;i++)handleKey(g,m,"arrowdown",true);
   expect(g.menuSel).toBe(6);
   expect(g.shopScroll).toBe(59);
   render(g,m);
   const legacy=g.zones.find((z:any)=>z.shopCardIndex58===6);
   expect(legacy).toBeDefined();
   expect(legacy.h).toBe(59);
   expect(m.ash).toBe(200);
   handleKey(g,m,"enter",true);
   expect(m.up.legacy).toBe(1);
   expect(m.ash).toBe(165);
   handleKey(g,m,"arrowright",true);
   expect(g.shopTab).toBe(1);
   expect(g.shopScroll).toBe(0);
   handleKey(g,m,"arrowleft",true);
   expect(g.shopTab).toBe(0);
   expect(g.shopScroll).toBe(0);
 });
 it("touch gesture from last card never closes or taps underlying menus",()=>{
   const g=world(),m=meta();g.shopScroll=59;render(g,m);
   const card=g.zones.find((z:any)=>z.shopCardIndex58===6);
   expect(card).toBeDefined();
   handlePointer(g,"down",66,card.x+5,card.y+5);
   handlePointer(g,"move",66,card.x+5,card.y-22);
   handlePointer(g,"up",66,0,0);
   expect(g.menu).toBe("shop");
   expect(m.ash).toBe(200);
   expect(m.up.legacy).toBeUndefined();
 });
 it("scrolling cannot use pending Run Ash, even when banked Ash is zero",()=>{
   const g=world(),m=meta();m.ash=0;g.ashEarned=9999;
   render(g,m);
   handleWheel(g,200,80,72);
   handlePointer(g,"down",88,200,92);
   handlePointer(g,"move",88,200,55);
   handlePointer(g,"up",88,0,0);
   render(g,m);
   expect(g.zones.some((z:any)=>z.x===SHOP_BUY51.x&&z.y===SHOP_BUY51.y))
    .toBe(false);
   expect(m.up).toEqual({});
   expect(m.ash).toBe(0);
   expect(g.ashEarned).toBe(9999);
 });
});
