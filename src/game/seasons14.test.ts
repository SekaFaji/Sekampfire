import { afterEach, describe, expect, it, vi } from "vitest";
import { visualSeason, visualPalette, seasonDay, seasonNumber, DAYS_PER_SEASON, SEASONS } from "./palette";
import { wildlifeForSeason, wildlifeMovementType } from "./wildlife";
import { drawSeasonalWildlife } from "./renderWildlife";
import { shorelineFoam, shorelineWaveOffset } from "./water";
import { createEngine, spawnEvent, updateAmbient, drawMovementFeedback } from "./game";

afterEach(() => vi.restoreAllMocks());
const seasonState = (night: number, isNight = false) => ({
  night, isNight, time: isNight ? 55 : 15, longNightActive: false,
});
describe("four seven-day seasons", () => {
  it("rotates exactly every seven completed days, without switching mid-night", () => {
    expect(DAYS_PER_SEASON).toBe(7);
    expect(SEASONS).toEqual(["autumn","winter","spring","summer"]);
    for (const [night, season, day] of [
      [0,"autumn",1], [6,"autumn",7], [7,"winter",1],
      [13,"winter",7], [14,"spring",1], [20,"spring",7],
      [21,"summer",1], [27,"summer",7], [28,"autumn",1],
    ] as const) {
      expect(visualSeason(seasonState(night))).toBe(season);
      expect(seasonDay(seasonState(night))).toBe(day);
    }
    expect(visualSeason(seasonState(7,true))).toBe("autumn");
    expect(visualSeason(seasonState(8,true))).toBe("winter");
    expect(seasonNumber(seasonState(28))).toBe(0);
  });
  it("blends palettes only at season transitions", () => {
    const before = visualPalette({ ...seasonState(6), time: 15 });
    const boundary = visualPalette({ ...seasonState(7), time: 0 });
    const complete = visualPalette({ ...seasonState(7), time: 15 });
    expect(boundary.ground).toBe(before.ground);
    expect(complete.ground).not.toBe(before.ground);
    expect(visualSeason({ ...seasonState(9), longNightActive: true })).toBe("winter");
    expect(visualSeason({ ...seasonState(22), longNightActive: true })).toBe("summer");
  });
});

describe("season-specific cosmetic wildlife", () => {
  it("gives every season a distinct nocturnal, aerial and ground species", () => {
    const modes = ["nocturnal","flying","ground"] as const;
    for (const mode of modes) {
      const kinds = SEASONS.map(s => wildlifeForSeason(s)[mode]);
      expect(new Set(kinds).size).toBe(4);
      for (const species of kinds) expect(["fox","bunny","bird"]).toContain(wildlifeMovementType(species));
    }
  });
  it("spawns the selected seasonal wildlife without changing gameplay stats", () => {
    for (const [night, season] of [[0,"autumn"],[7,"winter"],[14,"spring"],[21,"summer"]] as const) {
      const g = createEngine(); g.night = night; g.isNight = false; g.ui = "title";
      g.weather = "clear"; g.fireLit = true; g.fuel = 43;
      vi.spyOn(Math, "random").mockReturnValue(0.64);
      spawnEvent(g);
      expect(g.critters[0].species).toBe(wildlifeForSeason(season).ground);
      expect(g.fuel).toBe(43);
      vi.restoreAllMocks();
      g.critters = [];
      g.isNight = true; g.night = night + 1;
      vi.spyOn(Math, "random").mockReturnValue(0.3);
      spawnEvent(g);
      expect(g.critters[0].species).toBe(wildlifeForSeason(season).nocturnal);
      vi.restoreAllMocks();
    }
  });
  it("draws new creatures in the existing Canvas coordinate system", () => {
    const colors: string[] = [];
    const ctx: any = {
      set fillStyle(v: string) { colors.push(v); },
      fillRect(x: number, y: number, w: number, h: number) {
        expect([x,y,w,h].every(Number.isFinite)).toBe(true);
        expect(w).toBeGreaterThan(0);
      },
    };
    for (const species of ["squirrel","deer","frog","butterfly","dragonfly","crow","owl","robin","duck"]) {
      expect(drawSeasonalWildlife(ctx, {
        species, x: 100, y: 152, dir: 1, state: "sit", ph: 0
      }, { animT: 1 })).toBe(true);
    }
    expect(colors.length).toBeGreaterThan(10);
    expect(drawSeasonalWildlife(ctx, { species: "fox" }, {})).toBe(false);
  });
});
describe("smoother movement feedback and shoreline wash", () => {
  it("eases movement overlay in and out and retains 15 percent widths", () => {
    const g = createEngine(); g.pleft = true;
    updateAmbient(g, 0.1);
    expect(g.moveFeedbackLeft).toBeGreaterThan(0);
    const before = g.moveFeedbackLeft;
    const fills: any[] = [], stops: any[] = [];
    const ctx: any = {
      createLinearGradient: () => ({ addColorStop: (p: number, c: string) => stops.push([p,c]) }),
      set fillStyle(_v: any) {},
      fillRect: (...a: any[]) => fills.push(a),
    };
    drawMovementFeedback(ctx, g);
    expect(fills).toContainEqual([0,0,48,180]);
    expect(stops[0][1]).toContain("rgba(");
    expect(stops[1][1]).toContain(",0)");
    g.pleft = false; updateAmbient(g, 0.1);
    expect(g.moveFeedbackLeft).toBeLessThan(before);
  });
  it("limits moving water to a couple pixels and gives nonuniform foam", () => {
    const offsets = Array.from({length:100},(_,i)=>shorelineWaveOffset(i*0.13, 100+i*5, 1.28));
    expect(offsets.every(n => Number.isInteger(n) && Math.abs(n)<=2)).toBe(true);
    expect(new Set(offsets).size).toBeGreaterThan(2);
    const foam = Array.from({length:80},(_,i)=>shorelineFoam(i*0.05, i*8));
    expect(foam.some(n => n===0)).toBe(true);
    expect(foam.some(n => n>0.35)).toBe(true);
  });
});
