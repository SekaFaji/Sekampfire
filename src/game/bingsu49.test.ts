import { beforeEach,afterEach,describe,it,expect,vi } from "vitest";
import { CX,PILE_X,PLAYER_Y } from "./config";
import { createEngine, titleActions } from "./game";
import { drawDog,drawPlayer } from "./renderSprites";
import { drawBingsuWorldSprite,BINGSU_WORLD_BOUNDS } from "./bingsuWorld49";
import { captureRunSnapshot } from "./save";
import {
  activePet,updateDogCompanion,BINGSU_FOLLOW_IDLE_RADIUS,
  BINGSU_FOLLOW_DISTANCE,BINGSU_PICKUP_LEASH,BINGSU_STORAGE_LEASH
} from "./companion";
import { pileCap } from "./rules";

const meta=()=>({up:{dog:1},petEquipped:"dog",ash:0,guideFx:true,museumBuilt:false});
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
function run(){
  const g=createEngine();
  g.ui="run";g.menu=null;g.over=false;g.player.x=CX;g.player.y=PLAYER_Y;
  g.player.dir=-1;g.player.wood=0;g.builtPile=false;
  g.pickups=[];g.trees=[];g.falling=[];
  return g;
}
type Pixel={x:number;y:number;w:number;h:number;color:string};
function canvas(){
  let color="";
  const pixels:Pixel[]=[];
  const ctx:any={
    get fillStyle(){return color;},
    set fillStyle(v:string){color=v;},
    fillRect(x:number,y:number,w:number,h:number){
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
      pixels.push({x,y,w,h,color});
    }
  };
  return {ctx,pixels};
}
function bbox(pixels:Pixel[]){
  return {
    x0:Math.min(...pixels.map(p=>p.x)),y0:Math.min(...pixels.map(p=>p.y)),
    x1:Math.max(...pixels.map(p=>p.x+p.w)),y1:Math.max(...pixels.map(p=>p.y+p.h))
  };
}
function shown(g:any){
  const view=canvas();
  drawDog(view.ctx,g);
  return view.pixels;
}

describe("Patch #49: Bingsu is proportionate and no longer a giant blinking shape",()=>{
  it("uses a compact real-world silhouette and the exact player's ground level",()=>{
    const g=run(),m=meta();
    updateDogCompanion(g,m,0.05);
    expect(g.dog.y).toBe(g.player.y);
    expect(g.dog.phase).toBe("idle");
    const pixels=shown(g);
    expect(pixels.length).toBeGreaterThan(22);
    const dog=bbox(pixels);
    expect(dog.x1-dog.x0).toBeLessThanOrEqual(24);
    expect(dog.y1-dog.y0).toBeLessThanOrEqual(16);
    expect(dog.y1).toBeLessThanOrEqual(PLAYER_Y);
    expect(BINGSU_WORLD_BOUNDS.maxX-BINGSU_WORLD_BOUNDS.minX+1).toBeLessThanOrEqual(24);
    const playerView=canvas();drawPlayer(playerView.ctx,g);
    const human=bbox(playerView.pixels);
    expect(dog.y1-dog.y0).toBeLessThan(human.y1-human.y0);
    expect(dog.x1-dog.x0).toBeLessThan(2*(human.x1-human.x0));
  });
  it("mirrors one authored outline and every detail when facing left",()=>{
    const dog={x:800,y:PLAYER_Y,dir:1,phase:"walk",motion:80,gait:1.2,wood:2};
    const right=canvas(),left=canvas();
    drawBingsuWorldSprite(right.ctx,dog,2.5);
    drawBingsuWorldSprite(left.ctx,{...dog,dir:-1},2.5);
    const digest=(pixels:Pixel[])=>pixels
      .map(p=>[p.x,p.y,p.w,p.h,p.color].join(":")).sort();
    expect(digest(left.pixels)).toEqual(digest(right.pixels.map(p=>({
      ...p,x:2*dog.x-p.x-p.w+1
    }))));
    expect(right.pixels.filter(p=>p.color==="#553824")).toHaveLength(2);
    expect(left.pixels.filter(p=>p.color==="#553824")).toHaveLength(2);
  });
  it("has separate idle breath, walking gait and cargo art without unused sprites",()=>{
    const g=run(),m=meta();
    updateDogCompanion(g,m,0.05);
    const oldGait=g.dog.gait;
    g.animT=5.5;updateDogCompanion(g,m,0.2);
    expect(g.dog.gait).toBe(oldGait);
    expect(g.dog.phase).toBe("idle");
    g.player.x+=45;
    updateDogCompanion(g,m,0.10);
    expect(g.dog.phase).toBe("walk");
    expect(g.dog.gait).not.toBe(oldGait);
    g.dog.wood=2;
    expect(shown(g).filter(p=>p.color==="#553824")).toHaveLength(2);
    g.dog.hidden=true;
    expect(shown(g)).toHaveLength(0);
  });
});

