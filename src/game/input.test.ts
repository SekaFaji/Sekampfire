import { describe, expect, it, vi } from "vitest";
import { createInputHandlers } from "./input";

function harness() {
  const g: any = {
    ui: "run", menu: null, keys: {}, pointers: {}, zones: [],
    pleft: false, pright: false, chopBlocked: false, pressE: false,
  };
  const actions = {
    audioRows: () => [],
    moveSel: vi.fn(), titleActions: () => [],
    activateSel: vi.fn(), closeMenu: vi.fn(),
    activateTitleItem: vi.fn(), startRun: vi.fn(),
    goEndless: vi.fn(), returnToMainMenu: vi.fn(),
  };
  return { g, actions, ...createInputHandlers(actions) };
}

describe("isolated input adapter", () => {
  it("supports simultaneous multi-touch and preserves remaining direction", () => {
    const { g, handlePointer } = harness();
    handlePointer(g, "down", 1, 12, 90);
    handlePointer(g, "down", 2, 280, 90);
    expect(g.pleft).toBe(true);
    expect(g.pright).toBe(true);
    handlePointer(g, "up", 1, 0, 0);
    expect(g.pleft).toBe(false);
    expect(g.pright).toBe(true);
    handlePointer(g, "up", 2, 0, 0);
    expect(g.pright).toBe(false);
  });
  it("uses existing hit-zones before starting movement", () => {
    const { g, handlePointer } = harness();
    const onDown = vi.fn();
    const onUp = vi.fn();
    g.zones.push({ x: 0, y: 10, w: 80, h: 20, onDown, onUp });
    handlePointer(g, "down", 3, 20, 15);
    expect(onDown).toHaveBeenCalledOnce();
    expect(g.pleft).toBe(false);
    handlePointer(g, "up", 3, 0, 0);
    expect(onUp).toHaveBeenCalledOnce();
  });
  it("clears the held action key on release", () => {
    const { g, handleKey } = harness();
    g.keys.act = true; g.chopBlocked = true;
    handleKey(g, {}, "e", false);
    expect(g.keys.act).toBe(false);
    expect(g.chopBlocked).toBe(false);
  });
});
