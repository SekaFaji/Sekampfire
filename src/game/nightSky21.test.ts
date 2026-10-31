import { describe, expect, it } from "vitest";
import { rollNightSkyEvent, drawNightSkyEvent, updateShootingStarParade } from "./nightSky";
import { createEngine, update, updateAmbient } from "./game";

function painter() {
  const marks: Array<{ x: number, y: number, w: number, h: number, color: string }> = [];
  let color = "";
  const ctx: any = {
    set fillStyle(v: string) { color = v; }, get fillStyle() { return color; },
    globalCompositeOperation: "source-over",
    fillRect(x: number, y: number, w: number, h: number) {
      expect([x,y,w,h].every(Number.isFinite)).toBe(true);
      marks.push({x,y,w,h,color});
    },
    save() {}, restore() {}, beginPath() {}, rect() {}, clip() {},
  };
  return { ctx, marks };
}
describe("new nighttime sky spectacles", () => {
  it("rolls exactly a one in five aurora chance independent of weather", () => {
    expect(rollNightSkyEvent(() => 0)).toBe("aurora");
    expect(rollNightSkyEvent(() => 0.199999)).toBe("aurora");
    expect(rollNightSkyEvent(() => 0.20)).not.toBe("aurora");
    const all = Array.from({length:100},(_,i)=>rollNightSkyEvent(()=>i/100));
    expect(all.filter(v=>v==="aurora")).toHaveLength(20);
  });
  it("rolls a separate rarer meteor parade after aurora checks", () => {
    let i=0;
    expect(rollNightSkyEvent(()=>[0.4,0.05][i++])).toBe("parade");
    i=0;
    expect(rollNightSkyEvent(()=>[0.6,0.9][i++])).toBe("none");
  });
  it("creates visible post-mask aurora ribbons, not the former near-transparent columns", () => {
    const g=createEngine(); g.isNight=true;g.nightSkyEvent="aurora";g.aurora=true;
    const v=painter();drawNightSkyEvent(v.ctx,g,0.76);
    const ribbons=v.marks.filter(m=>m.color.includes("72,238,176"));
    expect(ribbons.length).toBeGreaterThan(50);
    expect(ribbons.some(m=>m.color.includes("0.170"))).toBe(true);
    expect(v.marks.every(m=>m.x>=0 && m.y>=0 && m.x<320)).toBe(true);
    const day=painter();g.isNight=false;drawNightSkyEvent(day.ctx,g,0.8);
    expect(day.marks).toHaveLength(0);
  });
  it("sustains shooting stars throughout an entire parade night with cap", () => {
    const g=createEngine();g.isNight=true;g.nightSkyEvent="parade";
    g.paradeTimer=0;g.meteors=[];
    for(let sec=0;sec<32;sec++) {
      updateShootingStarParade(g,1,()=>0.5);
      expect(g.meteors.length).toBeLessThanOrEqual(25);
    }
    expect(g.meteors.length).toBe(25);
    const v=painter();drawNightSkyEvent(v.ctx,g,0.78);
    expect(v.marks.some(m=>m.color.includes("242,247,255"))).toBe(true);
    g.isNight=false;const old=g.meteors.length;
    updateShootingStarParade(g,4,()=>0.3);
    expect(g.meteors.length).toBe(old);
  });
  it("does not overlap Long Night blizzard spectacle or spawn daytime stars", () => {
    const g=createEngine();g.isNight=true;g.longNightActive=true;g.nightSkyEvent="parade";
    updateShootingStarParade(g,1,()=>0.5);
    expect(g.meteors).toHaveLength(0);
  });
});
