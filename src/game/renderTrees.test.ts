import { describe, expect, it } from "vitest";
import { drawTree, drawFallingTree } from "./renderTrees";
import { drawFire } from "./renderSprites";
import { STAGES } from "./config";
import { createEngine, update } from "./game";

function canvas() {
  const rects: { x: number; y: number; w: number; h: number; color: string }[] = [];
  let color = "";
  const transforms = { saves: 0, restores: 0, rotates: 0 };
  const ctx: any = {
    set fillStyle(value: string) { color = value; },
    get fillStyle() { return color; },
    fillRect(x: number, y: number, w: number, h: number) {
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
      rects.push({ x: Math.round(x), y: Math.round(y), w, h, color });
    },
    save() { transforms.saves++; }, restore() { transforms.restores++; },
    translate(_x: number, _y: number) {}, rotate(_a: number) { transforms.rotates++; },
  };
  return { ctx, rects, transforms };
}

const palettes = {
  autumn: { name: "autumn", treeLight: "#b3753b", treeDark: "#754b32", cap: "#d0a16b", trunk: "#63482f" },
  winter: { name: "winter", treeLight: "#3c7a44", treeDark: "#245a36", cap: "#e6eef6", trunk: "#6b4a32" },
};

describe("pixel trees: original world anchors and readable tiers", () => {
  it("renders all nine variants at consistent roots with progressively larger crowns", () => {
    const sizes = new Map<number, number[]>();
    const signatures = new Map<number, Set<string>>();
    for (let tier = 0; tier < 3; tier++) {
      sizes.set(tier, []);
      signatures.set(tier, new Set());
      for (let variant = 0; variant < 3; variant++) {
        const { ctx, rects } = canvas();
        drawTree(ctx, { x: 100, y: 152, id: 12, tier, variant, hitT: 0 }, 1.2, 0, palettes.autumn);
        expect(rects.length).toBeGreaterThan(50);
        const bottom = Math.max(...rects.map(r => r.y + r.h));
        const top = Math.min(...rects.map(r => r.y));
        expect(bottom).toBe(152);
        const height = bottom - top;
        sizes.get(tier)!.push(height);
        signatures.get(tier)!.add(rects.map(r => [r.x,r.y,r.w,r.color].join(",")).join("|"));
      }
      expect(signatures.get(tier)!.size).toBe(3);
    }
    expect(Math.min(...sizes.get(0)!)).toBeGreaterThan(26);
    expect(Math.min(...sizes.get(1)!)).toBeGreaterThan(Math.max(...sizes.get(0)!));
    expect(Math.min(...sizes.get(2)!)).toBeGreaterThan(Math.max(...sizes.get(1)!));
  });
  it("uses snow caps only in winter, not in autumn", () => {
    const autumn = canvas(), winter = canvas();
    const t = { x: 100, y: 152, tier: 2, variant: 2, id: 13, hitT: 0 };
    drawTree(autumn.ctx, t, 2.0, 0, palettes.autumn);
    drawTree(winter.ctx, t, 2.0, 0, palettes.winter);
    expect(autumn.rects.some(r => r.color === palettes.winter.cap)).toBe(false);
    expect(winter.rects.filter(r => r.color === palettes.winter.cap).length).toBeGreaterThan(4);
  });
  it("is deterministic at fixed time and renders falling trees without unbalanced transforms", () => {
    const tree = { x: 180, y: 152, id: 4, variant: 1, tier: 1, hitT: 0, t: 0.3, dir: -1 };
    const a = canvas(), b = canvas();
    drawTree(a.ctx, tree, 2, 0.6, palettes.autumn);
    drawTree(b.ctx, tree, 2, 0.6, palettes.autumn);
    expect(a.rects).toEqual(b.rects);
    const fall = canvas();
    drawFallingTree(fall.ctx, tree, 2, palettes.autumn);
    expect(fall.transforms.rotates).toBe(1);
    expect(fall.transforms.saves).toBe(fall.transforms.restores);
    expect(fall.rects.length).toBeGreaterThan(50);
  });
});

describe("Wood Ring is a visual and naming update, not a balance change", () => {
  it("keeps 8-wood first-stage cost while describing timber windbreak", () => {
    expect(STAGES[0].name).toBe("Wood Ring");
    expect(STAGES[0].cost).toBe(8);
    expect(STAGES[0].desc.toLowerCase()).toContain("logs");
  });
  it("draws a wooden ring in stage 1 and none before it", () => {
    const plain = canvas(), ring = canvas();
    const state = { stage: 0, fireLit: false, everLit: false, sparks: [], fuel: 60, animT: 1 };
    drawFire(plain.ctx, state);
    drawFire(ring.ctx, { ...state, stage: 1 });
    expect(plain.rects.some(r => r.color === "#d6a46d")).toBe(false);
    expect(ring.rects.filter(r => r.color === "#d6a46d").length).toBeGreaterThanOrEqual(4);
    expect(ring.rects.some(r => r.color === "#9aa2ac")).toBe(false);
  });
  it("preserves stage-1 wind protection", () => {
    const simulate = (stage: number) => {
      const g = createEngine();
      g.ui = "run";
      g.time = 10;
      g.weather = "wind";
      g.fireLit = true;
      g.fuel = 90;
      g.stage = stage;
      update(g, { up: {} }, 0.1, { toast: () => {}, end: () => {} });
      return g.fuel;
    };
    expect(simulate(1)).toBeGreaterThan(simulate(0));
  });
});
