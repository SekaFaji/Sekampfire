import { afterEach, describe, expect, it, vi } from "vitest";
import { createEngine, drawScreen, renderReflectionSubjects, titleActions, handleKey } from "./game";
import { visualPalette } from "./palette";
import { drawPlayer } from "./renderSprites";

function canvas() {
  const rects: Array<{x: number; y: number; w: number; h: number; color: string; alpha: number}> = [];
  const translation: Array<[number, number]> = [];
  let color = "", alpha = 1;
  const ctx: any = {
    set fillStyle(c: string) { color = c; },
    get fillStyle() { return color; },
    set globalAlpha(a: number) { alpha = a; },
    get globalAlpha() { return alpha; },
    globalCompositeOperation: "source-over",
    fillRect(x: number, y: number, w: number, h: number) {
      expect([x, y, w, h].every(Number.isFinite)).toBe(true);
      rects.push({ x, y, w, h, color, alpha });
    },
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate(x: number, y: number) { translation.push([x, y]); },
    rotate: vi.fn(),
    scale: vi.fn(),
    createRadialGradient: () => ({ addColorStop: vi.fn() }),
  };
  return { ctx, rects, translation };
}

afterEach(() => vi.unstubAllGlobals());

describe("compact title and independent buttons", () => {
  it("shows run, Shop, Log Museum and Settings in the compact title selection", () => {
    const g = createEngine();
    const meta = { ash: 4, best: 5, up: {} };
    g.resumeData = null;
    expect(titleActions(g, meta).map(a => a.label)).toEqual(["START RUN", "SHOP", "LOG MUSEUM", "SETTINGS"]);
    g.resumeData = { time: 9 };
    expect(titleActions(g, meta).map(a => a.label)).toEqual(["CONTINUE RUN", "NEW RUN", "SHOP", "LOG MUSEUM", "SETTINGS"]);
  });
  it("routes the standalone tutorial and Discord/YouTube hit zones", () => {
    const open = vi.fn();
    vi.stubGlobal("window", { open });
    const g = createEngine();
    g.ui = "title"; g.zones = []; g.titleSel = 0; g.resumeData = null;
    const meta = { ash: 4, best: 5, up: {} };
    const v = canvas();
    drawScreen(v.ctx, g, meta);
    const hit = (x: number, y: number) => g.zones.find((z: any) =>
      x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h);
    expect(hit(243, 112)).toBeDefined();
    hit(243, 112).onDown();
    expect(g.menu).toBe("help");
    g.menu = null;
    handleKey(g, meta, "h", true);
    expect(g.menu).toBe("help");
    hit(18, 132).onDown();
    hit(18, 151).onDown();
    expect(open).toHaveBeenNthCalledWith(1, "https://discord.gg/794QQWJEeP", "_blank", "noopener,noreferrer");
    expect(open).toHaveBeenNthCalledWith(2, "https://youtube.com/@sekafajigames", "_blank", "noopener,noreferrer");
    expect(hit(160, 85)).toBeDefined();
    expect(hit(160, 146)).toBeDefined(); // final compact row now belongs to Settings
  });
});

describe("reflection subjects", () => {
  it("draws faint foreground woodland and visible shoreline animals", () => {
    const g = createEngine();
    g.trees = []; g.falling = []; g.dog = null; g.player.x = 1000;
    g.critters = [{ x: 80, y: 151, dir: 1, type: "fox", state: "watch", ph: 0 }];
    const v = canvas(), colors = visualPalette(g);
    renderReflectionSubjects(v.ctx, g, colors, 0);
    expect(v.rects.some(r => r.color === colors.near && r.alpha === 0.13)).toBe(true);
    expect(v.rects.some(r => r.color === "#c9703a")).toBe(true);
  });
  it("skips critters outside the camera range", () => {
    const g = createEngine();
    g.trees = []; g.falling = []; g.dog = null; g.player.x = 1000;
    g.critters = [{ x: 1200, y: 151, dir: 1, type: "fox", state: "watch", ph: 0 }];
    const v = canvas();
    renderReflectionSubjects(v.ctx, g, visualPalette(g), 0);
    expect(v.rects.some(r => r.color === "#c9703a")).toBe(false);
  });
});

describe("gripping-hand chopping animation", () => {
  it("moves the arm and axe pivot through windup and impact on both facings", () => {
    for (const dir of [-1, 1]) {
      const handPositions: Array<[number, number]> = [];
      for (const chopT of [0.66, 0.23]) {
        const g = createEngine();
        g.player.x = 100; g.player.y = 152; g.player.dir = dir;
        g.player.chopTime = 1; g.player.chopT = chopT;
        g.player.chopTree = { id: 1 }; g.player.moving = false;
        const v = canvas();
        drawPlayer(v.ctx, g);
        const hand = v.rects.find(r => r.color === "#dfac84" && r.w === 3 && r.h === 3);
        expect(hand).toBeDefined();
        const pivot = v.translation.at(-1);
        expect(pivot).toEqual([hand!.x + 1, hand!.y + 1]);
        handPositions.push([hand!.x, hand!.y]);
      }
      expect(handPositions[0]).not.toEqual(handPositions[1]);
      expect(handPositions[0][1]).toBeLessThan(handPositions[1][1]);
    }
  });
});
