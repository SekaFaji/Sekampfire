import { describe, expect, it, vi } from "vitest";
import { createEngine, drawMenu, drawScreen, handlePointer, handleKey } from "./game";
import { drawCampHUD, drawHudFrame } from "./hud";
import { WEST_POST_X, EAST_POST_X, EXPANSION_MARKER_X, EAST_EXPANDED_X,
  isCampTreeExcluded, keepFencePostsClear, clearClaimedTrees } from "./campBoundary";
import { CX } from "./config";

const meta=()=>({ash:0,best:0,up:{},collection:{},museumBuilt:false});
function canvas() {
  const rects: Array<{x:number;y:number;w:number;h:number;color:string}>=[];
  let color="";
  const ctx:any={
    get fillStyle(){return color;},
    set fillStyle(v:string){color=v;},
    fillRect(x:number,y:number,w:number,h:number){rects.push({x,y,w,h,color});},
    save:vi.fn(),restore:vi.fn(),translate:vi.fn(),scale:vi.fn(),
    beginPath:vi.fn(),rect:vi.fn(),clip:vi.fn(),moveTo:vi.fn(),
    lineTo:vi.fn(),arc:vi.fn(),closePath:vi.fn(),fill:vi.fn(),stroke:vi.fn(),
    createRadialGradient:()=>({addColorStop:vi.fn()})
  };
  return {ctx,rects};
}
describe("Patch #32 active modal input isolation",()=>{
  it("cannot activate How to Play or title buttons through Endless Night",()=>{
    const g=createEngine(),m=meta();g.ui="title";g.zones=[];
    const screen=canvas();
    drawScreen(screen.ctx,g,m); // Title registers buttons beneath the dialog
    handlePointer(g,"down",1,250,94);
    expect(g.menu).toBe("endlessNightInfo");
    drawMenu(screen.ctx,g,m);
    handlePointer(g,"down",2,250,115); // How To Play underneath the panel
    expect(g.menu).toBe("endlessNightInfo");
    expect(g.helpPage).toBe(0);
    handlePointer(g,"down",3,160,85); // Title 'shop' behind the overlay
    expect(g.menu).toBe("endlessNightInfo");
    handlePointer(g,"down",4,160,119); // Empty interior must not close it
    expect(g.menu).toBe("endlessNightInfo");
    handlePointer(g,"down",5,160,155); // Explicit BACK TO MENU
    expect(g.menu).toBeNull();
  });
  it("outside taps close, but blank space inside an actual list menu does not",()=>{
    const g=createEngine(),m=meta();g.ui="run";g.menu="build";g.zones=[];
    drawMenu(canvas().ctx,g,m);
    const r=g.menuRect;
    expect(r).toBeTruthy();
    handlePointer(g,"down",1,r.x+4,r.y+r.h-3);
    expect(g.menu).toBe("build");
    handlePointer(g,"down",2,4,4);
    expect(g.menu).toBeNull();
  });
  it("retains X, back and parent-settings navigation, not a tap-through shortcut",()=>{
    const g=createEngine(),m=meta();g.ui="title";g.menu="help";g.zones=[];
    drawMenu(canvas().ctx,g,m);
    handlePointer(g,"down",1,286,18); // X in illustrated help
    expect(g.menu).toBeNull();
    g.ui="run";g.menu="settings";g.settingsFrom="pause";g.zones=[];
    drawMenu(canvas().ctx,g,m);
    handlePointer(g,"down",2,4,4);
    expect(g.menu).toBe("pause");
    g.zones=[];drawMenu(canvas().ctx,g,m);
    handleKey(g,m,"escape",true);
    expect(g.menu).toBeNull();
  });
  it("B never closes or replaces an existing dialog",()=>{
    const g=createEngine(),m=meta();
    g.ui="run";g.menu="guide";
    handleKey(g,m,"b",true);expect(g.menu).toBe("guide");
    g.menu=null;handleKey(g,m,"b",true);expect(g.menu).toBeNull(); // remote BUILD removed
  });
  it("menu changes invalidate stale hit zones until the next rendered frame",()=>{
    const g=createEngine(),m=meta();g.ui="title";g.menu="endlessNightInfo";
    g.zones=[{x:102,y:85,w:116,h:14,onDown:()=>{g.menu="shop";}}];
    g.menuZonesFor="help";
    handlePointer(g,"down",1,160,92);
    expect(g.menu).toBe("endlessNightInfo");
    drawMenu(canvas().ctx,g,m);
    expect(g.menuZonesFor).toBe("endlessNightInfo");
    expect(g.menuZonesStart).toBe(1);
  });
});
describe("Patch #32 clean fence and translucent resource HUD",()=>{
  it("reserves full canopy clearance around both posts and the expansion marker",()=>{
    const g=createEngine();
    expect(isCampTreeExcluded(g,WEST_POST_X-20)).toBe(true);
    expect(isCampTreeExcluded(g,EAST_POST_X+20)).toBe(true);
    expect(isCampTreeExcluded(g,EXPANSION_MARKER_X+19)).toBe(true);
    expect(isCampTreeExcluded(g,WEST_POST_X-42)).toBe(false);
    g.campExpansion=1;
    expect(isCampTreeExcluded(g,EAST_EXPANDED_X+20)).toBe(true);
    expect(isCampTreeExcluded(g,EAST_EXPANDED_X+36)).toBe(false);
  });
  it("moves old and newly cleared logs away from markers without losing wood",()=>{
    const g=createEngine();g.fenceLeft=true;g.fenceRight=true;
    g.pickups=[{x:WEST_POST_X+3,y:149,w:3},{x:EAST_POST_X-4,y:150,w:2},
      {x:CX,y:150,w:1}];
    const sum=g.pickups.reduce((a:number,p:any)=>a+p.w,0);
    keepFencePostsClear(g);
    expect(g.pickups.reduce((a:number,p:any)=>a+p.w,0)).toBe(sum);
    expect(g.pickups[2].x).toBe(CX); // Normal fuel in the camp remains
    expect(g.pickups[0].x).toBeGreaterThan(EAST_POST_X+30);
    expect(g.pickups[1].x).toBeGreaterThan(EAST_POST_X+30);
    g.campExpansion=1;
    g.trees=[{x:CX+152,id:22,y:149,tier:1}];
    expect(clearClaimedTrees(g)).toBe(1);
    expect(g.trees).toHaveLength(0);
    expect(g.pickups.at(-1).w).toBe(2);
    expect(g.pickups.at(-1).x).toBeGreaterThan(EAST_EXPANDED_X+30);
  });
  it("translucent HUD keeps existing frame positions and visible readable fill",()=>{
    const v=canvas();drawHudFrame(v.ctx,3,17,109,23);
    expect(v.rects.some(x=>x.color==="rgba(18,30,41,0.64)"&&x.w===105&&x.h===19)).toBe(true);
    const g=createEngine();g.ui="run";g.player.wood=2;g.ashEarned=6;
    const overlay=canvas();drawCampHUD(overlay.ctx,g,meta());
    expect(overlay.rects.some(x=>x.x===3&&x.y===17&&x.w===103&&x.h===23)).toBe(true);
  });
});
