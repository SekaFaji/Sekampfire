import {beforeEach,afterEach,describe,it,expect,vi} from "vitest";
import {CX,DAY_LEN,NIGHT_LEN} from "./config";
import {WEST_POST_X,EAST_POST_X,EXPANSION_MARKER_X} from "./campBoundary";
import {createEngine,update,drawRunChrome,drawMenu,handlePointer,pauseRows,titleActions} from "./game";
import {drawCampHUD,ASH_PANEL_RECT,hudAshReadout,hudAshButtonLabel} from "./hud";
import {coldWarmthDrain,airTemperatureDrainFactor} from "./cold";
import {discoverLog,cleanLogCollection} from "./museum";
import {captureRunSnapshot} from "./save";
import {
  FENCE_TORCH_COST,FENCE_TORCH_DAWNS,FENCE_TORCH_LIGHT_RADIUS,
  normalizeFenceTorches,nearestFenceTorchPost,torchPostX,activeFenceTorch,
  buildFenceTorch,advanceFenceTorchDawn,protectedByFenceTorches,fenceTorchLights,
  drawFenceTorches
} from "./fenceTorches47";

let store:Map<string,string>;
beforeEach(()=>{
  store=new Map();
  vi.stubGlobal("localStorage",{
    getItem:(k:string)=>store.get(k)??null,
    setItem:(k:string,v:string)=>store.set(k,String(v)),
    removeItem:(k:string)=>store.delete(k)
  });
});
afterEach(()=>vi.unstubAllGlobals());
const meta=()=>({ash:33,totalAsh:36,best:2,runs:1,up:{},guideFx:true,
  museumBuilt:false,collection:cleanLogCollection(null)});
function run(){
  const g=createEngine();g.ui="run";g.over=false;g.menu=null;
  g.fenceLeft=true;g.fenceRight=true;g.player.warmth=90;
  g.trees=[];g.pickups=[];g.falling=[];g.keys={};
  return g;
}
function canvas(){
  const rects:{x:number;y:number;w:number;h:number;color:string}[]=[];
  let color="";
  const ctx:any={
    get fillStyle(){return color;},
    set fillStyle(v:string){color=v;},
    fillRect(x:number,y:number,w:number,h:number){
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      expect(w).toBeGreaterThan(0);expect(h).toBeGreaterThan(0);
      rects.push({x,y,w,h,color});
    }
  };
  return {ctx,rects};
}

