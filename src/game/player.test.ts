import { describe, expect, it } from "vitest";
import { drawPlayer } from "./renderSprites";

const makeCtx = () => {
  const pixels: { x: number; y: number; w: number; h: number; color: string }[] = [];
  const counts = { rotations: 0, saves: 0, restores: 0 };
  let color = "";
  const ctx: any = {
    set fillStyle(value: string) { color = value; },
    get fillStyle() { return color; },
    fillRect(x: number, y: number, w: number, h: number) {
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      pixels.push({ x, y, w, h, color });
    },
    save: () => { counts.saves++; },
    restore: () => { counts.restores++; },
    translate: (_x: number, _y: number) => {},
    scale: (_x: number, _y: number) => {},
    rotate: (_angle: number) => { counts.rotations++; }
  };
  return { ctx, pixels, counts };
};
function state() {
  return {
    animT: 0, night: 0, time: 10, isNight: false, longNightActive: false,
    weather: "clear", packTier: 0, toolTier: 0, crafts: {},
    player: { x: 100, y: 152, dir: 1, wood: 0, torchT: 0,
      chopT: 0, chopTime: 1, chopTree: null, moving: false }
  } as any;
}

describe("character states", () => {
  it("uses a camera-facing idle pose with a pair of visible eyes", () => {
    const v = makeCtx(); drawPlayer(v.ctx, state());
    const eyes = v.pixels.filter(p => p.color === "#241d23" && p.w === 1 && p.h === 1 && p.y === 133);
    expect(eyes.some(p => p.x === 98)).toBe(true);
    expect(eyes.some(p => p.x === 102)).toBe(true);
    expect(v.counts.rotations).toBe(0);
  });
  it("retains a visible eye on the left-moving side", () => {
    const v = makeCtx(); const g = state();
    g.player.dir = -1; g.player.moving = true;
    drawPlayer(v.ctx, g);
    expect(v.pixels.some(p => p.color === "#241d23" && p.x === 98 && p.y === 133)).toBe(true);
    expect(v.counts.rotations).toBe(0);
  });
  it("renders stick and proper axe heads only during a chop", () => {
    const stick = makeCtx(), axe = makeCtx();
    const g = state(); g.player.chopT = 0.5; g.player.chopTree = { id: 1 };
    drawPlayer(stick.ctx, g);
    g.toolTier = 1; drawPlayer(axe.ctx, g);
    expect(stick.counts.rotations).toBe(1);
    expect(axe.counts.rotations).toBe(1);
    expect(stick.pixels.some(p => p.color === "#91aab4")).toBe(false);
    expect(axe.pixels.some(p => p.color === "#91aab4")).toBe(true);
    expect(stick.counts.saves).toBe(stick.counts.restores);
    expect(axe.counts.saves).toBe(axe.counts.restores);
  });
});
