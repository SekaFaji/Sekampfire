import {beforeEach,afterEach,describe,expect,it,vi} from "vitest";
import {BINGSU,drawBingsuPortrait,drawBingsuShopProfile,BINGSU_PORTRAIT54} from "./bingsu";
import {BINGSU_PORTRAIT_PALETTE54} from "./bingsuPortrait54";
import {drawShopTabs,SHOP_BUY51} from "./menuScreens";
import {createEngine,shopRows} from "./game";
import {drawBingsuWorldSprite} from "./bingsuWorld49";

function canvas(){
 const draws:{x:number;y:number;w:number;h:number;color:string}[]=[];
 let color="";
 const ctx:any={
  get fillStyle(){return color;},
  set fillStyle(next:string){color=next;},
  fillRect(x:number,y:number,w:number,h:number){
   expect([x,y,w,h].every(Number.isFinite)).toBe(true);
   expect(w).toBeGreaterThan(0);
   expect(h).toBeGreaterThan(0);
   draws.push({x,y,w,h,color});
  }
 };
 return {ctx,draws};
}
function pixel(draws:any[],x:number,y:number){
 return [...draws].reverse().find((r:any)=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h)?.color||"none";
}
const meta=()=>({ash:40,up:{dog:0},petEquipped:null as "dog"|null});
describe("Patch #54: Bingsu's user-photo-based Pets Shop portrait",()=>{
 it("is a broad landscape adult Dogo pose with true uncropped body and legs",()=>{
  expect(BINGSU_PORTRAIT54).toEqual({w:124,h:65});
  const view=canvas();
  drawBingsuPortrait(view.ctx,0,0);
  expect(view.draws.length).toBeGreaterThan(170);
  expect(view.draws.every(r=>r.x>=0&&r.y>=0&&
    r.x+r.w<=124&&r.y+r.h<=65)).toBe(true);
  // Head, muscular shoulder, long white back, back leg, and tail:
  expect(pixel(view.draws,23,15)).toBe(BINGSU_PORTRAIT_PALETTE54.highlight);
  expect(pixel(view.draws,70,25)).toBe(BINGSU_PORTRAIT_PALETTE54.coat);
  expect(pixel(view.draws,91,29)).toBe(BINGSU_PORTRAIT_PALETTE54.coat);
  expect(pixel(view.draws,114,38)).not.toBe("none");
  expect(pixel(view.draws,45,59)).toBe(BINGSU_PORTRAIT_PALETTE54.highlight);
  expect(pixel(view.draws,100,58)).toBe(BINGSU_PORTRAIT_PALETTE54.coat);
 });
 it("faces left with a broad BLACK nose and a gentle almond eye, not a frontal puppy",()=>{
  const view=canvas();
  drawBingsuPortrait(view.ctx,0,0);
  expect(pixel(view.draws,10,25)).toBe(BINGSU_PORTRAIT_PALETTE54.nose);
  expect(pixel(view.draws,23,19)).toBe("#14191b");
  expect(pixel(view.draws,33,18)).not.toBe(BINGSU_PORTRAIT_PALETTE54.nose);
  expect(pixel(view.draws,53,10)).toBe(BINGSU_PORTRAIT_PALETTE54.background);
 });
 it("honors the reference's white short coat, dropped ears and NO collar",()=>{
  const view=canvas();
  drawBingsuPortrait(view.ctx,0,0);
  for(const color of ["#a95745","#d47e63","#b2644e","#e3b76b"])
    expect(view.draws.some(r=>r.color===color)).toBe(false);
  expect(view.draws.some(r=>r.color===BINGSU_PORTRAIT_PALETTE54.coat)).toBe(true);
  expect(view.draws.some(r=>r.color===BINGSU_PORTRAIT_PALETTE54.ear)).toBe(true);
  expect(BINGSU.breed).toBe("DOGO ARGENTINO");
  expect(BINGSU.personality).toContain("SWEET");
  expect(BINGSU.affection).toContain("HUG");
 });
 it("has a 128x66 native Shop hitbox, readable descriptive copy, and retains exact 40 Ash BUY",()=>{
  const g=createEngine();g.shopTab=1;g.menu="shop";g.ui="run";
  const m=meta();
  const view=canvas();g.zones=[];
  drawShopTabs(view.ctx,g,m,shopRows(g,m),()=>{g.menu=null;});
  expect(view.draws.every(r=>r.x>=24&&r.y>=8&&r.x+r.w<=296&&r.y+r.h<=172))
    .toBe(true);
  const portrait=g.zones.find((z:any)=>z.x===31&&z.y===52&&z.w===128&&z.h===66);
  expect(portrait).toBeDefined();
  portrait.onDown();
  expect(m.ash).toBe(40);
  const buy=g.zones.find((z:any)=>z.x===SHOP_BUY51.x&&z.y===SHOP_BUY51.y);
  expect(buy).toBeDefined();
  buy.onDown();
  expect(m.up.dog).toBe(1);expect(m.ash).toBe(0);
  expect(m.petEquipped).toBe("dog");
 });
 it("keeps full shop profile within the same 260x79 panel and leaves the world sprite untouched",()=>{
  const profile=canvas();
  drawBingsuShopProfile(profile.ctx,meta());
  expect(profile.draws.every(r=>r.x>=30&&r.y>=73&&
    r.x+r.w<=290&&r.y+r.h<=152)).toBe(true);
  const world=canvas();
  drawBingsuWorldSprite(world.ctx,{x:120,y:145,dir:1,
    wood:2,phase:"idle",motion:0,gait:0},0);
  expect(world.draws.filter(r=>r.color==="#553824")).toHaveLength(2);
 });
});