describe("Patch #47: compact Ash Shop and transparent interface",()=>{
  it("places a one-line 32x14 Ash BUTTON directly under Menu with bounded text",()=>{
    const g=run(),m=meta(),v=canvas();
    expect(ASH_PANEL_RECT).toEqual({x:284,y:40,w:32,h:14});
    for(const ash of [0,8,999,1234,9999,20000,170000,5000000]){
      g.ashEarned=ash;
      expect(hudAshButtonLabel(g).length).toBeGreaterThan(0);
      if(ash===999)expect(hudAshButtonLabel(g)).toBe("A999");
      if(ash===9999)expect(hudAshButtonLabel(g)).toBe("A9.9K");
      expect(hudAshReadout(g).startsWith("ASH ")).toBe(true);
      g.zones=[];drawCampHUD(v.ctx,g,m);
      expect(v.rects.some(r=>r.x===284&&r.y===40&&r.w===32&&r.h===14)).toBe(true);
    }
  });
  it("tapping under Menu opens Ash Shop, without spending or banking run Ash",()=>{
    const g=run(),m=meta(),v=canvas();g.ashEarned=16;
    g.zones=[];drawRunChrome(v.ctx,g);
    const button=g.zones.find((r:any)=>r.x===284&&r.y===40&&r.w===32&&r.h===14);
    expect(button).toBeDefined();
    handlePointer(g,"down",7,300,47);
    expect(g.menu).toBe("shop");expect(g.shopTab).toBe(0);
    expect(g.ashTapFx).toBeGreaterThan(0);
    expect(m.ash).toBe(33);expect(g.ashEarned).toBe(16);
  });
  it("has no Toolbar entry in the pause menu; existing quickslots remain on HUD",()=>{
    const g=run(),m=meta(),v=canvas();g.zones=[];
    expect(pauseRows(g,m).map((r:any)=>r.label)).toEqual(["RESUME","SETTINGS","END RUN"]);
    drawRunChrome(v.ctx,g);
    expect(g.zones.filter((z:any)=>z.quickSlot===0||z.quickSlot===1)).toHaveLength(2);
  });
  it("makes plaques and pause panels less opaque without dropping high-contrast text",()=>{
    const g=run(),m=meta(),v=canvas();g.zones=[];
    drawCampHUD(v.ctx,g,m);
    expect(v.rects.some(r=>r.color==="rgba(63,46,32,0.45)")).toBe(true);
    expect(v.rects.some(r=>r.color==="rgba(18,30,41,0.39)")).toBe(true);
    g.menu="pause";g.zones=[];
    const popup=canvas();drawMenu(popup.ctx,g,m);
    expect(popup.rects.some(r=>r.color==="rgba(4,6,16,0.25)")).toBe(true);
    expect(popup.rects.some(r=>r.color==="rgba(8,12,26,0.75)")).toBe(true);
  });
});
describe("Patch #47: real air temperature drives warmth loss",()=>{
  it("freezing air increases loss even with the same existing Cold pressure",()=>{
    const g=run(),m=meta();
    g.player.x=CX+110;g.fireLit=false;g.cold=48;
    g.weather="clear";g.weatherBlend=1;
    g.night=0;g.isNight=false;g.time=12;
    const mild=airTemperatureDrainFactor(g),baseline=coldWarmthDrain(g,m);
    g.weather="blizzard";
    const freezing=airTemperatureDrainFactor(g),drain=coldWarmthDrain(g,m);
    expect(freezing).toBeGreaterThan(mild);
    expect(drain).toBeGreaterThan(baseline);
    expect(g.cold).toBe(48);
    expect(freezing).toBeLessThanOrEqual(1.72);
    (m.up as any).blood=2;
    expect(coldWarmthDrain(g,m)).toBeCloseTo(drain*0.7);
  });
});
describe("Patch #47: Museum special-log lock",()=>{
  it("permits ordinary early but does not roll or unlock any special log before construction",()=>{
    const m=meta();
    expect(discoverLog(m,()=>0)).toBe("ordinary");
    for(let i=0;i<50;i++){
      expect(discoverLog(m,()=>{throw Error("Should not roll before Museum");})).toBeNull();
    }
    expect(m.collection).toEqual({ordinary:true,twisted:false,hand:false,eight:false});
    m.museumBuilt=true;
    let n=0;
    expect(discoverLog(m,()=>[0.01,0.999][n++])).toBe("eight");
    m.museumBuilt=false;
    expect(discoverLog(m,()=>0)).toBeNull();
    expect(m.collection.eight).toBe(true); // historical discoveries are retained
  });
});
describe("Patch #47: physical, seven-dawn fence torches",()=>{
  it("requires finished fence and physical post proximity, consumes exactly 2 carried logs",()=>{
    const g=run();g.fenceRight=false;g.player.wood=5;g.player.x=WEST_POST_X;
    expect(buildFenceTorch(g,"left")).toMatch(/ESTABLISH/);
    g.fenceRight=true;
    g.player.x=CX;
    expect(buildFenceTorch(g,"left")).toMatch(/STAND/);
    g.player.x=WEST_POST_X;
    expect(nearestFenceTorchPost(g)).toBe("left");
    expect(FENCE_TORCH_COST).toBe(2);
    expect(buildFenceTorch(g,"left")).toMatch(/LIT/);
    expect(g.player.wood).toBe(3);
    expect(g.fenceTorches.left).toBe(7);
    expect(activeFenceTorch(g,"left")).toBe(true);
    expect(buildFenceTorch(g,"left")).toMatch(/DAWNS LEFT/);
    expect(g.player.wood).toBe(3); // don't spend again on an already lit torch
    g.player.x=EAST_POST_X;g.player.wood=1;
    expect(buildFenceTorch(g,"right")).toMatch(/BRING 2/);
    expect(activeFenceTorch(g,"right")).toBe(false);
  });
  it("one torch protects only its post; both protect the interior but NOT outdoors",()=>{
    const g=run(),m=meta();g.player.wood=5;
    g.player.x=WEST_POST_X;buildFenceTorch(g,"left");
    expect(protectedByFenceTorches(g)).toBe(true);
    expect(coldWarmthDrain(g,m)).toBe(0);
    g.player.x=CX;
    expect(protectedByFenceTorches(g)).toBe(false);
    expect(coldWarmthDrain(g,m)).toBeGreaterThan(0);
    g.player.x=EAST_POST_X;buildFenceTorch(g,"right");
    g.player.x=CX;
    expect(protectedByFenceTorches(g)).toBe(true);
    expect(coldWarmthDrain(g,m)).toBe(0);
    g.player.x=EAST_POST_X+34;
    expect(protectedByFenceTorches(g)).toBe(false);
    expect(coldWarmthDrain(g,m)).toBeGreaterThan(0);
    expect(FENCE_TORCH_LIGHT_RADIUS).toBeLessThan(90);
  });
  it("lasts seven actual dawn ticks, then can be rebuilt without infinite protection",()=>{
    const g=run();g.player.x=WEST_POST_X;g.player.wood=4;
    buildFenceTorch(g,"left");
    expect(FENCE_TORCH_DAWNS).toBe(7);
    for(let i=0;i<6;i++){
      expect(advanceFenceTorchDawn(g)).toHaveLength(0);
      expect(g.fenceTorches.left).toBe(6-i);
    }
    expect(advanceFenceTorchDawn(g)).toEqual(["left"]);
    expect(g.fenceTorches.left).toBe(0);
    expect(activeFenceTorch(g,"left")).toBe(false);
    expect(buildFenceTorch(g,"left")).toMatch(/LIT/);
    expect(g.fenceTorches.left).toBe(7);
    expect(g.player.wood).toBe(0);
  });
  it("uses the real dawn transition for expiration and emits an extinguish message",()=>{
    const g=run(),m=meta(),messages:string[]=[];
    g.fenceTorches.left=1;g.player.x=CX;
    g.night=1;g.time=DAY_LEN+NIGHT_LEN-0.01;g.isNight=true;
    update(g,m,0.02,{toast:(x:string)=>messages.push(x),end:vi.fn()});
    expect(g.time).toBe(0);
    expect(g.fenceTorches.left).toBe(0);
    expect(messages.some(s=>s.includes("LEFT FENCE TORCH BURNED OUT"))).toBe(true);
  });
  it("moves the eastern torch with the expanded fence, keeping the actual boundary",()=>{
    const g=run();g.player.x=EAST_POST_X;g.player.wood=2;
    buildFenceTorch(g,"right");
    expect(torchPostX(g,"right")).toBe(EAST_POST_X);
    g.campExpansion=1;
    expect(torchPostX(g,"right")).toBeGreaterThan(EXPANSION_MARKER_X);
    expect(fenceTorchLights(g)).toEqual([{x:torchPostX(g,"right"),y:112,side:"right"}]);
    expect(nearestFenceTorchPost(g)).toBeNull();
    g.player.x=torchPostX(g,"right");
    expect(nearestFenceTorchPost(g)).toBe("right");
  });
  it("draws smaller pale torch flames only when active and keeps the v1 save safe",()=>{
    const g=run(),p=canvas();g.player.x=WEST_POST_X;g.player.wood=2;
    drawFenceTorches(p.ctx,g);expect(p.rects).toHaveLength(0);
    buildFenceTorch(g,"left");
    drawFenceTorches(p.ctx,g);
    expect(p.rects.length).toBeGreaterThanOrEqual(7);
    expect(p.rects.some(r=>r.color==="#87afb0")).toBe(true);
    const snap=captureRunSnapshot(g);
    expect(snap.version).toBe(1);
    expect(snap.state.fenceTorches).toEqual({left:7,right:0});
    expect(normalizeFenceTorches({left:999,right:-42})).toEqual({left:7,right:0});
    const restored=createEngine();restored.resumeData=snap.state;
    titleActions(restored,meta())[0].act();
    expect(restored.fenceTorches.left).toBe(7);
    expect(restored.fenceTorches.right).toBe(0);
  });
});
