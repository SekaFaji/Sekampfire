import { describe, expect, it } from "vitest";
import { sideFootPoses, drawSideLegs } from "./playerLegs";
import { drawPlayer } from "./renderSprites";

type Mark = { x: number; y: number; w: number; h: number; color: string };
function fakeCanvas() {
  const marks: Mark[] = [];
  let color = "";
  const counts = { rotate: 0, save: 0, restore: 0 };
  const ctx: any = {
    set fillStyle(c: string) { color = c; },
    get fillStyle() { return color; },
    fillRect(x: number, y: number, w: number, h: number) {
      expect([x, y, w, h].every(Number.isFinite)).toBe(true);
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
      marks.push({ x: Math.round(x), y: Math.round(y), w, h, color });
    },
    save() { counts.save++; },
    restore() { counts.restore++; },
    translate() {},
    rotate() { counts.rotate++; },
    scale() {},
  };
  return { ctx, marks, counts };
}
function character(dir: 1 | -1, animT = Math.PI / 19, boots = false, logs = 0, bag = 0) {
  return {
    animT, night: 0, isNight: false, time: 10,
    weather: "clear", longNightActive: false, packTier: bag, toolTier: 0,
    crafts: { boots },
    player: { x: 100, y: 152, dir, wood: logs, torchT: 0,
      moving: true, chopT: 0, chopTime: 1, chopTree: null },
  } as any;
}

describe("directional footsteps at real 320x180 pixel coordinates", () => {
  it("mirrors both leg placements for left and right walking", () => {
    for (const phase of [0, Math.PI/2, Math.PI, 3*Math.PI/2]) {
      const right = sideFootPoses(100, 152, 1, phase, true);
      const left = sideFootPoses(100, 152, -1, phase, true);
      expect(right).toHaveLength(2);
      expect(left).toHaveLength(2);
      for (let i = 0; i < 2; i++) {
        expect(right[i].front).toBe(left[i].front);
        expect(right[i].heelX - 100).toBe(-(left[i].heelX - 100));
        expect(right[i].footY).toBe(left[i].footY);
      }
    }
  });

  it("points front and rear toes toward facing, even with crafted boots", () => {
    for (const boots of [false, true]) {
      for (const dir of [-1, 1] as const) {
        const v = fakeCanvas();
        drawSideLegs(v.ctx, 100, 152, dir, Math.PI / 2, true, boots);
        const color = boots ? "#946d46" : "#757078";
        const highlights = v.marks.filter(m => m.color === color);
        expect(highlights.length).toBeGreaterThan(0);
        // This unique toe-tip highlight must be OUTSIDE the centre of the
        // character on the side toward which the character walks.
        expect(highlights.some(m => dir === 1 ? m.x >= 105 : m.x <= 95)).toBe(true);
        // Dedicated darker far leg preserves foreground/background separation.
        expect(v.marks.some(m => m.color === (boots ? "#4b382e" : "#42404a"))).toBe(true);
      }
    }
  });

  it("alternates steps, lifts only the forward-striding leg and never moves the ground", () => {
    const a = sideFootPoses(100, 152, 1, Math.PI / 2, true);
    const b = sideFootPoses(100, 152, 1, Math.PI * 1.5, true);
    expect(a[1].footY).toBeLessThan(a[0].footY);
    expect(b[0].footY).toBeLessThan(b[1].footY);
    expect(a[1].heelX).toBeGreaterThan(b[1].heelX);
    const v = fakeCanvas();
    drawSideLegs(v.ctx, 100, 152, 1, Math.PI/2, true, true);
    const shadow = v.marks.find(m => m.color === "rgba(20,20,40,0.28)");
    expect(shadow).toMatchObject({ x:94, y:151, w:12, h:2 });
  });

  it("keeps the player-facing eye, backpack cargo and equipment in both directions", () => {
    for (const dir of [-1, 1] as const) {
      for (const [logs, bag] of [[0,0],[5,0],[13,1],[21,2]]) {
        const g = character(dir, Math.PI/19, true, logs, bag);
        const v = fakeCanvas();
        drawPlayer(v.ctx, g);
        const cargo = v.marks.filter(m => m.color === "#e1b97d");
        expect(cargo).toHaveLength(logs);
        const eyes = v.marks.filter(m => m.color === "#241d23" && m.w === 1 && m.h === 1);
        expect(eyes.length).toBeGreaterThan(0);
        expect(v.counts.rotate).toBe(0);
      }
    }
  });

  it("preserves the separate chopping hand and branch/axe swing for both facings", () => {
    for (const dir of [-1, 1] as const) {
      for (const tier of [0,1,2]) {
        const g = character(dir, 1.4, true, 5, 0);
        g.toolTier = tier;
        g.player.moving = false;
        g.player.chopTree = { id: 1 };
        g.player.chopT = 0.5;
        const v = fakeCanvas();
        drawPlayer(v.ctx, g);
        expect(v.counts.rotate).toBe(1);
        expect(v.counts.save).toBe(v.counts.restore);
        expect(v.marks.some(m => m.color === "#dfac84" && m.w === 3 && m.h === 3)).toBe(true);
        if (tier === 0) expect(v.marks.some(m => m.color === "#91aab4")).toBe(false);
        if (tier === 1) expect(v.marks.some(m => m.color === "#91aab4")).toBe(true);
        if (tier === 2) expect(v.marks.some(m => m.color === "#788b9b")).toBe(true);
      }
    }
  });

  it("keeps the front-facing idle pose unchanged instead of showing side-view shoes", () => {
    const g = character(1, 0);
    g.player.moving = false;
    const v = fakeCanvas();
    drawPlayer(v.ctx, g);
    expect(v.marks.filter(m => m.color === "#241d23" && m.w === 1 && m.h === 1))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ x: 98, y: 133 }),
        expect.objectContaining({ x: 102, y: 133 }),
      ]));
    expect(v.marks.some(m => m.color === "#757078")).toBe(false);
  });
});
