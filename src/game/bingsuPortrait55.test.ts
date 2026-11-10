import {beforeEach,afterEach,describe,expect,it,vi} from "vitest";
import {BINGSU,drawBingsuPortrait,drawBingsuShopProfile,BINGSU_PORTRAIT55} from "./bingsu";
import {BINGSU_PALETTE55} from "./bingsuPortrait55";
import {drawShopTabs,SHOP_BUY51,SHOP_DETAILS51,BINGSU_PET_FIT57} from "./menuScreens";
import {createEngine,shopRows} from "./game";
import {drawBingsuWorldSprite} from "./bingsuWorld49";

let data:Map<string,string>;
beforeEach(()=>{
 data=new Map();
 vi.stubGlobal("localStorage",{
   getItem:(key:string)=>data.get(key)??null,
   setItem:(key:string,value:string)=>data.set(key,String(value)),
   removeItem:(key:string)=>data.delete(key)
 });
});
afterEach(()=>vi.unstubAllGlobals());

function surface(){
 const rectangles:{x:number;y:number;w:number;h:number;color:string}[]=[];
 let ink="";
 const ctx:any={
   set fillStyle(v:string){ink=v;},get fillStyle(){return ink;},
   fillRect(x:number,y:number,w:number,h:number){
     expect([x,y,w,h].every(Number.isFinite)).toBe(true);
     expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
     rectangles.push({x,y,w,h,color:ink});
   }
 };
 return {ctx,rectangles};
}
function pixel(draws:any[],x:number,y:number):string {
 const hit=[...draws].reverse().find((r:any)=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
 return hit?.color??"missing";
}
const meta=()=>({ash:40,up:{dog:0},petEquipped:null as "dog"|null});

describe("Patch #55-56: approved Bingsu portrait, now with more chest visible",()=>{
 it("renders exactly 94x68 original pixels, fully inside the Pet portrait card",()=>{
   const v=surface();
   drawBingsuPortrait(v.ctx,0,0);
   expect(BINGSU_PORTRAIT55).toEqual({w:94,h:68});
   expect(v.rectangles.length).toBeGreaterThan(1000);
   expect(v.rectangles.every(r=>r.x>=0&&r.y>=0&&r.x+r.w<=94&&r.y+r.h<=68)).toBe(true);
   expect(BINGSU_PALETTE55.length).toBeGreaterThanOrEqual(30);
   expect(v.rectangles.every(r=>BINGSU_PALETTE55.includes(r.color as any))).toBe(true);
   for(let y=0;y<68;y++){
     const scan=v.rectangles.filter(r=>r.y===y);
     expect(scan.reduce((n,r)=>n+r.w,0)).toBe(94);
   }
 });
 it("fits the ENTIRE approved image within 3px vertical and 7px horizontal matting",()=>{
   const card=BINGSU_PET_FIT57.card,art=BINGSU_PET_FIT57.art;
   expect(card).toEqual({x:31,y:50,w:100,h:68});
   expect(art).toEqual({x:38,y:53,w:86,h:62});
   expect(art.x-card.x).toBe(card.w-(art.x-card.x)-art.w);
   expect(art.y-card.y).toBe(card.h-(art.y-card.y)-art.h);
   expect(art.x).toBeGreaterThan(card.x+1);
   expect(art.y).toBeGreaterThan(card.y+1);
   expect(art.x+art.w).toBeLessThan(card.x+card.w-1);
   expect(art.y+art.h).toBeLessThan(card.y+card.h-1);
   expect(card.y+card.h).toBeLessThan(SHOP_DETAILS51.y);
   const v=surface();
   drawBingsuPortrait(v.ctx,art.x,art.y,art.w,art.h);
   expect(v.rectangles.every(r=>
     r.x>=art.x&&r.y>=art.y&&r.x+r.w<=art.x+art.w&&r.y+r.h<=art.y+art.h
   )).toBe(true);
   expect(v.rectangles.every(r=>BINGSU_PALETTE55.includes(r.color as any)))
     .toBe(true);
   for(let y=art.y;y<art.y+art.h;y++){
     const scan=v.rectangles.filter(r=>r.y===y);
     expect(scan.reduce((n,r)=>n+r.w,0)).toBe(art.w);
   }
 });
 it("draws the new matte and intact card border in the actual Shop",()=>{
   const g=createEngine(),m=meta();g.shopTab=1;g.menu="shop";g.ui="run";g.zones=[];
   const v=surface();drawShopTabs(v.ctx,g,m,shopRows(g,m),()=>{g.menu=null});
   const c=BINGSU_PET_FIT57.card;
   expect(v.rectangles.some(r=>r.x===c.x&&r.y===c.y&&
     r.w===c.w&&r.h===1&&r.color==="#eac487")).toBe(true);
   expect(v.rectangles.some(r=>r.x===c.x+2&&r.y===c.y+2&&
     r.w===c.w-4&&r.h===c.h-4&&r.color==="#455150")).toBe(true);
   expect(g.zones.filter((z:any)=>z.x===c.x&&z.y===c.y&&z.w===c.w&&z.h===c.h))
     .toHaveLength(1);
 });
 it("preserves the inspected portrait's broad dark nose, gentle eyes and soft white face",()=>{
   const v=surface();drawBingsuPortrait(v.ctx,0,0);
   expect(pixel(v.rectangles,25,42)).toBe("#201c1d");
   expect(pixel(v.rectangles,40,15)).toBe("#f8efdf");
   expect(pixel(v.rectangles,45,30)).toBe("#dac6b7");
   expect(pixel(v.rectangles,50,65)).toBe("#b9aa9f");
   expect(pixel(v.rectangles,30,65)).toBe("#fcf6e8");
 });
 it("keeps the Dogo Argentino portrait collar-free and preserves Bingsu's personality",()=>{
   const v=surface();drawBingsuPortrait(v.ctx,0,0);
   for(const red of ["#a95745","#d47e63","#b2644e","#e3b76b"])
     expect(v.rectangles.some(r=>r.color===red)).toBe(false);
   expect(BINGSU.breed).toBe("DOGO ARGENTINO");
   expect(BINGSU.personality).toContain("LOVING");
   expect(BINGSU.affection).toContain("HUG");
   expect(BINGSU.temperament).toContain("STUBBORN");
   expect(BINGSU.loyalty).toContain("FIGHT TO THE DEATH");
 });
 it("puts the portrait beside the story, not over the Shop tabs or BUY",()=>{
   const g=createEngine(),m=meta();g.shopTab=1;g.menu="shop";g.ui="run";g.zones=[];
   const v=surface();drawShopTabs(v.ctx,g,m,shopRows(g,m),()=>{g.menu=null});
   const card=g.zones.find((z:any)=>z.x===31&&z.y===50&&z.w===100&&z.h===68);
   expect(card).toBeDefined();
   expect(card.y).toBeGreaterThanOrEqual(33+16);
   expect(card.y+card.h).toBeLessThan(SHOP_DETAILS51.y);
   expect(v.rectangles.every(r=>r.x>=24&&r.y>=8&&r.x+r.w<=296&&r.y+r.h<=172)).toBe(true);
   card.onDown();
   expect(m.up.dog).toBe(0);expect(m.ash).toBe(40);
   const buy=g.zones.find((z:any)=>z.x===SHOP_BUY51.x&&z.y===SHOP_BUY51.y);
   expect(buy).toBeDefined();
   buy.onDown();
   expect(m.up.dog).toBe(1);
   expect(m.petEquipped).toBe("dog");
   expect(m.ash).toBe(0);
 });
 it("old detailed pet profile still fits its panel; world sprite keeps two real carried logs",()=>{
   const profile=surface();drawBingsuShopProfile(profile.ctx,meta());
   expect(profile.rectangles.every(r=>r.x>=30&&r.y>=73&&r.x+r.w<=290&&r.y+r.h<=152)).toBe(true);
   const dog=surface();
   drawBingsuWorldSprite(dog.ctx,{x:120,y:145,dir:1,wood:2,phase:"idle",motion:0,gait:0},0);
   expect(dog.rectangles.filter(r=>r.color==="#553824")).toHaveLength(2);
   expect(dog.rectangles.some(r=>r.color==="#b2644e")).toBe(false);
 });
});
