/** Cosmetic wildlife by seven-day season. Spawns do not change game balance,
 * collisions, rewards, wood, or saves. Critter "type" preserves legacy movement.
 */
export const SEASONAL_WILDLIFE = {
  autumn: { nocturnal: "fox", flying: "crow", ground: "squirrel" },
  winter: { nocturnal: "deer", flying: "owl", ground: "hare" },
  spring: { nocturnal: "frog", flying: "robin", ground: "rabbit" },
  summer: { nocturnal: "duck", flying: "dragonfly", ground: "butterfly" },
} as const;

export function wildlifeForSeason(season: string) {
  return SEASONAL_WILDLIFE[season as keyof typeof SEASONAL_WILDLIFE] ?? SEASONAL_WILDLIFE.autumn;
}
export function wildlifeMovementType(species: string): "fox" | "bunny" | "bird" {
  if (species === "fox" || species === "deer") return "fox";
  if (["squirrel", "hare", "rabbit", "frog"].includes(species)) return "bunny";
  return "bird";
}
