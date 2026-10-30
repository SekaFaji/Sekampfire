import { clamp } from "./math";

// Visual weather crossfades are independent from gameplay/weather balance.
function weatherIntensity(g: any, type: string): number {
  const t = clamp(g.weatherBlend, 0, 1);
  return (g.previousWeather === type ? 1 - t : 0) + (g.weather === type ? t : 0);
}

export { weatherIntensity };
