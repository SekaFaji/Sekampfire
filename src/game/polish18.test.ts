import { describe, expect, it } from "vitest";
import { createEngine, benchRows, moveSel, closeMenu, drawSideArrows, drawMovementFeedback } from "./game";
import { shorelineWaveOffset, shorelineFoam, reflectionOffset, reflectionOpacity, waterGlint } from "./water";

function state() {
  const g = createEngine();
  g.ui = "run"; g.menu = "bench"; g.menuSel = 0;
  g.player.wood = 4; g.stored = 20;
  return g;
}
const meta: any = { ash: 0, up: {}, best: 0, totalAsh: 0 };

describe("workbench purchase confirmation", () => {
  it("requires two deliberate selections of the same craft and deducts wood exactly once", () => {
    const g = state();
    const initial = g.player.wood + g.stored;
    let rows = benchRows(g, meta);
    const item = rows[0];
    expect(item.right).toContain("WOOD");
    item.onDown();
    expect(g.craftConfirm).toBe("pack");
    expect(g.player.wood + g.stored).toBe(initial);
    expect(g.crafts.pack).toBeUndefined();
    rows = benchRows(g, meta);
    expect(rows[0].right).toBe("CONFIRM?");
    expect(rows[0].desc).toContain("TAP AGAIN");
    rows[0].onDown();
    expect(g.craftConfirm).toBeNull();
    expect(g.crafts.pack).toBe(true);
    expect(g.player.wood + g.stored).toBe(initial - 6);
    benchRows(g, meta)[0].onDown();
    expect(g.player.wood + g.stored).toBe(initial - 6);
  });

  it("switching to a different craft arms that item instead of buying either one", () => {
    const g = state();
    const before = g.player.wood + g.stored;
    benchRows(g, meta)[0].onDown();
    benchRows(g, meta)[1].onDown();
    expect(g.craftConfirm).toBe("boots");
    expect(g.crafts.pack).toBeUndefined();
    expect(g.crafts.boots).toBeUndefined();
    expect(g.player.wood + g.stored).toBe(before);
  });

  it("resets on keyboard selection changes and cancel/close/reopen", () => {
    const g = state();
    benchRows(g, meta)[0].onDown();
    moveSel(g, meta, 1);
    expect(g.craftConfirm).toBeNull();
    benchRows(g, meta)[1].onDown();
    closeMenu(g);
    expect(g.craftConfirm).toBeNull();
    g.menu = "bench";
    expect(benchRows(g, meta)[1].right).toBe("4 WOOD");
  });

  it("cannot spend when resources disappear between the first and second tap", () => {
    const g = state();
    benchRows(g, meta)[0].onDown();
    g.player.wood = 0; g.stored = 0;
    benchRows(g, meta)[0].onDown();
    expect(g.crafts.pack).toBeUndefined();
    expect(g.craftConfirm).toBeNull();
    expect(g.player.wood + g.stored).toBe(0);
  });
});

