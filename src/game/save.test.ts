import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureRunSnapshot, clearRunSnapshot, loadMeta, loadRunSnapshot, saveRunSnapshot } from "./save";

let saved: Map<string, string>;
beforeEach(() => {
  saved = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => saved.set(key, String(value)),
    removeItem: (key: string) => saved.delete(key),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("persistent progress", () => {
  it("does not crash on corrupt JSON", () => {
    saved.set("sekampfire-meta-v1", "not-json");
    expect(loadMeta()).toMatchObject({ ash: 0, runs: 0, wonEver: false });
  });
  it("clamps unsupported upgrade levels and negative currency", () => {
    saved.set("sekampfire-meta-v1", JSON.stringify({
      ash: -10, totalAsh: 36, runs: 2, up: { axe: 400, pack: 3 }
    }));
    const meta = loadMeta();
    expect(meta.ash).toBe(0);
    expect(meta.up.axe).toBe(1);
    expect(meta.up.pack).toBe(1);
  });
  it("retains the historical legacy save fallback", () => {
    saved.set("emberwood-meta-v2", JSON.stringify({ ash: 25, runs: 4 }));
    expect(loadMeta()).toMatchObject({ ash: 25, runs: 4 });
  });
});

describe("unfinished run checkpoints", () => {
  const run = () => ({
    ui: "run", over: false,
    time: 16, night: 1, weather: "wind", fuel: 44, fireLit: true,
    player: { x: 430, dir: -1, wood: 5, warmth: 60, torchT: 0 },
    trees: [{ x: 200, y: 147, id: 3, hp: 2, tier: 1, variant: 0 }],
    falling: [{ x: 250, y: 148, id: 4, tier: 0, variant: 1, wood: 2, t: 0.2, dir: 1 }],
    pickups: [{ x: 220, y: 150, w: 1 }], crafts: { boots: true }
  });
  it("captures saved trees and in-progress falling logs", () => {
    saveRunSnapshot(run());
    const restored = loadRunSnapshot();
    expect(restored?.player.wood).toBe(5);
    expect(restored?.trees[0].hp).toBe(2);
    expect(restored?.falling[0].wood).toBe(2);
  });
  it("never captures ended runs", () => {
    expect(captureRunSnapshot({ ...run(), ui: "win" })).toBeNull();
    expect(captureRunSnapshot({ ...run(), over: true })).toBeNull();
  });
  it("rejects an unrecognized version and oversized arrays", () => {
    saved.set("sekampfire-run-v1", JSON.stringify({ version: 2, state: run() }));
    expect(loadRunSnapshot()).toBeNull();
    saved.set("sekampfire-run-v1", JSON.stringify({ version: 1, state: { ...run(), trees: Array(151).fill({}) } }));
    expect(loadRunSnapshot()).toBeNull();
  });
  it("removes only the run checkpoint", () => {
    saved.set("sekampfire-meta-v1", '{"ash":10}');
    saveRunSnapshot(run());
    clearRunSnapshot();
    expect(loadRunSnapshot()).toBeNull();
    expect(saved.has("sekampfire-meta-v1")).toBe(true);
  });
});
