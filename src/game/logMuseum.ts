/** A small permanent collection, independent of carried/stored fuel wood.
 * This v1 museum has no Ash conversion or duplicate reward economy.
 */
export const MUSEUM_COST = 15;
export const MUSEUM_X = 900;
export const LOG_RELICS = [
  { id: "ordinary", name: "ORDINARY LOG", rarity: "COMMON", color: "#b9b8b6" },
  { id: "twisted", name: "TWISTED LOG", rarity: "UNCOMMON", color: "#83c4a2" },
  { id: "hand", name: "HAND LOG", rarity: "RARE", color: "#8dabdf" },
  { id: "eight", name: "FIGURE-EIGHT LOG", rarity: "LEGENDARY", color: "#eac279" },
] as const;
export type LogRelicId = typeof LOG_RELICS[number]["id"];
export type MuseumSave = { built: boolean; found: Record<LogRelicId, number> };
const count = (value: unknown) => typeof value === "number" && Number.isFinite(value)
  ? Math.max(0, Math.min(1000000, Math.floor(value))) : 0;

export function normalizeMuseum(source: any): MuseumSave {
  const found = {} as Record<LogRelicId, number>;
  for (const relic of LOG_RELICS) found[relic.id] = count(source?.found?.[relic.id]);
  return { built: source?.built === true, found };
}
export function museumFound(museum: MuseumSave): number {
  return LOG_RELICS.filter(log => museum.found[log.id] > 0).length;
}
export function museumHasBuilding(meta: any): boolean {
  return meta?.museum?.built === true;
}

/** One roll per successfully felled tree, only after constructing the museum.
 * Ten percent chance of a collectible; rarity within a successful roll:
 * 74% common, 20% uncommon, 5% rare and 1% legendary.
 */
export function rollLogRelic(random: () => number = Math.random): LogRelicId | null {
  if (random() >= 0.10) return null;
  const rarity = random();
  return rarity < 0.74 ? "ordinary"
    : rarity < 0.94 ? "twisted"
    : rarity < 0.99 ? "hand" : "eight";
}
export function addLogRelic(meta: any, id: LogRelicId): boolean {
  if (!museumHasBuilding(meta) || !LOG_RELICS.some(log => log.id === id)) return false;
  const museum = normalizeMuseum(meta.museum);
  museum.found[id] = Math.min(1000000, museum.found[id] + 1);
  meta.museum = museum;
  return true;
}
export function buildLogMuseum(g: any, meta: any): boolean {
  if (!meta?.wonEver || museumHasBuilding(meta)) return false;
  if (!g?.player || !Number.isFinite(g.player.wood) || !Number.isFinite(g.stored)) return false;
  if (g.player.wood < 0 || g.stored < 0 || g.player.wood + g.stored < MUSEUM_COST) return false;
  const carried = Math.min(g.player.wood, MUSEUM_COST);
  g.player.wood -= carried;
  g.stored -= MUSEUM_COST - carried;
  meta.museum = normalizeMuseum(meta.museum);
  meta.museum.built = true;
  return true;
}
