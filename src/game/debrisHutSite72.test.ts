import { describe, expect, it, vi } from "vitest";
import { createEngine, update } from "./game";
import { HUT_DOOR_X, HUT_LOG_COST, nearDebrisHut,
  drawDebrisHutExterior, interactDebrisHut } from "./debrisHut";
import { drawStructures } from "./renderSprites";

function camp() {
  const g = createEngine();
  g.ui = "run";
  g.over = false;
  g.menu = null;
  g.fenceLeft = true;
  g.fenceRight = true;
  g.player.x = HUT_DOOR_X;
  g.keys = {};
  g.pressE = false;
  g.trees = [];
  g.falling = [];
  g.pickups = [];
  return g;
}
function canvas() {
  const rects: {x:number;y:number;w:number;h:number;fill:string}[] = [];
  let fill = "";
  const ctx: any = {
    set fillStyle(v:string) {fill = v;},
    get fillStyle() {return fill;},
    fillRect(x:number,y:number,w:number,h:number) {
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      rects.push({x,y,w,h,fill});
    }
  };
  return {ctx,rects};
}
function hasPlaque(rects: ReturnType<typeof canvas>["rects"]) {
  return rects.some(r => r.x===HUT_DOOR_X-31 && r.y===80 &&
    r.w===62 && r.h===23 && r.fill==="#302b25");
}

describe("Patch #72 - discoverable Debris Hut building site", () => {
  it("displays a prominent permanent sign and hut-shaped frame from zero logs once both posts exist", () => {
    const g=camp(),v=canvas();
    g.fenceRight=false;
    drawDebrisHutExterior(v.ctx,g);
    expect(v.rects).toHaveLength(0);
    g.fenceRight=true;
    drawDebrisHutExterior(v.ctx,g);
    expect(hasPlaque(v.rects)).toBe(true);
    expect(v.rects.some(r=>r.x===HUT_DOOR_X-25 && r.y===145 && r.w===50)).toBe(true);
    expect(v.rects.some(r=>r.x===HUT_DOOR_X-23 && r.y===141)).toBe(true);
    expect(v.rects.some(r=>r.fill==="#ffe6af")).toBe(true); // title pixels
    expect(v.rects.some(r=>r.fill==="#f5d49b")).toBe(true); // 0/25 pixels
    expect(nearDebrisHut(g)).toBe(true);
  });

  it("retains the visible sign while depositing logs, raising the hut, and still uses 25 real logs", () => {
    const g=camp(),v=canvas();
    g.player.wood=10;
    expect(interactDebrisHut(g)).toContain("10/25");
    expect(g.player.wood).toBe(0);
    drawDebrisHutExterior(v.ctx,g);
    expect(hasPlaque(v.rects)).toBe(true);
    expect(v.rects.filter(r=>r.fill==="#815534")).toHaveLength(2);
    g.player.wood=15;
    expect(interactDebrisHut(g)).toContain("25/25");
    expect(g.player.wood).toBe(0);
    expect(g.hutLogs).toBe(HUT_LOG_COST);
    expect(interactDebrisHut(g)).toContain("RAISING");
    const build=canvas();
    drawDebrisHutExterior(build.ctx,g);
    expect(hasPlaque(build.rects)).toBe(true);
    expect(build.rects.some(r=>r.fill==="#f5d49b")).toBe(true);
  });

  it("layers the building site sign on top of the finished Cabin artwork", () => {
    const g=camp(),v=canvas();
    g.stage=6;
    drawStructures(v.ctx,g);
    expect(hasPlaque(v.rects)).toBe(true);
    const cabinStart=v.rects.findIndex(r=>r.x===HUT_DOOR_X-70 &&
      r.y===122 && r.w===84);
    const sign=v.rects.findIndex(r=>r.x===HUT_DOOR_X-31 &&
      r.y===80 && r.w===62);
    expect(cabinStart).toBeGreaterThanOrEqual(0);
    expect(sign).toBeGreaterThan(cabinStart);
    expect(v.rects.some(r=>r.x===HUT_DOOR_X-25 && r.w===50)).toBe(true);
  });

  it("does not confuse the hut ACT interaction with the neighboring Log Storage", () => {
    const g=camp(),m={up:{},ash:0,museumBuilt:false,collection:{},guideFx:true};
    const toast=vi.fn(),end=vi.fn();
    g.builtPile=true;
    g.stored=9;
    g.pressE=true;
    update(g,m,0.02,{toast,end});
    expect(toast).toHaveBeenCalledWith("BRING 25 PINE LOGS TO BUILD THE DEBRIS HUT.");
    expect(g.stored).toBe(9);
    expect(g.player.wood).toBe(0);
    expect(g.actionLabel).toBe("GET LOGS");
    g.player.wood=2;
    update(g,m,0.02,{toast,end});
    expect(g.actionLabel).toBe("ADD LOGS");
    expect(end).not.toHaveBeenCalled();
  });

  it("a finished hut is recognizable without a false unfinished building sign", () => {
    const g=camp(),v=canvas();
    g.hutBuilt=true;
    g.hutLogs=HUT_LOG_COST;
    drawDebrisHutExterior(v.ctx,g);
    expect(hasPlaque(v.rects)).toBe(false);
    expect(v.rects.some(r=>r.fill==="#151d20")).toBe(true); // real doorway
    expect(interactDebrisHut(g)).toContain("ENTERED");
    expect(g.menu).toBe("hut");
  });
});
