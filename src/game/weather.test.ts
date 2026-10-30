import { describe, expect, it } from "vitest";
import { weatherIntensity } from "./weather";

describe("visual weather transitions", () => {
  it("keeps previous weather while transitioning", () => {
    const g = { previousWeather: "rain", weather: "wind", weatherBlend: 0.4 };
    expect(weatherIntensity(g, "rain")).toBeCloseTo(0.6);
    expect(weatherIntensity(g, "wind")).toBeCloseTo(0.4);
    expect(weatherIntensity(g, "clear")).toBe(0);
  });
  it("settles entirely on current weather", () => {
    const g = { previousWeather: "rain", weather: "wind", weatherBlend: 1 };
    expect(weatherIntensity(g, "rain")).toBe(0);
    expect(weatherIntensity(g, "wind")).toBe(1);
  });
});
