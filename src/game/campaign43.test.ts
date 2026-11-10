import { describe, it, expect, vi } from "vitest";
import { CX } from "./config";
import { createEngine, update } from "./game";
import { guideProgress, advanceGuide, GROOTY_X } from "./guide";
import { guideTarget } from "./guidance";
import { captureRunSnapshot } from "./save";
import {
  FIRST_SETTLEMENT, SCOUT_GROVE_X, SCOUT_GROVE_RADIUS,
  firstSettlementProgress, trackNightScout, drawScoutGrove,
} from "./campaign43";

const meta = () => ({ ash: 0, up: {}, guideFx: true, museumBuilt: false, collection: {} });
function run() {
  const g = createEngine();
  g.ui = "run";
  g.time = 12;
  g.trees = [];
  g.pickups = [];
  g.falling = [];
  return g;
}
function readyToScout() {
  const g = run();
  g.guideTalked = true;
  g.guideChops = 1;
  g.fenceLeft = true;
  g.fenceRight = true;
  g.everLit = true;
  g.guideStokes = 1;
  return g;
}

describe("Patch #43: first settlement campaign foundation", () => {
  it("names three campaign milestones without inventing an unlocked Level 2", () => {
    expect(FIRST_SETTLEMENT.level).toBe(1);
    expect(FIRST_SETTLEMENT.milestones.map(m => m.title)).toEqual([
      "ESTABLISH & EXPLORE", "LOG STORAGE", "THE WORKBENCH",
    ]);
    const g = run();
    for (let i = 0; i < 3; i++) {
      g.guideLevel = i;
      const p = firstSettlementProgress(g);
      expect(p.milestoneNumber).toBe(i + 1);
      expect(p.level).toBe(1);
    }
    g.guideLevel = 3;
    expect(firstSettlementProgress(g).milestone).toBeNull();
    expect(firstSettlementProgress(g).legacyCampChallenges).toBe(true);
  });

  it("introduces Grooty before chopping and requires visiting the actual NPC", () => {
    const g = run();
    expect(guideProgress(g).next?.id).toBe("talk-grooty");
    expect(guideTarget(g, meta())).toMatchObject({space:"world",x:GROOTY_X});
    g.player.x = GROOTY_X;
    g.pressE = true;
    update(g,meta(),0.02,{toast:vi.fn(),end:vi.fn()});
    expect(g.guideTalked).toBe(true);
    expect(guideProgress(g).next?.id).toBe("chop");
  });

  it("rejects daytime scouting and requires the camp to be established", () => {
    const g = readyToScout(), notify = vi.fn();
    g.player.x = SCOUT_GROVE_X;
    g.night = 1;
    trackNightScout(g,notify);
    expect(g.scoutVisited).toBe(false);
    g.isNight = true;
    g.fenceRight = false;
    trackNightScout(g,notify);
    expect(g.scoutVisited).toBe(false);
    g.fenceRight = true;
    g.guideStokes = 0;
    trackNightScout(g,notify);
    expect(g.scoutVisited).toBe(false);
    g.guideStokes = 1;
    g.player.x = SCOUT_GROVE_X + SCOUT_GROVE_RADIUS + 1;
    trackNightScout(g,notify);
    expect(g.scoutVisited).toBe(false);
    g.player.x = SCOUT_GROVE_X;
    trackNightScout(g,notify);
    expect(g.scoutVisited).toBe(true);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(g.scoutReturned).toBe(false);
  });

  it("guides to the grove at night then home; a missed night can be retried", () => {
    const g = readyToScout(), notices: string[] = [];
    expect(guideProgress(g).next?.id).toBe("scout-grove");
    expect(guideTarget(g,meta())).toBeNull(); // do not suggest waiting at the fire
    g.isNight = true;
    g.night = 1;
    expect(guideTarget(g,meta())).toMatchObject({space:"world",x:SCOUT_GROVE_X});
    g.player.x = SCOUT_GROVE_X;
    trackNightScout(g, msg => notices.push(msg));
    expect(guideProgress(g).next?.id).toBe("return-home");
    expect(guideTarget(g,meta())).toMatchObject({space:"world",x:CX});
    // Dawn without returning must NOT complete the milestone.
    g.isNight = false;
    advanceGuide(g,msg => notices.push(msg));
    expect(g.guideLevel).toBe(0);
    g.isNight = true;
    g.night = 2;
    g.player.x = CX;
    trackNightScout(g,msg => notices.push(msg));
    expect(guideProgress(g).next?.id).toBe("survive-night");
    g.isNight = false;
    advanceGuide(g,msg => notices.push(msg));
    expect(g.guideLevel).toBe(1);
    expect(firstSettlementProgress(g).milestoneNumber).toBe(2);
    expect(notices.some(n=>n.includes("MILESTONE 1/3"))).toBe(true);
  });

  it("persists the new flags in old-version run checkpoints without touching Ash", () => {
    const g = readyToScout();
    g.scoutVisited = true;
    g.scoutReturned = true;
    g.ashEarned = 19;
    const snap = captureRunSnapshot(g);
    expect(snap.version).toBe(1);
    expect(snap.state.guideTalked).toBe(true);
    expect(snap.state.scoutVisited).toBe(true);
    expect(snap.state.scoutReturned).toBe(true);
    expect(snap.state.ashEarned).toBe(19);
  });

  it("renders a bounded world landmark without adding touch zones", () => {
    const g = run(), shapes:any[] = [];
    const ctx = {fillStyle:"",fillRect:(x:number,y:number,w:number,h:number)=>{
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
      shapes.push({x,y,w,h});
    }};
    const oldZones = g.zones.length;
    drawScoutGrove(ctx,g);
    expect(shapes.length).toBeGreaterThan(7);
    expect(g.zones.length).toBe(oldZones);
    shapes.length = 0;
    g.guideLevel = 1;
    drawScoutGrove(ctx,g);
    expect(shapes).toHaveLength(0);
  });
});