describe("daylight and night movement arrows", () => {
  function canvas() {
    const marks: Array<{x:number;y:number;w:number;h:number;color:string}> = [];
    let color = "";
    const ctx: any = {
      set fillStyle(v: string) { color = v; },
      fillRect(x: number,y: number,w: number,h: number) { marks.push({x,y,w,h,color}); },
    };
    return {ctx,marks};
  }
  it("shows charcoal daytime pressed arrows, with pale outlines and unchanged idle hints", () => {
    const g=createEngine();g.animT=1.3;g.isNight=false;g.pleft=true;
    const v=canvas();drawSideArrows(v.ctx,g);
    const outlines=v.marks.filter(m=>m.w===4&&m.h===4);
    const cores=v.marks.filter(m=>m.w===2&&m.h===2);
    expect(outlines).toHaveLength(14);
    expect(cores).toHaveLength(14);
    expect(cores.some(m=>m.x<40)).toBe(true);
    expect(cores.some(m=>m.x>280)).toBe(true);
    expect(cores.filter(m=>m.x<40).every(m=>m.color==="rgba(29,43,49,0.98)")).toBe(true);
    expect(outlines.filter(m=>m.x<40).every(m=>m.color==="rgba(219,230,234,0.90)")).toBe(true);
    // Idle right arrow stays pale to help players discover the controls.
    expect(cores.filter(m=>m.x>280).every(m=>m.color.startsWith("rgba(255,246,218,"))).toBe(true);
    expect(outlines.filter(m=>m.x>280).every(m=>m.color==="rgba(14,23,34,0.82)")).toBe(true);
  });

  it("moves the daytime charcoal active state to the opposite side without changing arrow positions", () => {
    const g=createEngine();g.animT=1.3;g.isNight=false;g.pright=true;
    const v=canvas();drawSideArrows(v.ctx,g);
    const cores=v.marks.filter(m=>m.w===2&&m.h===2);
    const outlines=v.marks.filter(m=>m.w===4&&m.h===4);
    expect(cores.filter(m=>m.x>280).every(m=>m.color==="rgba(29,43,49,0.98)")).toBe(true);
    expect(outlines.filter(m=>m.x>280).every(m=>m.color==="rgba(219,230,234,0.90)")).toBe(true);
    expect(cores.filter(m=>m.x<40).every(m=>m.color.startsWith("rgba(255,246,218,"))).toBe(true);
    expect(cores.map(m=>m.x)).toEqual([23,20,17,14,17,20,23,295,298,301,304,301,298,295]);
  });
  it("darkens the full pressed-side gradient in daytime without moving its boundary", () => {
    const g=createEngine(); g.isNight=false;g.moveFeedbackLeft=1;
    const stops: Array<[number,string]> = [], filled: any[] = [];
    const ctx: any = {
      createLinearGradient: () => ({ addColorStop: (p:number,c:string) => stops.push([p,c]) }),
      set fillStyle(_v:any) {},
      fillRect: (...args: any[]) => filled.push(args),
    };
    drawMovementFeedback(ctx,g);
    expect(filled).toContainEqual([0,0,48,180]);
    expect(stops[0][1]).toContain("24,37,43,0.28");
    expect(stops[1][1]).toContain(",0)");
    expect(stops.some(([_, color]) => color.includes("250,222,157"))).toBe(false);
  });

  it("keeps the right-side daylight pressed wash charcoal and retains a soft fade", () => {
    const g=createEngine(); g.isNight=false;g.moveFeedbackRight=0.5;
    const stops: Array<[number,string]> = [], filled: any[] = [];
    const ctx: any = {
      createLinearGradient: () => ({ addColorStop: (p:number,c:string) => stops.push([p,c]) }),
      set fillStyle(_v:any) {},
      fillRect: (...args: any[]) => filled.push(args),
    };
    drawMovementFeedback(ctx,g);
    expect(filled).toContainEqual([272,0,48,180]);
    expect(stops[0][1]).toContain(",0)");
    expect(stops[1][1]).toContain("24,37,43,0.14");
  });

  it("retains high contrast for both arrows at night", () => {
    const g=createEngine();g.animT=0;g.isNight=true;g.pright=true;
    const v=canvas();drawSideArrows(v.ctx,g);
    expect(v.marks.filter(m=>m.w===2&&m.h===2&&m.x>280).every(m=>m.color==="rgba(255,219,147,0.96)")).toBe(true);
  });
});

describe("seasonal moving water stays cosmetic", () => {
  it("clamps all reflection shifts and fades at any depth, including stormy water", () => {
    const offsets=Array.from({length:160},(_,i)=>reflectionOffset(i/10,i,1.6));
    expect(offsets.every(x=>Number.isInteger(x)&&x>=-4&&x<=4)).toBe(true);
    expect(new Set(offsets).size).toBeGreaterThan(3);
    const alphas=Array.from({length:41},(_,i)=>reflectionOpacity(i,38,i%2===0));
    expect(alphas.every(x=>x>=0.12&&x<=0.54)).toBe(true);
    expect(reflectionOpacity(35,38)).toBeLessThan(reflectionOpacity(0,38));
  });
  it("produces deterministic bounded surface glints and gentle shoreline motion", () => {
    for(let i=0;i<25;i++) {
      const a=waterGlint(i*0.2,i,190,320);
      expect(waterGlint(i*0.2,i,190,320)).toEqual(a);
      expect(a.x).toBeGreaterThanOrEqual(0);
      expect(a.x).toBeLessThan(320);
      expect(a.y).toBeGreaterThanOrEqual(3);
      expect(a.y).toBeLessThan(34);
      expect(a.alpha).toBeGreaterThan(0);
      expect(a.length).toBeGreaterThanOrEqual(5);
      expect(Math.abs(shorelineWaveOffset(i,190+i,1.28))).toBeLessThanOrEqual(2);
      expect(shorelineFoam(i,190+i)).toBeGreaterThanOrEqual(0);
    }
  });
});
