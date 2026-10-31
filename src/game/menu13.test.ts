import { describe, expect, it, vi } from "vitest";
import { TUTORIAL_PAGES } from "./tutorial";
import { drawIllustratedGuide, drawShopTabs } from "./menuScreens";
import { createEngine, handleKey, titleActions } from "./game";

function canvas() {
  const rects: Array<{ x: number; y: number; w: number; h: number }> = [];
  let fill = "";
  const ctx: any = {
    set fillStyle(v: string) { fill = v; },
    get fillStyle() { return fill; },
    globalAlpha: 1, globalCompositeOperation: "source-over",
    fillRect: (x: number, y: number, w: number, h: number) => {
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      rects.push({ x,y,w,h });
    },
    save: vi.fn(), restore: vi.fn(), translate: vi.fn(), scale: vi.fn(),
    rotate: vi.fn(), beginPath: vi.fn(), rect: vi.fn(), clip: vi.fn(),
    createRadialGradient: () => ({ addColorStop: vi.fn() }),
  };
  return { ctx, rects };
}
function hit(g: any, x: number, y: number) {
  return [...g.zones].reverse().find((z: any) => x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h);
}

describe("seven illustrations of real beginner progression", () => {
  it("shows all beginner milestones without invented purchases", () => {
    expect(TUTORIAL_PAGES).toHaveLength(7);
    const all = TUTORIAL_PAGES.flatMap(x => [...x.lines]).join(" ");
    expect(all).toContain("FIVE");
    expect(all).toContain("15 LOGS");
    expect(all).toContain("WORKBENCH");
    expect(all).toContain("ASH");
  });
  it("renders real world sprites and allows paging back, next and exit", () => {
    const g = createEngine(); g.helpPage = 0; g.zones = [];
    const c = canvas(), close = vi.fn();
    drawIllustratedGuide(c.ctx, g, close);
    expect(c.rects.length).toBeGreaterThan(45);
    expect(hit(g, 260, 157)).toBeDefined();
    hit(g, 260, 157).onDown();
    expect(g.helpPage).toBe(1);
    g.zones = [];
    drawIllustratedGuide(c.ctx, g, close);
    hit(g, 48, 157).onDown();
    expect(g.helpPage).toBe(0);
    g.helpPage = 6; g.zones = [];
    drawIllustratedGuide(c.ctx, g, close);
    hit(g, 260, 157).onDown();
    expect(close).toHaveBeenCalledOnce();
  });
  it("supports keyboard navigation without moving the player", () => {
    const g = createEngine(); g.ui = "title"; g.menu = "help"; g.helpPage = 0;
    handleKey(g, { up: {} }, "d", true);
    expect(g.helpPage).toBe(1);
    expect(g.keys.right).not.toBe(true);
    handleKey(g, { up: {} }, "a", true);
    expect(g.helpPage).toBe(0);
    for (let i = 0; i < 6; i++) handleKey(g, { up: {} }, "enter", true);
    expect(g.helpPage).toBe(6);
    handleKey(g, { up: {} }, "enter", true);
    expect(g.menu).toBeNull();
  });
});

describe("the real Ash Shop and inert future tab", () => {
  it("preserves the same central title actions except for Shop name", () => {
    const g = createEngine(); g.resumeData = null;
    expect(titleActions(g, { ash: 30, up: {} }).map(a => a.label)).toEqual(["START RUN", "SHOP", "LOG MUSEUM", "SETTINGS"]);
    const row = titleActions(g, { ash: 30, up: {} })[1];
    row.act();
    expect(g.menu).toBe("shop");
    expect(g.shopTab).toBe(0);
  });
  it("changes tabs without touching Ash or buying anything", () => {
    const g = createEngine(); g.menu = "shop"; g.zones = [];
    const meta = { ash: 90, up: {} };
    const purchase = vi.fn();
    const c = canvas();
    drawShopTabs(c.ctx, g, meta, [{ label: "TEST UPGRADE", right: "10 ASH", desc: "A UPGRADE", enabled: true, onDown: purchase }], vi.fn());
    expect(hit(g, 60, 57)).toBeDefined();
    hit(g, 157, 39).onDown();
    expect(g.shopTab).toBe(1);
    expect(meta.ash).toBe(90);
    g.zones = [];
    drawShopTabs(c.ctx, g, meta, [], vi.fn());
    expect(hit(g, 60, 57)).toBeUndefined();
    expect(purchase).not.toHaveBeenCalled();
    handleKey(g, meta, "a", true);
    expect(g.shopTab).toBe(0);
  });
});
