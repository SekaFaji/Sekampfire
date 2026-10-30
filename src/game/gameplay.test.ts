import { describe, expect, it } from "vitest";
import { createEngine, update, handleKey } from "./game";

const meta = { up: {} };
const callbacks = { toast: (_message: string) => {}, end: () => {} };

function choppingRun() {
  const g = createEngine();
  g.ui = "run";
  g.time = 10;
  // Test woodland chopping away from the pit/bench/pile interaction zones.
  g.player.x = 300;
  const tr = { x: g.player.x + 8, y: 152, tier: 0, id: 999, variant: 0, hp: 3, hitT: 0 };
  g.trees = [tr];
  g.player.chopTree = tr;
  g.player.chopTime = 1;
  g.player.chopT = 0.5;
  g.keys.act = true;
  return { g, tr };
}

describe("chopping and movement", () => {
  it("moves immediately, cancels an unfinished hit and blocks held ACT", () => {
    const { g, tr } = choppingRun();
    const startX = g.player.x;
    g.keys.right = true;
    update(g, meta, 0.016, callbacks);
    expect(g.player.x).toBeGreaterThan(startX);
    expect(g.player.chopT).toBe(0);
    expect(g.player.chopTree).toBeNull();
    expect(tr.hp).toBe(3);
    expect(g.chopBlocked).toBe(true);
    g.keys.right = false;
    update(g, meta, 0.016, callbacks);
    expect(g.player.chopT).toBe(0);
    g.keys.act = false;
    update(g, meta, 0.016, callbacks);
    expect(g.chopBlocked).toBe(false);
    g.keys.act = true;
    g.pressE = true;
    update(g, meta, 0.016, callbacks);
    expect(g.player.chopT).toBeGreaterThan(0);
  });

  it("preserves completed chop damage before a later movement cancellation", () => {
    const { g, tr } = choppingRun();
    g.keys.act = false;
    g.player.chopT = 0.005;
    update(g, meta, 0.016, callbacks);
    expect(tr.hp).toBe(2);
    g.pleft = true;
    update(g, meta, 0.016, callbacks);
    expect(g.player.chopT).toBe(0);
    expect(tr.hp).toBe(2);
  });
});

describe("completed runs: main menu navigation", () => {
  for (const outcome of ["dead", "win"] as const) {
    it(`returns from ${outcome} to the main title without banking ash again`, () => {
      const g = createEngine();
      g.ui = outcome;
      g.lastResult = { kind: outcome, ash: 12, nights: 3 };
      const bank = { ash: 42, up: {} };
      handleKey(g, bank, "m", true);
      expect(g.ui).toBe("title");
      expect(g.menu).toBeNull();
      expect(g.titleSel).toBe(0);
      expect(bank.ash).toBe(42);
      expect(g.resumeData).toBeNull();
    });
  }
});
