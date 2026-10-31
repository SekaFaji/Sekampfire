import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { activePet, updateDogCompanion } from "./companion";
import { createEngine, shopRows, titleActions } from "./game";
import { drawDog } from "./renderSprites";
import { captureRunSnapshot, loadMeta, saveMeta } from "./save";
import { pileCap } from "./rules";

let store:Map<string,string>;
beforeEach(()=>{store=new Map();vi.stubGlobal("localStorage",{
  getItem:(k:string)=>store.get(k)??null,setItem:(k:string,v:string)=>store.set(k,v),
  removeItem:(k:string)=>store.delete(k)
});});
afterEach(()=>vi.unstubAllGlobals());

const dogMeta=()=>({up:{dog:1},ash:0,petEquipped:"dog"});
const run=()=>{const g=createEngine();g.ui="run";g.player.x=800;g.player.dir=-1;g.player.wood=5;g.pickups=[];g.builtPile=true;g.stage=0;return g;};
describe("good dog follows and carries only real dropped logs",()=>{
  it("never generates sticks from trees or empty ground",()=>{
    const g=run(), meta=dogMeta();
    g.trees=[{id:1,x:820,y:150,hp:2}];
    for(let i=0;i<80;i++)updateDogCompanion(g,meta,0.15);
    expect(g.stored).toBe(0);expect(g.dog.wood).toBe(0);
    expect(g.dog.x).toBeGreaterThan(804);
    expect(Math.abs(g.dog.x-(g.player.x+12))).toBeLessThanOrEqual(3);
  });
  it("transfers precisely the actual dropped wood, max two at a time",()=>{
    const g=run(),meta=dogMeta();g.pickups=[{x:830,y:151,w:3}];
    const total=()=>g.stored+(g.dog?.wood||0)+g.pickups.reduce((n:number,p:any)=>n+p.w,0)+g.player.wood;
    for(let i=0;i<60;i++){
      updateDogCompanion(g,meta,0.20);
      expect(total()).toBe(8);
      expect(g.dog.wood).toBeLessThanOrEqual(2);
      expect(g.stored).toBeLessThanOrEqual(pileCap(g));
    }
    expect(g.stored).toBe(3);
    expect(g.pickups).toHaveLength(0);
    expect(g.dog.wood).toBe(0);
  });
  it("hands over carried logs to player before storage exists",()=>{
    const g=run(),meta=dogMeta();g.builtPile=false;g.player.wood=0;g.pickups=[{x:830,y:151,w:2}];
    for(let i=0;i<30;i++)updateDogCompanion(g,meta,0.2);
    expect(g.player.wood).toBe(2);expect(g.stored).toBe(0);
    expect(g.dog.wood).toBe(0);expect(g.pickups).toHaveLength(0);
  });
  it("keeps two logs on back when player and store are both full",()=>{
    const g=run(),meta=dogMeta();g.stored=pileCap(g);g.pickups=[{x:830,y:151,w:2}];
    for(let i=0;i<30;i++)updateDogCompanion(g,meta,0.2);
    expect(g.dog.wood).toBe(2);expect(g.pickups).toHaveLength(0);
    g.stored--;
    for(let i=0;i<30;i++)updateDogCompanion(g,meta,0.2);
    expect(g.stored).toBe(pileCap(g));
    expect(g.dog.wood).toBe(1);
  });
  it("unequip conserves cargo, including a saturated pickup array",()=>{
    const g=run(),meta:any=dogMeta();g.dog={x:804,y:156,wood:2,dir:1,phase:"idle"};
    meta.petEquipped=null;
    g.pickups=Array.from({length:200},(_,i)=>({x:100+i,y:150,w:1}));
    updateDogCompanion(g,meta,0.2);
    expect(g.dog.hidden).toBe(true);expect(g.dog.wood).toBe(2);
    g.pickups.pop();
    updateDogCompanion(g,meta,0.2);
    expect(g.dog).toBeNull();
    expect(g.pickups.some((p:any)=>p.x===804&&p.w===2)).toBe(true);
  });
  it("restores two carried logs with v1 checkpoint and draws exactly two",()=>{
    const g=run(),meta=dogMeta();g.dog={x:820,y:156,dir:1,wood:2,phase:"walk"};
    const snap=captureRunSnapshot(g);
    expect(snap.version).toBe(1);expect(snap.state.dog.wood).toBe(2);
    const restored=createEngine();restored.resumeData=snap.state;
    titleActions(restored,meta)[0].act();
    expect(restored.dog.wood).toBe(2);
    const marks:Array<{color:string,w:number,h:number}>=[];
    let color="";
    const ctx:any={set fillStyle(v:string){color=v;},get fillStyle(){return color;},
      fillRect(_x:number,_y:number,w:number,h:number){marks.push({color,w,h});}};
    drawDog(ctx,restored);
    expect(marks.filter(m=>m.color==="#67432a"&&m.w===4&&m.h===2)).toHaveLength(2);
  });
});
describe("permanent pet ownership and equip management",()=>{
  it("equips existing dog owners without forced repurchase, unless explicitly unequipped",()=>{
    store.set("sekampfire-meta-v1",JSON.stringify({ash:23,up:{dog:1},totalAsh:50}));
    const meta=loadMeta();
    expect(meta.up.dog).toBe(1);expect(activePet(meta)).toBe("dog");
    const g=createEngine();g.shopTab=1;
    expect(shopRows(g,meta)[0].right).toBe("EQUIPPED");
    shopRows(g,meta)[0].onDown();
    expect(activePet(meta)).toBeNull();
    expect(loadMeta().petEquipped).toBeNull();
    shopRows(g,meta)[0].onDown();
    expect(activePet(meta)).toBe("dog");
    expect(loadMeta().up.dog).toBe(1);
  });
  it("buying Good Dog still costs 40 Ash and confirms before purchase",()=>{
    const g=createEngine(),meta:any={ash:45,up:{dog:0},petEquipped:null};g.shopTab=1;
    shopRows(g,meta)[0].onDown();
    expect(meta.ash).toBe(45);expect(meta.up.dog).toBe(0);
    shopRows(g,meta)[0].onDown();
    expect(meta.ash).toBe(5);expect(meta.up.dog).toBe(1);
    expect(meta.petEquipped).toBe("dog");expect(activePet(meta)).toBe("dog");
  });
});
