import { beforeEach,afterEach,describe,it,expect,vi } from "vitest";
import { CX,PILE_X } from "./config";
import { WEST_POST_X,EAST_POST_X,EAST_EXPANDED_X,
  drawCampFence, campClaimBounds } from "./campBoundary";
import { createEngine,performStationAction,update,handleKey,titleActions } from "./game";
import { captureRunSnapshot } from "./save";
import { coldWarmthDrain } from "./cold";
import { nightLightSources48 } from "./nightLights48";
import {
  FENCE_TORCH_DAWNS,FENCE_TORCH_COST,availableFencePosts,
  normalizeFenceTorches,torchPostX,torchPostAvailable,activeFenceTorch,
  nearestFenceTorchPost,buildFenceTorch,advanceFenceTorchDawn,
  protectedByFenceTorches,fenceTorchLights,drawFenceTorches
} from "./fenceTorches47";
import {
  selectedStation,selectStation,stationBubbleRects,
  drawStationBubbles,storageReadout48
} from "./proximity45";

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
const meta=()=>({ash:0,totalAsh:0,best:0,runs:0,up:{},collection:{},museumBuilt:false,guideFx:true});
function run(){
  const g=createEngine();g.ui="run";g.over=false;g.menu=null;
  g.fenceLeft=true;g.fenceRight=true;g.campExpansion=0;
  g.fireLit=false;g.fuel=0;g.player.torchT=0;
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
describe("Patch #48: real post corners, independent seven-dawn fence torches",()=>{
  it("retains west and original east corners and creates a third OUTER corner after expansion",()=>{
    const g=run();
    expect(availableFencePosts(g)).toEqual(["left","right"]);
    expect(torchPostX(g,"right")).toBe(EAST_POST_X);
    expect(torchPostAvailable(g,"outer")).toBe(false);
    g.player.x=EAST_POST_X;g.player.wood=4;
    expect(buildFenceTorch(g,"right")).toMatch(/LIT/);
    expect(g.player.wood).toBe(2);
    const before=canvas();drawCampFence(before.ctx,g);
    expect(before.rects.some(r=>r.color==="#8e6540"&&r.x===EAST_POST_X-3&&r.y===124)).toBe(true);
    g.campExpansion=1;
    expect(availableFencePosts(g)).toEqual(["left","right","outer"]);
    expect(campClaimBounds(g).east).toBe(EAST_EXPANDED_X);
    expect(torchPostX(g,"right")).toBe(EAST_POST_X);
    expect(torchPostX(g,"outer")).toBe(EAST_EXPANDED_X);
    expect(g.fenceTorches).toEqual({left:0,right:7,outer:0});
    expect(fenceTorchLights(g)).toEqual([{x:EAST_POST_X,y:112,side:"right"}]);
    expect(nearestFenceTorchPost(g)).toBe("right");
    const after=canvas();drawCampFence(after.ctx,g);
    // Inner original corner has its OWN tall post, even though it is no
    // longer the end of the expanded palisade.
    expect(after.rects.some(r=>r.color==="#8e6540"
      &&r.x===EAST_POST_X-3&&r.y===124&&r.w===6)).toBe(true);
    expect(after.rects.some(r=>r.color==="#8e6540"
      &&r.x===EAST_EXPANDED_X-3&&r.y===124&&r.w===6)).toBe(true);
  });
  it("charges each of the three actual posts exactly two carried logs",()=>{
    const g=run();g.player.wood=8;
    g.player.x=EAST_EXPANDED_X;
    expect(buildFenceTorch(g,"outer")).toMatch(/BUILD THE OUTER/);
    expect(g.player.wood).toBe(8);
    g.campExpansion=1;
    for(const [side,x] of [["left",WEST_POST_X],["right",EAST_POST_X],["outer",EAST_EXPANDED_X]] as const){
      g.player.x=x;
      expect(nearestFenceTorchPost(g)).toBe(side);
      expect(buildFenceTorch(g,side)).toMatch(/LIT/);
      expect(activeFenceTorch(g,side)).toBe(true);
      const before=g.player.wood;
      expect(buildFenceTorch(g,side)).toMatch(/DAWNS LEFT/);
      expect(g.player.wood).toBe(before);
    }
    expect(FENCE_TORCH_COST).toBe(2);
    expect(g.player.wood).toBe(2);
    expect(g.fenceTorches).toEqual({left:7,right:7,outer:7});
    expect(fenceTorchLights(g).map(t=>t.x)).toEqual([WEST_POST_X,EAST_POST_X,EAST_EXPANDED_X]);
  });
  it("protects only lit posts and linked segments, not phantom space in new camp",()=>{
    const g=run(),m=meta();g.campExpansion=1;g.player.wood=6;
    g.player.x=WEST_POST_X;buildFenceTorch(g,"left");
    g.player.x=EAST_POST_X;buildFenceTorch(g,"right");
    g.player.x=CX;
    expect(protectedByFenceTorches(g)).toBe(true);
    expect(coldWarmthDrain(g,m)).toBeGreaterThan(0); // partial shelter, no immunity
    // A non-existent third flame must not protect the far expanded section.
    g.player.x=EAST_POST_X+61;
    expect(protectedByFenceTorches(g)).toBe(false);
    expect(coldWarmthDrain(g,m)).toBeGreaterThan(0);
    g.player.x=EAST_EXPANDED_X;buildFenceTorch(g,"outer");
    g.player.x=EAST_POST_X+61;
    expect(protectedByFenceTorches(g)).toBe(true);
    expect(coldWarmthDrain(g,m)).toBeGreaterThan(0); // partial shelter, no immunity
    g.player.x=EAST_EXPANDED_X+2;
    expect(protectedByFenceTorches(g)).toBe(false);
    expect(coldWarmthDrain(g,m)).toBeGreaterThan(0);
    // Losing the old inner flame disconnects each fenced section.
    g.fenceTorches.right=0;
    g.player.x=EAST_POST_X+59;
    expect(protectedByFenceTorches(g)).toBe(false);
  });
  it("all three posts tick and expire independently across seven genuine dawns",()=>{
    const g=run();g.campExpansion=1;
    g.fenceTorches={left:7,right:3,outer:1};
    expect(advanceFenceTorchDawn(g)).toEqual(["outer"]);
    expect(g.fenceTorches).toEqual({left:6,right:2,outer:0});
    expect(advanceFenceTorchDawn(g)).toEqual([]);
    expect(advanceFenceTorchDawn(g)).toEqual(["right"]);
    expect(g.fenceTorches.left).toBe(4);
    for(let i=0;i<4;i++)advanceFenceTorchDawn(g);
    expect(g.fenceTorches.left).toBe(0);
    expect(g.fenceTorches.outer).toBe(0);
    expect(FENCE_TORCH_DAWNS).toBe(7);
  });
  it("keeps P47 expanded saves' lit old outer torch without granting a duplicate",()=>{
    const g=run();g.campExpansion=1;g.player.x=WEST_POST_X;
    const snap=captureRunSnapshot(g);
    expect(snap.version).toBe(1);
    snap.state.fenceTorches={left:2,right:5}; // real P47 only had two keys
    const restored=createEngine();restored.resumeData=snap.state;
    titleActions(restored,meta())[0].act();
    expect(restored.campExpansion).toBe(1);
    expect(restored.fenceTorches).toEqual({left:2,right:0,outer:5});
    expect(fenceTorchLights(restored).map(t=>t.x)).toEqual([WEST_POST_X,EAST_EXPANDED_X]);
    expect(normalizeFenceTorches({left:2,right:5},true))
      .toEqual({left:2,right:0,outer:5});
    // A new P48 3-key save is NOT remapped or awarded a second torch.
    const safe=captureRunSnapshot(restored);
    expect(safe.state.fenceTorches).toEqual({left:2,right:0,outer:5});
    const second=createEngine();second.resumeData=safe.state;
    titleActions(second,meta())[0].act();
    expect(second.fenceTorches).toEqual({left:2,right:0,outer:5});
  });
  it("draws exactly as many actual torch flames as lit physical posts",()=>{
    const g=run(),art=canvas();
    g.campExpansion=1;g.isNight=true;
    drawFenceTorches(art.ctx,g);
    expect(art.rects).toHaveLength(0);
    g.fenceTorches={left:1,right:1,outer:1};
    drawFenceTorches(art.ctx,g);
    expect(art.rects.filter(r=>r.color==="#87afb0")).toHaveLength(3);
    g.fenceTorches.right=0;
    const two=canvas();drawFenceTorches(two.ctx,g);
    expect(two.rects.filter(r=>r.color==="#87afb0")).toHaveLength(2);
  });
});
describe("Patch #48: no free camp-upgrade night lights",()=>{
  it("creates no sources for a max-level camp with all flames off",()=>{
    const g=run();g.campExpansion=1;g.stage=6;g.isNight=true;
    expect(nightLightSources48(g)).toEqual([]);
    g.fenceTorches.left=7;g.fenceTorches.right=7;g.fenceTorches.outer=7;
    const sources=nightLightSources48(g);
    expect(sources).toHaveLength(3);
    expect(sources.map(s=>s.kind)).toEqual(["fence","fence","fence"]);
    expect(sources.map(s=>s.x)).toEqual([WEST_POST_X,EAST_POST_X,EAST_EXPANDED_X]);
    expect(sources.every(s=>s.y===112)).toBe(true);
  });
  it("adds only the genuine campfire and carried torch, not fake cabin windows",()=>{
    const g=run();g.stage=6;g.campExpansion=1;
    g.fireLit=true;g.fuel=70;
    g.player.x=CX+24;g.player.y=155;g.player.torchT=10;
    const sources=nightLightSources48(g);
    expect(sources.map(s=>s.kind)).toEqual(["fire","hand"]);
    expect(sources[0].x).toBe(CX);
    expect(sources[1].x).toBe(CX+24);
    g.fireLit=false;g.player.torchT=0;
    expect(nightLightSources48(g)).toHaveLength(0);
  });
});
describe("Patch #48: dedicated Log Storage TAKE and stored quantity",()=>{
  it("shows a 3rd translucent TAKE circle in the middle only while logs are stored",()=>{
    const g=run(),view=canvas(),clicked:string[]=[];
    g.ui="run";g.builtPile=true;g.player.x=PILE_X;g.camX=PILE_X-160;
    g.zones=[];g.stored=0;
    expect(stationBubbleRects(g,"pile").take).toBeNull();
    expect(storageReadout48(g)).toBe("0/12 LOGS");
    expect(selectStation(g,"pile")).toBe(true);
    drawStationBubbles(view.ctx,g,"pile",(id,action)=>clicked.push(action));
    expect(g.zones).toHaveLength(2);
    g.stored=7;g.zones=[];
    const buttons=stationBubbleRects(g,"pile");
    expect(buttons.take).not.toBeNull();
    expect(buttons.primary!.x+buttons.primary!.w).toBeLessThan(buttons.take!.x);
    expect(buttons.take!.x+buttons.take!.w).toBeLessThan(buttons.upgrade!.x);
    drawStationBubbles(view.ctx,g,"pile",(_id,action)=>clicked.push(action));
    expect(g.zones).toHaveLength(3);
    g.zones[0].onDown();g.zones[1].onDown();g.zones[2].onDown();
    expect(clicked.slice(-3)).toEqual(["primary","take","upgrade"]);
    expect(storageReadout48(g)).toBe("7/12 LOGS");
    g.stage=4;
    expect(storageReadout48(g)).toBe("7/40 LOGS");
    expect(view.rects.some(r=>r.color==="#ad8653")).toBe(true);
    expect(selectedStation(g)).toBe("pile");
  });
  it("ACT stores; TAKE withdraws even when carrying logs; never auto-withdraws on ACT",()=>{
    const g=run(),m=meta();g.builtPile=true;g.player.x=PILE_X;
    g.player.wood=3;g.stored=2;
    expect(selectStation(g,"pile")).toBe(true);
    expect(performStationAction(g,m,"pile","primary")).toBe(true);
    expect(g.player.wood).toBe(0);expect(g.stored).toBe(5);
    // Left/default action cannot unexpectedly reverse direction.
    expect(performStationAction(g,m,"pile","primary")).toBe(true);
    expect(g.player.wood).toBe(0);expect(g.stored).toBe(5);
    expect(performStationAction(g,m,"pile","take")).toBe(true);
    expect(g.player.wood).toBe(5);expect(g.stored).toBe(0);
    expect(stationBubbleRects(g,"pile").take).toBeNull();
    expect(performStationAction(g,m,"pile","take")).toBe(true);
    expect(g.stored).toBe(0);
    expect(performStationAction(g,m,"hearth","take")).toBe(false);
    expect(performStationAction(g,m,"pile","plans")).toBe(false);
  });
  it("touch TAKE obeys carrying capacity with non-empty bag, never spending wood",()=>{
    const g=run(),m=meta();g.builtPile=true;g.player.x=PILE_X;
    g.stored=10;g.player.wood=4;
    selectStation(g,"pile");
    const start=g.player.wood+g.stored;
    expect(performStationAction(g,m,"pile","take")).toBe(true);
    expect(g.player.wood).toBe(5);
    expect(g.stored).toBe(9);
    expect(g.player.wood+g.stored).toBe(start);
    expect(performStationAction(g,m,"pile","take")).toBe(true);
    expect(g.player.wood).toBe(5);
    expect(g.stored).toBe(9);
    g.player.x=CX;
    expect(performStationAction(g,m,"pile","take")).toBe(false);
  });
  it("keeps first ACT selection, second ACT left STORE without opening a modal",()=>{
    const g=run(),m=meta();g.builtPile=true;g.player.x=PILE_X;
    g.player.wood=2;g.stored=4;
    const cb={toast:vi.fn(),end:vi.fn()};
    handleKey(g,m,"e",true);update(g,m,.02,cb);
    expect(selectedStation(g)).toBe("pile");
    expect(g.actionLabel).toBe("STORE");
    expect(g.stored).toBe(4);
    handleKey(g,m,"e",true);update(g,m,.02,cb);
    expect(g.stored).toBe(6);
    expect(g.player.wood).toBe(0);
    expect(g.menu).toBeNull();
    expect(stationBubbleRects(g,"pile").take).not.toBeNull();
  });
});
