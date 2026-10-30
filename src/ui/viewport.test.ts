import { describe, expect, it } from "vitest";
import { fitViewport } from "./viewport";

describe("safe viewport canvas fit", () => {
  it("uses the entire 16:9 landscape safe region", () => {
    expect(fitViewport(1600, 900)).toEqual({ width: 1600, height: 900 });
  });
  it("preserves aspect on ultra-wide devices", () => {
    expect(fitViewport(2400, 900)).toEqual({ width: 1600, height: 900 });
  });
  it("fits narrow and portrait screens without stretching", () => {
    expect(fitViewport(390, 840)).toEqual({ width: 390, height: 219 });
  });
  it("respects the desktop width cap in windowed mode", () => {
    expect(fitViewport(1800, 1000, 960)).toEqual({ width: 960, height: 540 });
  });
  it("never yields unusable dimensions", () => {
    const value = fitViewport(0, Number.NaN);
    expect(value.width).toBeGreaterThan(0);
    expect(value.height).toBeGreaterThan(0);
  });
});