describe("Patch #49: Bingsu follows world movement, not changing facing state",()=>{
  it("does not switch sides or move when the owner merely turns around",()=>{
    const g=run(),m=meta();
    updateDogCompanion(g,m,0.05);
    const original=g.dog.x;
    expect(original).toBe(CX+BINGSU_FOLLOW_DISTANCE);
    expect(Math.abs(g.player.x-g.dog.x)).toBeLessThanOrEqual(BINGSU_FOLLOW_IDLE_RADIUS);
    for(let i=0;i<12;i++){
      g.player.dir=i%2?1:-1;
      updateDogCompanion(g,m,0.05);
      expect(g.dog.x).toBe(original);
      expect(g.dog.phase).toBe("idle");
      expect(g.dog.motion).toBe(0);
    }
  });
  it("catches up naturally and reverses without instantaneous side teleport",()=>{
    const g=run(),m=meta();
    updateDogCompanion(g,m,0.05);
    const before=g.dog.x;
    g.player.x+=52;g.player.dir=1;
    updateDogCompanion(g,m,0.10);
    expect(g.dog.x).toBeGreaterThan(before);
    expect(g.dog.x).toBeLessThan(g.player.x);
    expect(g.dog.dir).toBe(1);
    const turning=g.dog.x;
    g.player.x=turning-65;g.player.dir=-1;
    updateDogCompanion(g,m,0.10);
    expect(g.dog.x).toBeLessThan(turning);
    expect(g.dog.x).toBeGreaterThan(g.player.x);
    expect(g.dog.dir).toBe(-1);
    for(let i=0;i<30;i++)updateDogCompanion(g,m,0.10);
    expect(Math.abs(g.player.x-g.dog.x)).toBeLessThanOrEqual(BINGSU_FOLLOW_IDLE_RADIUS);
    expect(g.dog.phase).toBe("idle");
  });
  it("does not chase dropped logs that are outside the player's leash",()=>{
    const g=run(),m=meta();
    g.pickups=[{x:CX+BINGSU_PICKUP_LEASH+20,y:151,w:2}];
    for(let i=0;i<30;i++)updateDogCompanion(g,m,0.15);
    expect(g.dog.wood).toBe(0);
    expect(g.pickups).toHaveLength(1);
    expect(Math.abs(g.dog.x-CX)).toBeLessThanOrEqual(BINGSU_FOLLOW_IDLE_RADIUS);
  });
  it("does not abandon its owner to deliver cargo to a distant camp rack",()=>{
    const g=run(),m=meta();
    g.player.x=PILE_X+350;g.player.wood=5;
    g.builtPile=true;g.stored=0;
    updateDogCompanion(g,m,0.10);
    g.dog.wood=2;
    const original=g.dog.x;
    for(let i=0;i<50;i++)updateDogCompanion(g,m,0.15);
    expect(g.dog.x).toBe(original);
    expect(g.dog.wood).toBe(2);
    expect(g.stored).toBe(0);
    expect(Math.abs(g.player.x-PILE_X)).toBeGreaterThan(BINGSU_STORAGE_LEASH);
    // When the player returns to the actual pile, the SAME two real logs
    // are deposited without teleporting new resources into the world.
    g.player.x=PILE_X+12;
    for(let i=0;i<60;i++)updateDogCompanion(g,m,0.15);
    expect(g.stored).toBe(2);
    expect(g.dog.wood).toBe(0);
    expect(g.pickups).toHaveLength(0);
  });
  it("handles loaded legacy v1 saves and preserves a two-log pickup budget",()=>{
    const g=run(),m=meta();
    g.dog={x:CX+20,y:156,dir:1,wood:2,phase:"walk"};
    const snap=captureRunSnapshot(g);
    expect(snap.version).toBe(1);
    expect(snap.state.dog.wood).toBe(2);
    const restored=createEngine();restored.resumeData=snap.state;
    titleActions(restored,m)[0].act();
    expect(restored.dog.wood).toBe(2);
    expect(restored.dog.y).toBe(PLAYER_Y);
    updateDogCompanion(restored,m,0.05);
    expect(restored.dog.y).toBe(PLAYER_Y);
    expect(Number.isFinite(restored.dog.gait)).toBe(true);
    expect(Number.isFinite(restored.dog.motion)).toBe(true);
  });
  it("keeps all real logs when unequipping, including saturated pickup arrays",()=>{
    const g=run(),m:any=meta();
    updateDogCompanion(g,m,0.05);
    g.dog.wood=2;
    g.pickups=Array.from({length:200},(_,i)=>({x:20+i,y:151,w:1}));
    m.petEquipped=null;
    updateDogCompanion(g,m,0.05);
    expect(g.dog.hidden).toBe(true);
    expect(g.dog.wood).toBe(2);
    g.pickups.pop();
    updateDogCompanion(g,m,0.05);
    expect(g.dog).toBeNull();
    expect(g.pickups.reduce((sum:number,p:any)=>sum+p.w,0)).toBe(201);
    expect(activePet(m)).toBeNull();
  });
});
