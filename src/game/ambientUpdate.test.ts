import { afterEach, describe, expect, it, vi } from "vitest";
import { createEngine, spawnEvent as gameSpawnEvent, updateAmbient as gameUpdateAmbient } from "./game";
import { GRAPHICS } from "./graphics";
import { addStatusMessage } from "./statusMessages";
import { spawnEvent, updateAmbient } from "./ambientUpdate";

afterEach(() => vi.restoreAllMocks());

describe("extracted ambient updater", () => {
  it("retains the stable game exports for the Canvas loop", () => {
    expect(gameUpdateAmbient).toBe(updateAmbient);
    expect(gameSpawnEvent).toBe(spawnEvent);
  });

  it("updates active menu feedback, status queue, and HUD animation clocks", () => {
    const g = createEngine();
    g.ui = "title";
    g.menu = "settings";
    g.ashTapFx = 1;
    g.weatherBlend = 0.25;
    g.pleft = true;
    g.pright = false;
    addStatusMessage(g, "FIRST");
    addStatusMessage(g, "SECOND");
    updateAmbient(g, 0.5);
    expect(g.ashTapFx).toBeCloseTo(0.5);
    expect(g.weatherBlend).toBeCloseTo(0.3125);
    expect(g.moveFeedbackLeft).toBeGreaterThan(0);
    expect(g.moveFeedbackLeft).toBeLessThanOrEqual(1);
    expect(g.moveFeedbackRight).toBe(0);
    expect(g.toasts[0].life).toBeCloseTo(2.6);
    expect(g.toasts[1].life).toBeCloseTo(3.1);
    expect(g.eventCd).toBeCloseTo(5.5);
  });

  it("preserves half-second press-and-hold quick slot handling", () => {
    const g = createEngine();
    g.ui = "run";
    g.pointers = { 8: { quickSlot: 1, held: 0.49, longHeld: false, cancelled: false } };
    updateAmbient(g, 0.02);
    expect(g.pointers[8].longHeld).toBe(true);
    expect(g.menu).toBe("quickslot");
    expect(g.quickSlotIndex).toBe(1);
    expect(g.quickSlotFrom).toBe("run");
  });

  it("spawns original birds and schedules the next woodland event", () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const g = createEngine();
    g.ui = "run";
    g.isNight = false;
    g.eventCd = 0.1;
    updateAmbient(g, 0.2);
    expect(g.critters).toHaveLength(3);
    expect(g.critters.every((c: any) => c.type === "bird" && c.state === "fly")).toBe(true);
    expect(g.critters[0].vx).toBe(16);
    expect(g.critters[0].x).toBeCloseTo(g.camX - 24);
    expect(g.eventCd).toBe(16);
    expect(g.toasts.some((toast: any) => toast.text === "Birds cross the pale sky.")).toBe(true);
    expect(random).toHaveBeenCalled();
  });

  it("retains clear-night meteor events and the original status message", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const g = createEngine();
    g.ui = "run";
    g.isNight = true;
    g.weather = "clear";
    spawnEvent(g);
    expect(g.meteors).toEqual([{ x: 60, y: 8, vx: -70, vy: 34, life: 1 }]);
    expect(g.toasts.at(-1)?.text).toBe("A shooting star crosses the sky.");
    g.ui = "title";
    spawnEvent(g);
    expect(g.meteors).toHaveLength(2);
    expect(g.toasts).toHaveLength(1);
  });

  it("respects winter snow quality and clears snow outside winter", () => {
    const previous = GRAPHICS.high;
    try {
      const g = createEngine();
      g.night = 7;
      g.isNight = false;
      g.weather = "clear";
      g.previousWeather = "clear";
      GRAPHICS.high = true;
      updateAmbient(g, 0);
      expect(g.snow).toHaveLength(45);
      GRAPHICS.high = false;
      updateAmbient(g, 0);
      expect(g.snow).toHaveLength(25);
      g.night = 0;
      updateAmbient(g, 0);
      expect(g.snow).toHaveLength(0);
    } finally {
      GRAPHICS.high = previous;
    }
  });

  it("keeps original spark, smoke, footprint, and chip fade behavior", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const g = createEngine();
    g.fireLit = true;
    g.stage = 6;
    g.footprints = [{ x: 1, y: 2, life: 2 }];
    g.chips = [{ x: 4, y: 2, vx: 3, vy: 5, life: 1 }];
    updateAmbient(g, 0.5);
    expect(g.sparks.length).toBeGreaterThan(0);
    expect(g.smoke.length).toBeGreaterThan(0);
    expect(g.footprints).toHaveLength(0);
    expect(g.chips).toHaveLength(0); // life drops by dt * 2
    expect(g.shake).toBe(0);
  });
});
