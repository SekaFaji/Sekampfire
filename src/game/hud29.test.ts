import { describe, expect, it } from "vitest";
import { drawCampHUD, drawCampMinimap, drawHudFrame } from "./hud";
import { createEngine, drawRunChrome } from "./game";

type Rect = { x:number; y:number; w:number; h:number; color:string };
function canvas(){
  const rects:Rect[] = [];
  let fill="#000";
  const ctx:any={
    get fillStyle(){return fill;},
    set fillStyle(c:string){fill=c;},
    fillRect(x:number,y:number,w:number,h:number){
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
      rects.push({x,y,w,h,color:fill});
    },
  };
  return { ctx,rects };
}
const meta=()=>({ash:12,best:4,up:{}});
function game() {
  const g=createEngine();g.ui="run";g.menu=null;g.player.wood=3;
  g.player.x=800;g.player.warmth=85;g.fireLit=true;g.fuel=65;
  g.night=1;g.time=14;g.weather="clear";g.actionLabel="GET LOGS";
  return g;
}
describe("Patch #29 native-resolution real-game HUD",()=>{
  it("uses three compact wooden panels below a separate wide minimap",()=>{
    const g=game(),v=canvas();
    drawCampHUD(v.ctx,g,meta());
    for(const shape of [[3,17,109,23],[114,17,105,23],[221,17,97,23]]) {
      expect(v.rects.some(r=>r.x===shape[0]&&r.y===shape[1]&&r.w===shape[2]&&r.h===shape[3])).toBe(true);
    }
    // Every primary HUD panel ends before the y=43 notification strip.
    expect(Math.max(...v.rects.filter(r=>r.y>=17&&r.y<40).map(r=>r.y+r.h))).toBeLessThanOrEqual(40);
    expect(v.rects.every(r=>r.x>=0&&r.x+r.w<=320)).toBe(true);
  });
  it("draws the minimap from actual tree and player coordinates",()=>{
    const g=game(),v=canvas();
    g.trees=[{x:200},{x:1400}];
    const palette={ridge:"#667766",treeLight:"#a7804a"};
    drawCampMinimap(v.ctx,g,palette);
    expect(v.rects.some(r=>r.x===3&&r.y===2&&r.w===314&&r.h===13)).toBe(true);
    const trunks=v.rects.filter(r=>r.color==="#a7804a"&&r.w===2&&r.h===5);
    expect(trunks).toHaveLength(2);
    expect(trunks[0].x).toBeLessThan(trunks[1].x);
    const original=v.rects.find(r=>r.color==="#fff9ea"&&r.w===2&&r.h===5);
    expect(original).toBeDefined();
    g.player.x=1250;const moved=canvas();
    drawCampMinimap(moved.ctx,g,palette);
    const next=moved.rects.find(r=>r.color==="#fff9ea"&&r.w===2&&r.h===5);
    expect(next!.x).toBeGreaterThan(original!.x);
  });
  it("renders existing wood storage, fire and season without affecting run state",()=>{
    const g=game(),m=meta();g.builtPile=true;g.stored=8;g.ashEarned=9;g.campUpgrades.pile=1;
    const before=JSON.stringify({player:g.player,stored:g.stored,fuel:g.fuel,night:g.night,ash:g.ashEarned,meta:m});
    const v=canvas();drawCampHUD(v.ctx,g,m);
    expect(v.rects.length).toBeGreaterThan(130);
    expect(JSON.stringify({player:g.player,stored:g.stored,fuel:g.fuel,night:g.night,ash:g.ashEarned,meta:m})).toBe(before);
  });
  it("preserves original Build, ACT, Torch and Menu hit zones",()=>{
    const g=game(),v=canvas();
    g.zones=[];drawRunChrome(v.ctx,g);
    const target=(x:number,y:number,w:number,h:number)=>g.zones.find((z:any)=>z.x===x&&z.y===y&&z.w===w&&z.h===h);
    expect(target(133,151,54,26)).toBeDefined();
    expect(target(77,158,47,18)).toBeDefined();
    expect(target(196,158,48,18)).toBeDefined();
    expect(target(284,21,32,16)).toBeDefined();
    target(133,151,54,26)!.onDown();
    expect(g.pressE).toBe(true);
    target(133,151,54,26)!.onUp();
    expect(g.keys.act).toBe(false);
    target(77,158,47,18)!.onDown();
    expect(g.menu).toBe("build");
  });
  it("wooden frame stays within all 320x180 logical coordinates",()=>{
    const v=canvas();
    drawHudFrame(v.ctx,3,17,109,23);
    expect(v.rects.every(r=>r.x>=0&&r.y>=0&&r.x+r.w<=320&&r.y+r.h<=180)).toBe(true);
  });
});
