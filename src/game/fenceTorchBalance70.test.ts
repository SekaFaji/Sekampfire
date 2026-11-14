import { describe, expect, it, vi } from "vitest";
import { createEngine, update } from "./game";
import { CX, DAY_LEN } from "./config";
import { WEST_POST_X, EAST_POST_X, EAST_EXPANDED_X } from "./campBoundary";
import {
  FENCE_TORCH_DRAIN_REDUCTION, advanceCold, coldTarget, coldWarmthDrain,
} from "./cold";
import { protectedByFenceTorches, buildFenceTorch, advanceFenceTorchDawn } from "./fenceTorches47";

const meta = () => ({ ash: 0, up: {} as Record<string, number> });

function camp() {
  const g = createEngine();
  g.ui = "run";
  g.menu = null;
  g.over = false;
  g.keys = {};
  g.fenceLeft = true;
  g.fenceRight = true;
  g.player.x = CX;
  g.fireLit = false;
  g.fuel = 0;
  g.weather = "clear";
  g.previousWeather = "clear";
  g.weatherBlend = 1;
  g.isNight = true;
  g.night = 2;
  g.time = DAY_LEN + 5;
  g.cold = 40;
  g.dampness = 0;
  g.player.torchT = 0;
  g.trees = [];
  g.pickups = [];
  g.falling = [];
  return g;
}

describe("Patch #70: fence torches are partial shelter, never infinite Warmth", () => {
  it("halves Warmth drain under a single torch and linked posts without affecting outdoors", () => {
    const g = camp(), m = meta();
    expect(FENCE_TORCH_DRAIN_REDUCTION).toBe(0.5);
    g.player.x = WEST_POST_X;
    const baseline = coldWarmthDrain(g, m);
    expect(baseline).toBeGreaterThan(0);
    g.fenceTorches.left = 7;
    expect(protectedByFenceTorches(g)).toBe(true);
    expect(coldWarmthDrain(g, m)).toBeCloseTo(baseline * 0.5);
    g.player.x = CX;
    expect(protectedByFenceTorches(g)).toBe(false);
    expect(coldWarmthDrain(g, m)).toBeCloseTo(baseline);
    g.fenceTorches.right = 7;
    expect(protectedByFenceTorches(g)).toBe(true);
    expect(coldWarmthDrain(g, m)).toBeCloseTo(baseline * 0.5);
    g.player.x = EAST_POST_X + 55; // outside both lit post radii / claimed land
    expect(protectedByFenceTorches(g)).toBe(false);
    expect(coldWarmthDrain(g, m)).toBeCloseTo(baseline);
  });

  it("requires the real third torch to shelter the expanded camp and expires on dawn", () => {
    const g = camp(), m = meta();
    g.campExpansion = 1;
    g.fenceTorches.left = 7;
    g.fenceTorches.right = 7;
    g.player.x = EAST_POST_X + 60;
    const noOuter = coldWarmthDrain(g, m);
    expect(protectedByFenceTorches(g)).toBe(false);
    g.fenceTorches.outer = 1;
    expect(protectedByFenceTorches(g)).toBe(true);
    expect(coldWarmthDrain(g, m)).toBeCloseTo(noOuter * 0.5);
    expect(advanceFenceTorchDawn(g)).toContain("outer");
    expect(protectedByFenceTorches(g)).toBe(false);
    expect(coldWarmthDrain(g, m)).toBeCloseTo(noOuter);
    // A lit outer post never protects outside the claimed territory.
    g.fenceTorches.outer = 7;
    g.player.x = EAST_EXPANDED_X + 1;
    expect(protectedByFenceTorches(g)).toBe(false);
  });

  it("preserves weather exposure and dampness through shelter during rain", () => {
    const g = camp(), m = meta();
    g.weather = "rain";
    g.dampness = 20;
    g.cold = 50;
    g.fenceTorches.left = 7;
    g.fenceTorches.right = 7;
    expect(protectedByFenceTorches(g)).toBe(true);
    const target = coldTarget(g, m);
    expect(target).toBeGreaterThan(0);
    advanceCold(g, 1, m);
    expect(g.dampness).toBeGreaterThan(20);
    expect(g.cold).toBeGreaterThan(50);
    expect(coldWarmthDrain(g, m)).toBeGreaterThan(0);
    // Torches do not change the Cold exposure target or rain-wetting rates.
    g.fenceTorches.left = 0;
    g.fenceTorches.right = 0;
    expect(coldTarget(g, m)).toBeGreaterThan(target); // rain has made the player wetter
  });

  it("stacks multiplicatively with Warm Blood, a handheld torch, boots and cabin shelter", () => {
    const g = camp(), m = meta();
    m.up.blood = 2;
    g.player.torchT = 10;
    g.crafts.boots = true;
    g.stage = 6;
    g.cold = 80;
    const unprotected = coldWarmthDrain(g, m);
    expect(unprotected).toBeGreaterThan(0);
    g.fenceTorches.left = 7;
    g.fenceTorches.right = 7;
    expect(protectedByFenceTorches(g)).toBe(true);
    expect(coldWarmthDrain(g, m)).toBeCloseTo(unprotected * 0.5);
    expect(coldWarmthDrain(g, m)).toBeGreaterThan(0);
  });

  it("still loses actual Warmth and can die during a blizzard without a lit campfire", () => {
    const g = camp(), m = meta(), cb = { toast: vi.fn(), end: vi.fn() };
    g.night = 8;
    g.weather = "blizzard";
    g.previousWeather = "blizzard";
    g.cold = 85;
    g.player.warmth = 10;
    g.fenceTorches.left = 7;
    g.fenceTorches.right = 7;
    const before = g.player.warmth;
    update(g, m, 1, cb);
    expect(g.over).toBe(false);
    expect(g.player.warmth).toBeLessThan(before);
    expect(g.player.warmth).toBeGreaterThan(0);
    expect(g.fenceTorches.left).toBe(7);
    g.player.warmth = 0.01;
    update(g, m, 1, cb);
    expect(g.over).toBe(true);
    expect(cb.end).toHaveBeenCalledWith("dead", expect.objectContaining({ nights: 8 }));
  });

  it("communicates the new half-drain rule without changing the two-log torch cost", () => {
    const g = camp();
    g.player.x = WEST_POST_X;
    g.player.wood = 2;
    const message = buildFenceTorch(g, "left");
    expect(message).toContain("-50% WARMTH LOSS");
    expect(message).toContain("7 DAWNS");
    expect(g.player.wood).toBe(0);
    expect(g.fenceTorches.left).toBe(7);
  });
});
