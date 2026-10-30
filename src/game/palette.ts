import { clamp } from "./math";
import { lerpHex } from "./renderUtils";

// ============ visual-only seasons ============
// Season and backdrop change the art, not warmth, weather odds, rewards or build costs.
// A day is complete after its night ends; don't change seasons halfway through a night.
export const DAYS_PER_SEASON = 7;
export const SEASONS = ["autumn", "winter", "spring", "summer"] as const;
export function seasonDay(g: any): number {
  return completedNights(g) % DAYS_PER_SEASON + 1;
}
export function seasonNumber(g: any): number {
  return Math.floor(completedNights(g) / DAYS_PER_SEASON) % SEASONS.length;
}
const SEASON_COLORS: Record<string, any> = {
  autumn: {
    ground:"#776a4d", ridge:"#a18c65", shore:"#625e4d", water:"#376477",
    treeLight:"#b3753b", treeDark:"#754b32", cap:"#d0a16b", trunk:"#63482f",
    far:"#727e72", near:"#53655e", hillFar:"#778b88", hillNear:"#66766e",
    mountain:"#566777", mountain2:"#495f65", snow:"#9fa8a7", sky:"#c0a57c", speckle:"#a99264",
  },
  winter: {
    ground:"#dbe4ee", ridge:"#c8d4e2", shore:"#849eaa", water:"#376b83",
    treeLight:"#3c7a44", treeDark:"#245a36", cap:"#e6eef6", trunk:"#6b4a32",
    far:"#577a82", near:"#345b65", hillFar:"#788fa1", hillNear:"#586c85",
    mountain:"#42506e", mountain2:"#313d5c", snow:"#b9c7dd", sky:"#a8c4dc", speckle:"#c4d2e2",
  },
  spring: {
    ground:"#64836a", ridge:"#91aa7d", shore:"#536f68", water:"#397b83",
    treeLight:"#62ac66", treeDark:"#2b7549", cap:"#a4c883", trunk:"#6b5038",
    far:"#719c83", near:"#4b7868", hillFar:"#7b9a99", hillNear:"#608c77",
    mountain:"#637b86", mountain2:"#486778", snow:"#abbec4", sky:"#9bbfbd", speckle:"#a8bf79",
  },
  summer: {
    ground:"#728851", ridge:"#a1aa68", shore:"#647358", water:"#356f83",
    treeLight:"#4b994f", treeDark:"#26623c", cap:"#81b45c", trunk:"#6a4d2f",
    far:"#6f9482", near:"#486f5d", hillFar:"#849d91", hillNear:"#678b75",
    mountain:"#5d7285", mountain2:"#495f75", snow:"#c9cecb", sky:"#a5c6d1", speckle:"#b4ad6e",
  },
};
function completedNights(g: any): number {
  return Math.max(0, g.night - (g.isNight ? 1 : 0));
}
function visualSeason(g: any): string {
  return SEASONS[seasonNumber(g)];
}
function visualPalette(g: any): any {
  const season = visualSeason(g);
  const current = SEASON_COLORS[season];
  const index = completedNights(g);
  // Only crossfade on the first dawn of each new seven-day season;
  // ordinary day/night changes never interpolate to an unrelated palette.
  if (index === 0 || index % DAYS_PER_SEASON !== 0) return { ...current, name: season };
  const previous = SEASONS[(seasonNumber(g) - 1 + SEASONS.length) % SEASONS.length];
  // Fade the environment into its new season over the opening seconds of daylight.
  const blend = clamp(g.time / 14, 0, 1);
  const old = SEASON_COLORS[previous];
  const out: any = { name: season };
  for (const k of Object.keys(current)) out[k] = lerpHex(old[k], current[k], blend);
  return out;
}

export { completedNights, visualSeason, visualPalette };
