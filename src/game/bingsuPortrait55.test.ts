import {beforeEach,afterEach,describe,expect,it,vi} from "vitest";
import {BINGSU,drawBingsuPortrait,drawBingsuShopProfile,BINGSU_PORTRAIT55} from "./bingsu";
import {BINGSU_PALETTE55} from "./bingsuPortrait55";
import {drawShopTabs,SHOP_BUY51,SHOP_DETAILS51} from "./menuScreens";
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

describe("Patch #55: reviewed Bingsu close-up, no more blocky full-body",()=>{
 it("renders exactly 90x68 native picture pixels with natural shading",()=>{
   const v=surface();
   drawBingsuPortrait(v.ctx,0,0);
   expect(BINGSU_PORTRAIT55).toEqual({w:90,h:68});
   expect(v.rectangles.length).toBeGreaterThan(1000);
   expect(v.rectangles.every(r=>r.x>=0&&r.y>=0&&r.x+r.w<=90&&r.y+r.h<=68)).toBe(true);
   expect(BINGSU_PALETTE55.length).toBeGreaterThanOrEqual(30);
   expect(v.rectangles.every(r=>BINGSU_PALETTE55.includes(r.color as any))).toBe(true);
   for(let y=0;y<68;y++){
     const scan=v.rectangles.filter(r=>r.y===y);
     expect(scan.reduce((n,r)=>n+r.w,0)).toBe(90);
   }
 });
 it("preserves the inspected portrait's broad dark nose, gentle eyes and soft white face",()=>{
   const v=surface();drawBingsuPortrait(v.ctx,0,0);
   expect(pixel(v.rectangles,16,37)).toBe("#2c2829");
   expect(pixel(v.rectangles,45,10)).toBe("#f0e5d5");
   expect(pixel(v.rectangles,25,19)).toBe("#e5d5c4");
   expect(pixel(v.rectangles,55,35)).toBe("#c6b2a5");
   expect(pixel(v.rectangles,80,20)).toBe("#333a3a");
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
