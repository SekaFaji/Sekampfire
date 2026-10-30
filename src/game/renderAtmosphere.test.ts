import { describe, expect, it, vi } from "vitest";
import {
  drawWoodlandSilhouettes, drawGroundAccents, drawSkyHaze, drawHorizonHaze,
} from "./renderAtmosphere";
import { drawMountainRange } from "./renderSprites";
import { visualPalette } from "./palette";

function canvas() {
  const rects: Array<{ x: number; y: number; w: number; h: number; color: string }> = [];
  const translations: Array<[number, number]> = [];
  const stops: Array<{ at: number; color: string }> = [];
  const paths: Array<[number, number]> = [];
  const count = { save: 0, restore: 0, gradients: 0, fills: 0, begins: 0 };
  let color: any = "";
  const ctx: any = {
    set fillStyle(c: any) { color = c; },
    get fillStyle() { return color; },
    globalAlpha: 1,
    fillRect(x: number, y: number, w: number, h: number) {
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
      rects.push({ x: Math.round(x), y: Math.round(y), w, h, color: typeof color === "string" ? color : "gradient" });
    },
    save() { count.save++; }, restore() { count.restore++; },
    translate(x: number, y: number) { translations.push([x,y]); },
    createLinearGradient() {
      count.gradients++;
      return { addColorStop(at: number, c: string) { stops.push({at,color:c}); } };
    },
    beginPath() { count.begins++; }, moveTo(x: number, y: number) { paths.push([x,y]); },
    lineTo(x: number, y: number) { paths.push([x,y]); },
    closePath() {}, fill() { count.fills++; },
  };
  return { ctx, rects, translations, stops, paths, count };
}

describe("deterministic wilderness silhouettes", () => {
  it("draws a mixed woodland with the same pixels for the same camera/season", () => {
    const a = canvas(), b = canvas();
    const random = vi.spyOn(Math, "random").mockImplementation(() => { throw Error("No random in draw"); });
    try {
      drawWoodlandSilhouettes(a.ctx, 160, 0.48, 138, "#4b7868", 22, 9, "spring");
      drawWoodlandSilhouettes(b.ctx, 160, 0.48, 138, "#4b7868", 22, 9, "spring");
      expect(a.rects).toEqual(b.rects);
      expect(a.rects.length).toBeGreaterThan(150);
      expect(a.count.save).toBe(a.count.restore);
      expect(a.translations).toEqual([[-77,0]]);
    } finally { random.mockRestore(); }
  });

  it("draws separate broadleaf winter branches rather than summer foliage", () => {
    const summer = canvas(), winter = canvas(), autumn = canvas();
    for (const [scene,season] of [[summer,"summer"],[winter,"winter"],[autumn,"autumn"]] as const) {
      drawWoodlandSilhouettes(scene.ctx, 0, 0.24, 138, "#577a82", 24, 3, season);
    }
    expect(summer.rects).not.toEqual(winter.rects);
    expect(summer.rects).not.toEqual(autumn.rects);
    expect(winter.rects.some(p => p.color === "#aab7c4" || p.color === "#abbac6")).toBe(true);
    expect(summer.rects.some(p => p.color === "#aab7c4")).toBe(false);
  });

  it("keeps parallax scene-local rather than moving gameplay objects", () => {
    const far = canvas(), near = canvas();
    drawWoodlandSilhouettes(far.ctx, 200, 0.24, 139, "#719c83", 24, 3, "spring");
    drawWoodlandSilhouettes(near.ctx, 200, 0.48, 138, "#4b7868", 22, 9, "spring");
    expect(far.translations[0]).toEqual([-48,0]);
    expect(near.translations[0]).toEqual([-96,0]);
    expect(far.rects.length).toBeGreaterThan(50);
    expect(near.rects.length).toBeGreaterThan(50);
  });
});

describe("sparse foreground details and atmospheric light", () => {
  it("does not plant reeds inside the central workbench/fire/pile corridor", () => {
    const a = canvas(), b = canvas();
    const colors = visualPalette({night:14,isNight:false,time:15});
    drawGroundAccents(a.ctx, 700, 2, colors);
    drawGroundAccents(b.ctx, 700, 2, colors);
    expect(a.rects).toEqual(b.rects);
    expect(a.rects.length).toBeGreaterThan(0);
    // World 740–820 is strictly inside reserved centre corridor.
    expect(a.rects.some(p => p.x >= 40 && p.x <= 120)).toBe(false);
  });

  it("has winter stems instead of spring blossoms and remains deterministic", () => {
    const winter = canvas(), spring = canvas();
    drawGroundAccents(winter.ctx, 0, 1.1, visualPalette({night:8,isNight:false,time:15}));
    drawGroundAccents(spring.ctx, 0, 1.1, visualPalette({night:15,isNight:false,time:15}));
    expect(winter.rects).not.toEqual(spring.rects);
    expect(winter.rects.every(p => p.w > 0 && p.h > 0)).toBe(true);
  });

  it("shows very gentle sky glow at dawn and dusk but not at bright midday", () => {
    const dawn = canvas(), dusk = canvas(), midday = canvas();
    drawSkyHaze(dawn.ctx, 0.06);
    drawSkyHaze(dusk.ctx, 0.54);
    drawSkyHaze(midday.ctx, 0.31);
    expect(dawn.count.gradients).toBe(1);
    expect(dusk.count.gradients).toBe(1);
    expect(midday.count.gradients).toBe(0);
    expect(dawn.rects[0]).toMatchObject({x:0,y:51,w:320,h:78});
    expect(dawn.stops).toHaveLength(3);
  });

  it("keeps horizon haze balanced and local to a 50px scenery band", () => {
    const scene = canvas();
    drawHorizonHaze(scene.ctx, visualPalette({night:0,isNight:false,time:14}), 0.3);
    expect(scene.rects).toEqual([{x:0,y:87,w:320,h:50,color:"gradient"}]);
    expect(scene.count.save).toBe(scene.count.restore);
    expect(scene.stops).toHaveLength(4);
    expect(scene.count.gradients).toBe(1);
  });

  it("uses jagged mountain shoulders and keeps all ridge points in place", () => {
    const m = canvas();
    drawMountainRange(m.ctx,[{x:10,w:100,h:55}], "#566777","#b9c7dd");
    expect(m.count.begins).toBe(3);
    expect(m.count.fills).toBe(3);
    expect(m.paths.length).toBeGreaterThan(15);
    expect(m.paths.every(([x,y])=>x>=10&&x<=110&&y>=0&&y<=130)).toBe(true);
  });
});
